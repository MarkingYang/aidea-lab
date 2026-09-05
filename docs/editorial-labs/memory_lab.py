"""Deterministic memory-scope/time/budget demonstration; no vector search or LLM."""

from dataclasses import dataclass, replace
from datetime import date
import json


@dataclass(frozen=True)
class Memory:
    id: str
    tenant: str
    user: str
    key: str
    value: str
    valid_from: str
    valid_to: str | None
    source_ref: str
    active: bool = True


FACTS = [
    Memory("sh", "team-a", "alice", "city", "上海", "2026-01-01", "2026-06-01", "s1/m1"),
    Memory("hz", "team-a", "alice", "city", "杭州", "2026-06-01", None, "s2/m1"),
    Memory("other", "team-b", "alice", "city", "北京", "2026-01-01", None, "s3/m1"),
]


def assemble(memories, *, tenant, user, as_of, budget_chars, revoked_ids=()):
    """Return eligible facts within a character budget, including provenance.

    tenant/user must come from trusted authentication in a real service. This
    demo does not authenticate callers, delete database rows, or manage caches.
    valid_to is exclusive; overlapping single-value facts fail as ambiguous.
    """
    if not tenant or not user:
        raise ValueError("trusted identity is required")
    if type(budget_chars) is not int or budget_chars < 0:
        raise ValueError("budget_chars must be a non-negative integer")
    when = date.fromisoformat(as_of)
    candidates = {}
    for item in memories:
        if item.tenant != tenant or item.user != user:
            continue
        if not item.active or item.id in revoked_ids:
            continue
        start = date.fromisoformat(item.valid_from)
        stop = date.fromisoformat(item.valid_to) if item.valid_to else None
        if stop is not None and stop <= start:
            raise ValueError("invalid validity interval")
        if start > when or (stop is not None and when >= stop):
            continue
        if not item.source_ref:
            raise ValueError("missing provenance")
        if item.key in candidates:
            raise ValueError("ambiguous overlapping facts; clarify or correct first")
        candidates[item.key] = item
    lines = []
    used = 0
    for key in sorted(candidates):
        item = candidates[key]
        line = f"{key}={item.value} [source:{item.source_ref}]"
        cost = len(line) + (1 if lines else 0)
        if used + cost <= budget_chars:
            lines.append(line)
            used += cost
    return "\n".join(lines)


if __name__ == "__main__":
    base = dict(tenant="team-a", user="alice", budget_chars=200)
    print(json.dumps({
        "january": assemble(FACTS, as_of="2026-01-15", **base),
        "september": assemble(FACTS, as_of="2026-09-05", **base),
        "revoked": assemble(FACTS, as_of="2026-09-05", revoked_ids={"hz"}, **base),
        "deleted": assemble([replace(x, active=False) if x.id == "hz" else x for x in FACTS],
                            as_of="2026-09-05", **base),
    }, ensure_ascii=False, indent=2))
