"""Single-worker execution-contract lab; no model, network, or real authorization."""
from __future__ import annotations

from dataclasses import asdict, dataclass
import hashlib
import json
from pathlib import Path
import sqlite3
import tempfile


def canonical(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


@dataclass(frozen=True)
class Action:
    source: str
    title: str
    tool: str = "create_review_ticket"


@dataclass(frozen=True)
class Context:
    tenant: str
    principal: str
    policy_version: int = 1
    allowed: bool = True


def approval_for(context: Context, run_id: str, action: Action) -> str:
    """Fingerprint only, NOT a signature or a token proving user consent."""
    return hashlib.sha256(canonical({
        "tenant": context.tenant, "principal": context.principal,
        "policy": context.policy_version, "run": run_id, "action": asdict(action),
    }).encode()).hexdigest()


class SimulatedCrash(RuntimeError):
    pass


class TicketService:
    """Separate DB stands in for a service with atomic idempotency and strong reads."""
    def __init__(self, path: Path):
        self.path = path
        with sqlite3.connect(path) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY, tenant TEXT NOT NULL, op_key TEXT NOT NULL,
                payload TEXT NOT NULL, UNIQUE(tenant, op_key))""")

    def create(self, tenant: str, op_key: str, action: Action) -> int:
        payload = canonical(asdict(action))
        with sqlite3.connect(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT id, payload FROM tickets WHERE tenant=? AND op_key=?",
                             (tenant, op_key)).fetchone()
            if row:
                if row[1] != payload:
                    raise ValueError("same operation key, different action")
                return row[0]
            cursor = db.execute("INSERT INTO tickets(tenant, op_key, payload) VALUES(?,?,?)",
                                (tenant, op_key, payload))
            return cursor.lastrowid

    def lookup(self, tenant: str, op_key: str) -> dict | None:
        with sqlite3.connect(self.path) as db:
            row = db.execute("SELECT id, payload FROM tickets WHERE tenant=? AND op_key=?",
                             (tenant, op_key)).fetchone()
        return {"id": row[0], "action": json.loads(row[1])} if row else None

    def count(self, tenant: str) -> int:
        with sqlite3.connect(self.path) as db:
            return db.execute("SELECT COUNT(*) FROM tickets WHERE tenant=?", (tenant,)).fetchone()[0]


class Harness:
    def __init__(self, path: Path, service: TicketService):
        self.path, self.service = path, service
        with sqlite3.connect(path) as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS runs (
                    tenant TEXT, run_id TEXT, contract TEXT NOT NULL,
                    state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY(tenant, run_id));
                CREATE TABLE IF NOT EXISTS events (
                    seq INTEGER PRIMARY KEY, tenant TEXT, run_id TEXT,
                    kind TEXT NOT NULL, detail TEXT NOT NULL);
            """)

    def snapshot(self, tenant: str, run_id: str) -> dict:
        with sqlite3.connect(self.path) as db:
            state, attempts = db.execute(
                "SELECT state, attempts FROM runs WHERE tenant=? AND run_id=?",
                (tenant, run_id)).fetchone()
            events = [row[0] for row in db.execute(
                "SELECT kind FROM events WHERE tenant=? AND run_id=? ORDER BY seq",
                (tenant, run_id))]
        return {"state": state, "attempts": attempts, "events": events}

    def _record(self, context: Context, run_id: str, state: str,
                kind: str, detail: str = "", spend: int = 0):
        with sqlite3.connect(self.path) as db:
            db.execute("UPDATE runs SET state=?, attempts=attempts+? WHERE tenant=? AND run_id=?",
                       (state, spend, context.tenant, run_id))
            db.execute("INSERT INTO events(tenant, run_id, kind, detail) VALUES(?,?,?,?)",
                       (context.tenant, run_id, kind, detail))

    def run(self, context: Context, run_id: str, action: Action, expected: Action,
            approval: str | None = None, max_attempts: int = 2,
            cancelled: bool = False, fault: str | None = None) -> dict:
        # expected belongs to the trusted task contract, not to the planner's output.
        if type(max_attempts) is not int or max_attempts < 0:
            raise ValueError("max_attempts must be a non-negative integer")
        contract = canonical({"principal": context.principal, "action": asdict(action),
                              "expected": asdict(expected), "max_attempts": max_attempts})
        with sqlite3.connect(self.path) as db:
            db.execute("INSERT OR IGNORE INTO runs(tenant,run_id,contract,state) VALUES(?,?,?,?)",
                       (context.tenant, run_id, contract, "ready"))
            saved = db.execute("SELECT contract FROM runs WHERE tenant=? AND run_id=?",
                               (context.tenant, run_id)).fetchone()[0]
            if saved != contract:
                raise ValueError("resume must preserve the original task and action")

        def record(state, kind, detail="", spend=0):
            self._record(context, run_id, state, kind, detail, spend)

        def result():
            return self.snapshot(context.tenant, run_id)

        def crash(point):
            if fault == point:
                raise SimulatedCrash(point)

        state = result()["state"]
        if state in {"succeeded", "failed", "cancelled", "budget_exhausted"}:
            return result()
        if not context.allowed:
            record("denied", "policy_denied")
            return result()
        if cancelled:
            # Cancellation after dispatch needs reconciliation, never a rollback claim.
            in_flight = "dispatch_prepared" in result()["events"]
            record("reconcile_required" if in_flight else "cancelled", "cancel_requested")
            return result()
        if "cancel_requested" in result()["events"]:
            ticket = self.service.lookup(context.tenant, run_id + ":ticket")
            record("cancelled", "cancellation_reconciled",
                   "existing ticket " + str(ticket["id"]) if ticket else "no ticket in this single-worker service")
            return result()
        if action.tool != "create_review_ticket" or not action.source or not action.title:
            record("failed", "invalid_action")
            return result()

        op_key = run_id + ":ticket"
        # Recovery inspects the actual resource BEFORE spending a new attempt.
        ticket = self.service.lookup(context.tenant, op_key)
        if ticket is not None:
            if ticket["action"] != asdict(action):
                record("failed", "operation_conflict", "stored action differs from prepared action")
                return result()
            record("verifying", "effect_reconciled", str(ticket["id"]))
        else:
            if approval != approval_for(context, run_id, action):
                record("waiting_approval", "approval_required")
                return result()
            if result()["attempts"] >= max_attempts:
                record("budget_exhausted", "budget_exhausted")
                return result()
            # Intent + attempt are atomically committed before crossing the service boundary.
            record("dispatching", "dispatch_prepared", canonical(asdict(action)), spend=1)
            crash("before_effect")
            try:
                ticket_id = self.service.create(context.tenant, op_key, action)
            except ValueError as error:
                record("failed", "operation_conflict", str(error))
                return result()
            crash("after_effect")
            record("verifying", "tool_result", str(ticket_id))
            crash("after_result")
            ticket = self.service.lookup(context.tenant, op_key)
        valid = ticket is not None and ticket["action"] == asdict(expected)
        record("verifying", "validation_passed" if valid else "validation_failed")
        crash("after_validation")
        record("succeeded" if valid else "failed", "task_succeeded" if valid else "task_failed")
        return result()


def demo():
    with tempfile.TemporaryDirectory(prefix="harness-lab-") as directory:
        root = Path(directory)
        service = TicketService(root / "tickets.sqlite")
        context = Context("knowledge-team", "reader")
        action = Action("source-001", "核验 Agent Harness 资料")
        args = (context, "review-001", action, action)
        harness = Harness(root / "runs.sqlite", service)
        try:
            harness.run(*args, approval=approval_for(context, "review-001", action), fault="after_effect")
        except SimulatedCrash:
            before = harness.snapshot(context.tenant, "review-001")
        resumed = Harness(root / "runs.sqlite", TicketService(root / "tickets.sqlite"))
        after = resumed.run(*args)
        print(json.dumps({"before": before, "after": after,
                          "actual_tickets": service.count(context.tenant)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    demo()
