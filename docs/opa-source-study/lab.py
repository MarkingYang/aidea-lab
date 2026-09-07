"""Real OPA CLI, bundles and loopback REST experiments; no business actions."""
import copy
import hashlib
import json
import os
import platform
import socket
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OPA = Path(os.environ.get("OPA_BIN", "./opa")).resolve()
SOURCES = json.loads((ROOT / "sources.json").read_text())
assert hashlib.sha256(OPA.read_bytes()).hexdigest() == SOURCES["binary"]["sha256"]
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))
RESULTS = []

def run(*args, stdin=None, check=True):
    p = subprocess.run([str(OPA), *map(str, args)], input=stdin, text=True,
                       capture_output=True, timeout=20)
    if check and p.returncode:
        raise AssertionError((args, p.returncode, p.stdout, p.stderr))
    return p

def evaluate(value, data, query="data.harness.authz.allow", bundle=None):
    args = ["eval", "--format=json", "--stdin-input"]
    args += ["--bundle", str(bundle)] if bundle else ["--data", str(ROOT / "policy.rego"), "--data", str(data)]
    p = run(*args, query, stdin=json.dumps(value))
    return json.loads(p.stdout)["result"][0]["expressions"][0]["value"]

def record(name, **details):
    RESULTS.append({"name": name, "passed": True, **details})

def main():
    version = run("version").stdout
    assert "Version: 1.20.2" in version
    base = {"subject": {"id": "alice", "tenant": "a", "authenticated": True},
            "task": {"id": "run-1", "tenant": "a", "resources": ["doc-1"], "actions": ["read", "write"]},
            "resource": {"id": "doc-1", "tenant": "a", "version": 3},
            "action": "read", "arguments": {"body": "draft"}, "now": 100}
    with tempfile.TemporaryDirectory(prefix="opa-harness-lab-") as td:
        tmp = Path(td)
        data = tmp / "data.json"
        data.write_text(json.dumps({"policy": {"revision": "r1", "read_enabled": True}}))
        assert evaluate(base, data) is True
        record("read_in_scope", allow=True)
        foreign = copy.deepcopy(base); foreign["resource"]["tenant"] = "b"
        foreign["arguments"]["claimed_tenant"] = "a"
        assert evaluate(foreign, data) is False
        record("foreign_resource_despite_claim", allow=False)
        missing = copy.deepcopy(base); del missing["subject"]["authenticated"]
        assert evaluate(missing, data) is False
        record("missing_authentication_fact", allow=False)
        write = copy.deepcopy(base); write["action"] = "write"
        assert evaluate(write, data) is False
        record("write_without_approval", allow=False)
        write["approval"] = {"verified": True, "approver": "bob", "expires_at": 120,
            "envelope": {"subject": "alice", "task": "run-1", "action": "write", "resource": "doc-1",
                         "resource_version": 3, "arguments": {"body": "draft"}, "policy_revision": "r1"}}
        assert evaluate(write, data) is True
        record("matching_host_supplied_approval", allow=True)
        changed = copy.deepcopy(write); changed["arguments"]["body"] = "different"
        assert evaluate(changed, data) is False
        record("changed_arguments", allow=False)
        expired = copy.deepcopy(write); expired["now"] = 120
        assert evaluate(expired, data) is False
        record("expired_approval", allow=False)
        old = copy.deepcopy(write); old["approval"]["envelope"]["policy_revision"] = "r0"
        assert evaluate(old, data) is False
        record("old_approval_revision", allow=False)

        bad = run("eval", "--format=json", "--data", ROOT / "pitfalls.rego", "--stdin-input",
                  "data.pitfalls", stdin=json.dumps({"action": "read", "subject": {"blocked": True}}))
        value = json.loads(bad.stdout)["result"][0]["expressions"][0]["value"]
        assert value["allow"] is True and value["deny"] == ["subject_blocked"]
        record("deny_name_has_no_precedence", allow=value["allow"], deny=value["deny"])
        conflict = run("eval", "--format=json", "--data", ROOT / "pitfalls.rego", "--stdin-input",
                       "data.pitfalls.conflict", stdin='{"left":true,"right":true}', check=False)
        errors = json.loads(conflict.stdout)["errors"]
        assert conflict.returncode != 0 and errors[0]["code"] == "eval_conflict_error"
        record("complete_rule_conflict", code=errors[0]["code"])

        bundle_results = []
        for revision, enabled in [("r1", True), ("r2", False)]:
            folder = tmp / revision; folder.mkdir()
            (folder / "policy.rego").write_bytes((ROOT / "policy.rego").read_bytes())
            (folder / "data.json").write_text(json.dumps({"policy": {"revision": revision, "read_enabled": enabled}}))
            (folder / ".manifest").write_text(json.dumps({"revision": revision, "roots": ["harness", "policy"]}))
            bundle = tmp / (revision + ".tar.gz")
            run("build", "--bundle", folder, "--output", bundle)
            allowed = evaluate(base, data, bundle=bundle)
            assert allowed is enabled
            bundle_results.append({"revision": revision, "allow": allowed})
        record("two_bundle_snapshots", decisions=bundle_results)

        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0)); port = sock.getsockname()[1]
        with (tmp / "server.log").open("w") as log:
            server = subprocess.Popen([str(OPA), "run", "--server", "--disable-telemetry",
                "--addr", f"127.0.0.1:{port}", "--log-level", "error", str(ROOT / "policy.rego"),
                str(ROOT / "pitfalls.rego"), str(data)], stdout=log, stderr=log)
            try:
                for _ in range(100):
                    if server.poll() is not None:
                        raise AssertionError((tmp / "server.log").read_text())
                    try:
                        OPENER.open(f"http://127.0.0.1:{port}/health", timeout=0.2).close(); break
                    except OSError:
                        time.sleep(0.05)
                else:
                    raise AssertionError("OPA server did not become ready")
                responses = []
                for path, value in [("harness/authz/allow", base), ("harness/authz/allow", missing), ("pitfalls/sometimes", {})]:
                    req = urllib.request.Request(f"http://127.0.0.1:{port}/v1/data/{path}",
                        data=json.dumps({"input": value}).encode(), headers={"Content-Type": "application/json"})
                    with OPENER.open(req, timeout=2) as response:
                        responses.append({"http": response.status, "body": json.load(response)})
                assert [r["http"] for r in responses] == [200, 200, 200]
                assert responses[0]["body"]["result"] is True
                assert responses[1]["body"]["result"] is False
                assert "result" not in responses[2]["body"]
                record("rest_allow_deny_undefined", responses=responses)
            finally:
                server.terminate()
                try: server.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    server.kill(); server.wait(timeout=5)
    output = {"opa_version": version.strip(), "platform": platform.system()+" "+platform.machine(),
        "binary_sha256": SOURCES["binary"]["sha256"], "cases": RESULTS,
        "limits": "Local CLI and loopback REST only. Host facts/approval are fixtures. No actual authentication, signatures, tool writes, sandbox, remote bundle update or distributed revocation tested."}
    (ROOT / "results.json").write_text(json.dumps(output, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps(output, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
