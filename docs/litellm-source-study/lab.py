"""Offline Router experiments; the provider boundary returns controlled responses."""
import os
os.environ["LITELLM_LOCAL_MODEL_COST_MAP"] = "True"
os.environ["LITELLM_LOG"] = "ERROR"

import asyncio
import hashlib
import importlib.metadata
import json
import platform
import socket
from pathlib import Path
from unittest.mock import patch

NETWORK_ATTEMPTS = []
def deny_network(sock, address):
    NETWORK_ATTEMPTS.append(str(address))
    raise RuntimeError("This experiment must not connect to the network")

socket.socket.connect = deny_network
socket.socket.connect_ex = deny_network

import litellm
from litellm import Router
from litellm.caching.dual_cache import DualCache

litellm.telemetry = False
ROOT = Path(__file__).resolve().parent
MESSAGES = [{"role": "user", "content": "Return OK"}]
PRIMARY = "openai/gpt-4o-mini"
BACKUP = "openai/gpt-4.1-mini"
LONG = "openai/gpt-4o"

def deployment(group, model, identifier, weight=1, blocked=False):
    return {"model_name": group,
            "litellm_params": {"model": model, "api_key": "offline-placeholder", "weight": weight},
            "model_info": {"id": identifier, "blocked": blocked}}

def router(models=None, **kwargs):
    return Router(model_list=models or [deployment("primary", PRIMARY, "p"),
                  deployment("backup", BACKUP, "b"), deployment("long", LONG, "l")],
                  num_retries=kwargs.pop("num_retries", 0), retry_after=0,
                  disable_cooldowns=True, routing_strategy="simple-shuffle", **kwargs)

def failure(model, context=False):
    cls = litellm.ContextWindowExceededError if context else litellm.InternalServerError
    return cls(message="Controlled offline failure", model=model, llm_provider="openai")

async def request_case(name, config, fail_when, expected_calls, expect_error=False, request=None):
    r = router(**config)
    calls = []
    async def provider(**kwargs):
        model = kwargs["model"]
        calls.append(model)
        kind = fail_when(model, len(calls))
        if kind:
            raise failure(model, context=kind == "context")
        return litellm.ModelResponse(model=model, choices=[{"index": 0,
            "message": {"role": "assistant", "content": "OK"}, "finish_reason": "stop"}],
            usage={"prompt_tokens": 1, "completion_tokens": 1, "total_tokens": 2})
    error = None
    try:
        with patch.object(litellm, "acompletion", provider):
            try:
                result = await r.acompletion(model="primary", messages=MESSAGES, **(request or {}))
                assert result.choices[0].message.content == "OK"
            except litellm.InternalServerError as exc:
                if not expect_error:
                    raise
                error = type(exc).__name__
        assert bool(error) == expect_error, (name, error)
        assert calls == expected_calls, (name, calls)
        return {"name": name, "calls": calls, "error": error, "passed": True}
    finally:
        await asyncio.sleep(0)
        r.reset()

async def main():
    assert importlib.metadata.version("litellm") == "1.100.0"
    sources = json.loads((ROOT / "sources.json").read_text())
    package_root = Path(litellm.__file__).resolve().parent.parent
    for item in sources["files"]:
        if item["path"].startswith("litellm/"):
            assert hashlib.sha256((package_root / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
    results = []
    r = router(models=[deployment("primary", PRIMARY, "zero", 0),
                       deployment("primary", BACKUP, "positive", 1)], model_group_alias={"public": "primary"})
    try:
        selected = await r.async_get_available_deployment(model="public", messages=MESSAGES, request_kwargs={})
        assert selected["model_info"]["id"] == "positive"
        results.append({"name": "alias_and_weight", "selected_id": "positive", "passed": True})
    finally:
        r.reset()
    r = router(models=[deployment("primary", PRIMARY, "a", 0), deployment("primary", BACKUP, "b", 0)])
    try:
        selected = await r.async_get_available_deployment(model="primary", messages=MESSAGES, request_kwargs={})
        assert selected["model_info"]["id"] in {"a", "b"}
        results.append({"name": "all_zero_weights", "selected_from": ["a", "b"], "passed": True})
    finally:
        r.reset()
    results.append(await request_case("same_group_retry", {"num_retries": 1},
        lambda m, n: "error" if n == 1 else None, [PRIMARY, PRIMARY]))
    results.append(await request_case("cross_group_fallback", {"fallbacks": [{"primary": ["backup"]}]},
        lambda m, n: "error" if m == PRIMARY else None, [PRIMARY, BACKUP]))
    results.append(await request_case("context_specific_fallback", {
        "fallbacks": [{"primary": ["backup"]}], "context_window_fallbacks": [{"primary": ["long"]}]},
        lambda m, n: "context" if m == PRIMARY else None, [PRIMARY, LONG]))
    results.append(await request_case("disable_fallbacks", {"fallbacks": [{"primary": ["backup"]}]},
        lambda m, n: "error", [PRIMARY], expect_error=True, request={"disable_fallbacks": True}))
    r = router(models=[deployment("primary", PRIMARY, "blocked", 100, True),
                       deployment("primary", BACKUP, "active", 1)])
    try:
        selected = await r.async_get_available_deployment(model="primary", messages=MESSAGES, request_kwargs={})
        assert selected["model_info"]["id"] == "active"
        results.append({"name": "blocked_deployment", "selected_id": "active", "passed": True})
    finally:
        r.reset()
    first, second = DualCache(), DualCache()
    first.set_cache("experiment-counter", 7)
    assert first.get_cache("experiment-counter") == 7
    assert second.get_cache("experiment-counter") is None
    results.append({"name": "isolated_memory_caches", "first": 7, "second": None, "passed": True})
    assert NETWORK_ATTEMPTS == [], NETWORK_ATTEMPTS
    output = {"package": "litellm==1.100.0", "python": platform.python_version(),
        "platform": platform.system() + " " + platform.machine(), "source_commit": sources["commit"],
        "network_attempts": NETWORK_ATTEMPTS, "cases": results,
        "limits": "Provider function is stubbed. No real LLM, HTTP transport, streaming, Redis, Proxy or billing integration tested."}
    (ROOT / "results.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(output, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
