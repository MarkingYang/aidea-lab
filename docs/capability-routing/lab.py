"""Offline teaching lab; no network, no credentials, no persistent writes.

This is token overlap + deterministic body reranking, NOT embeddings,
Cross-encoder inference, MCP/A2A integration, or a production benchmark.
"""
import argparse
import json
import time
from dataclasses import dataclass


@dataclass(frozen=True)
class Capability:
    id: str
    kind: str
    description: frozenset
    body: frozenset
    effects: frozenset = frozenset()
    tenant: str = "demo"
    version: str = "1.0"


CATALOG = (
    Capability("summary.skill", "skill",
               frozenset({"会议", "纪要"}),
               frozenset({"会议", "纪要", "讨论", "结论", "待办", "逐字稿"})),
    Capability("summary-send.skill", "skill",
               frozenset({"会议", "纪要"}),
               frozenset({"会议", "纪要", "分享", "群发"}),
               frozenset({"message.send"})),
    Capability("meeting-assistant.agent", "agent",
               frozenset({"会议", "助理"}),
               frozenset({"会议", "助理", "安排", "协作"})),
    Capability("document.create", "mcp_tool",
               frozenset({"文档", "创建"}),
               frozenset({"文档", "创建", "摘要"}),
               frozenset({"document.create"})),
    Capability("code.review", "mcp_tool",
               frozenset({"代码", "审查"}),
               frozenset({"代码", "审查", "测试"})),
    Capability("private.skill", "skill",
               frozenset({"秘密"}),
               frozenset({"秘密", "会议"}), tenant="private"),
)

DEFAULT_FORBIDDEN = frozenset({"message.send"})


def retrieve(query, *, use_body=False, tenant="demo", limit=5,
             forbidden=DEFAULT_FORBIDDEN, catalog=CATALOG):
    """Explicit whitespace tokens; no general Chinese NLP or negation parser."""
    terms = set(query.split())
    ranked = []
    for item in catalog:
        if item.tenant != tenant or item.effects & forbidden:
            continue
        fields = item.body | item.description if use_body else item.description
        score = len(terms & fields)
        if score:
            ranked.append({"id": item.id, "kind": item.kind,
                           "version": item.version, "score": score})
    return sorted(ranked, key=lambda row: (-row["score"], row["id"]))[:limit]


def rrf(rankings, k=60):
    if k <= 0:
        raise ValueError("k must be positive")
    scores = {}
    for ranking in rankings:
        for rank, item_id in enumerate(dict.fromkeys(ranking), start=1):
            scores[item_id] = scores.get(item_id, 0) + 1 / (k + rank)
    return sorted(scores, key=lambda item_id: (-scores[item_id], item_id))


def select(candidates):
    if not candidates:
        return {"status": "NO_MATCH", "scope": "completed_demo_catalog"}
    top = candidates[0]["score"]
    best = [item["id"] for item in candidates if item["score"] == top]
    if len(best) > 1:
        return {"status": "CLARIFY", "candidates": best}
    return {"status": "SELECT", "id": best[0]}


def body_rerank(query, candidate_ids, catalog):
    """Demonstrates information limits with word overlap, NOT a learned model."""
    terms = set(query.split())
    index = {item.id: item for item in catalog}
    ids = list(dict.fromkeys(candidate_ids))
    scores = {item_id: len(terms & index[item_id].body) for item_id in ids}
    return sorted(ids, key=lambda item_id: (-scores[item_id], item_id))


def execute(path, *, authorized=True, stale=False,
            forbidden=DEFAULT_FORBIDDEN, available=None):
    """Explicitly chosen adapters; deterministic simulated artifacts only."""
    if path not in {"skill", "mcp", "agent"}:
        raise ValueError("unknown execution path")
    trace = []
    def result(status, **extra):
        return {"mode": "simulation", "status": status, "path": path,
                "trace": trace, **extra}

    trace.append("read_pinned_definition")
    if stale:
        return result("BLOCKED", reason="definition_version_changed")
    needed = {"meeting.read", "document.create"} if path == "skill" else set()
    actual = needed if available is None else set(available)
    if not needed <= actual:
        return result("BLOCKED", reason="missing_dependencies",
                      missing=sorted(needed - actual))
    trace.append("final_policy_check")
    # Known effective effects of all three demo adapters. Real delegates
    # require their own enforcement; this local check does not constrain them.
    if "document.create" in forbidden:
        return result("BLOCKED", reason="document_write_forbidden")
    if not authorized:
        return result("NEEDS_AUTH", reason="document_write_requires_auth")

    if path == "skill":
        trace += ["load_skill", "mock_read_transcript", "mock_summarize",
                  "mock_create_document"]
    elif path == "mcp":
        trace += ["use_prepared_summary", "validate_mock_arguments",
                  "mock_create_document"]
    else:
        trace += ["delegate_minimal_mock_task", "mock_poll_result"]
    artifact = {
        "id": "mock-document-001",
        "content": "决策：继续试点；待办：项目负责人整理需求。",
        "acl": "private",
        "effects": ["document.create"],
    }
    assert artifact["acl"] == "private"
    assert not set(artifact["effects"]) & forbidden
    trace.append("verify_mock_content_and_acl")
    return result("DONE", artifact=artifact)


def evaluate():
    cases = [
        ("基础词项", "会议 纪要", False, "SELECT", "summary.skill"),
        ("摘要漏召回", "讨论 结论", False, "NO_MATCH", None),
        ("正文补充词项", "讨论 结论", True, "SELECT", "summary.skill"),
        ("确实无匹配", "烹饪", True, "NO_MATCH", None),
        ("候选并列", "会议", False, "CLARIFY", None),
        ("隔离其他租户", "秘密", True, "NO_MATCH", None),
    ]
    results = []
    for name, query, body, status, selected in cases:
        actual = select(retrieve(query, use_body=body))
        passed = actual["status"] == status and actual.get("id") == selected
        results.append({"case": name, "passed": passed, "actual": actual})
    return {"scope": "six_handwritten_contract_cases_not_accuracy_benchmark",
            "passed": sum(item["passed"] for item in results),
            "total": len(results), "results": results}


def scale(count):
    if not 10 <= count <= 100000:
        raise ValueError("count must be between 10 and 100000")
    distractors = tuple(
        Capability(f"distractor-{i}", "skill",
                   frozenset({f"类别-{i}"}), frozenset({f"类别-{i}"}))
        for i in range(count - len(CATALOG)))
    catalog = CATALOG + distractors
    started = time.perf_counter()
    candidates = retrieve("会议 纪要", catalog=catalog)
    elapsed = (time.perf_counter() - started) * 1000
    return {"catalog_entries": len(catalog), "query_ms": round(elapsed, 3),
            "candidates": candidates, "runs": 1,
            "scope": "synthetic_linear_scan_smoke_test_not_concurrency_or_quality"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    search = sub.add_parser("retrieve")
    search.add_argument("--query", required=True)
    search.add_argument("--body", action="store_true")
    sub.add_parser("fusion")
    sub.add_parser("evaluate")
    run = sub.add_parser("execute")
    run.add_argument("--path", choices=["skill", "mcp", "agent"], required=True)
    run.add_argument("--no-auth", action="store_true")
    run.add_argument("--stale", action="store_true")
    capacity = sub.add_parser("scale")
    capacity.add_argument("--count", type=int, default=10000)
    args = parser.parse_args()
    if args.command == "retrieve":
        rows = retrieve(args.query, use_body=args.body)
        output = {"candidates": rows, "decision": select(rows)}
    elif args.command == "fusion":
        ranks = [["summary.skill", "meeting-assistant.agent"],
                 ["meeting-assistant.agent", "summary.skill"]]
        output = {"fixed_rankings": ranks, "rrf": rrf(ranks),
                  "scope": "ranking_fusion_only_no_vector_model"}
    elif args.command == "execute":
        output = execute(args.path, authorized=not args.no_auth, stale=args.stale)
    elif args.command == "evaluate":
        output = evaluate()
    else:
        output = scale(args.count)
    print(json.dumps(output, ensure_ascii=False, indent=2))
    if args.command == "evaluate" and output["passed"] != output["total"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
