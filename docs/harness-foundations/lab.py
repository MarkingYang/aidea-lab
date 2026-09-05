"""Local concurrency + selected MCP lifecycle model, NOT an MCP SDK or server."""
from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import sqlite3
import tempfile
from threading import Barrier

VERSION = "2025-11-25"


class Store:
    """Real SQLite effects. Each operation opens an independent connection."""
    def __init__(self, path: Path):
        self.path = path
        with sqlite3.connect(path) as db:
            db.executescript("""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY, version INTEGER NOT NULL, body TEXT NOT NULL);
                INSERT OR IGNORE INTO documents VALUES ('source-001', 1, 'original');
                CREATE TABLE IF NOT EXISTS tickets (
                    id INTEGER PRIMARY KEY, op_key TEXT UNIQUE NOT NULL, source TEXT NOT NULL);
            """)

    def read_document(self) -> tuple[int, str]:
        with sqlite3.connect(self.path) as db:
            return db.execute("SELECT version, body FROM documents WHERE id='source-001'").fetchone()

    def update_document(self, expected_version: int, body: str) -> bool:
        with sqlite3.connect(self.path) as db:
            cursor = db.execute("""UPDATE documents SET body=?, version=version+1
                WHERE id='source-001' AND version=?""", (body, expected_version))
            return cursor.rowcount == 1

    def create_ticket(self, op_key: str, source: str) -> int:
        with sqlite3.connect(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            existing = db.execute("SELECT id, source FROM tickets WHERE op_key=?", (op_key,)).fetchone()
            if existing:
                if existing[1] != source:
                    raise ValueError("operation key already belongs to different parameters")
                return existing[0]
            return db.execute("INSERT INTO tickets(op_key,source) VALUES (?,?)", (op_key, source)).lastrowid

    def ticket(self, op_key: str) -> tuple[int, str] | None:
        with sqlite3.connect(self.path) as db:
            return db.execute("SELECT id, source FROM tickets WHERE op_key=?", (op_key,)).fetchone()

    def ticket_count(self) -> int:
        with sqlite3.connect(self.path) as db:
            return db.execute("SELECT COUNT(*) FROM tickets").fetchone()[0]


class SessionModel:
    """Pure state model exchanging Python dictionaries, with no actual transport.

    Request IDs correlate responses; operation keys belong to the application.
    Requiring a fresh catalogue before tools/call is this lab's policy, not MCP MUST.
    """
    def __init__(self):
        self.epoch = 0
        self.sequence = 0
        self.state = "new"
        self.capabilities = {}
        self.pending = {}
        self.uncertain_operations = set()
        self.catalog_revision = 0
        self.catalog_valid = False
        self.events = []

    def _request(self, method, params, operation_key=None):
        self.sequence += 1
        request_id = f"{self.epoch}:{self.sequence}"
        self.pending[request_id] = {
            "method": method, "operation_key": operation_key,
            "catalog_revision": self.catalog_revision,
        }
        self.events.append(("request", request_id))
        return {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}

    def initialize(self):
        if self.state not in {"new", "disconnected"}:
            raise ValueError("connection already initializing or ready")
        self.epoch += 1
        self.state = "initializing"
        self.capabilities = {}
        self.catalog_valid = False
        return self._request("initialize", {
            "protocolVersion": VERSION, "capabilities": {},
            "clientInfo": {"name": "contract-lab", "version": "1.0"},
        })

    def initialized(self):
        if self.state != "awaiting_initialized":
            raise ValueError("version negotiation must finish first")
        self.state = "ready"
        return {"jsonrpc": "2.0", "method": "notifications/initialized"}

    def request(self, method, params=None, operation_key=None):
        if self.state != "ready":
            raise ValueError("normal requests require initialized connection")
        if method not in {"tools/list", "tools/call"}:
            raise ValueError("method outside the lab's supported subset")
        if "tools" not in self.capabilities:
            raise ValueError("server did not advertise tools")
        if method == "tools/call" and not self.catalog_valid:
            raise ValueError("lab policy requires a fresh tool catalogue")
        return self._request(method, params or {}, operation_key)

    def receive(self, message):
        if message.get("jsonrpc") != "2.0":
            raise ValueError("invalid JSON-RPC version")
        if "method" in message:
            if "id" in message:
                raise ValueError("server requests are outside this lab's subset")
            if (message["method"] == "notifications/tools/list_changed"
                    and self.capabilities.get("tools", {}).get("listChanged")):
                self.catalog_revision += 1
                self.catalog_valid = False
                return "catalog_invalidated"
            return "notification_ignored"
        if "id" not in message or ("result" in message) == ("error" in message):
            raise ValueError("response needs id and exactly one of result/error")
        request_id = message["id"]
        request = self.pending.pop(request_id, None)
        if request is None:
            self.events.append(("ignored_response", request_id))
            return "ignored_response"
        method = request["method"]
        if "error" in message:
            if method == "initialize":
                self.state = "disconnected"
            if request["operation_key"]:
                self.uncertain_operations.add(request["operation_key"])
            return "protocol_error"
        result = message["result"]
        if not isinstance(result, dict):
            self.disconnect()
            if request["operation_key"]:
                self.uncertain_operations.add(request["operation_key"])
            raise ValueError("lab methods require object results")
        if method == "initialize":
            if result.get("protocolVersion") != VERSION:
                self.state = "disconnected"
                raise ValueError("unsupported negotiated protocol version")
            self.capabilities = result.get("capabilities", {})
            self.state = "awaiting_initialized"
            return "negotiated"
        if method == "tools/list":
            self.catalog_valid = request["catalog_revision"] == self.catalog_revision
            return "catalog_received" if self.catalog_valid else "stale_catalog"
        if result.get("isError"):
            if request["operation_key"]:
                self.uncertain_operations.add(request["operation_key"])
            return "tool_error"
        return "tool_result_received"

    def cancel(self, request_id):
        request = self.pending.get(request_id)
        if request is None:
            return None
        if request["method"] == "initialize":
            raise ValueError("initialize must not be cancelled")
        self.pending.pop(request_id)
        if request["operation_key"]:
            self.uncertain_operations.add(request["operation_key"])
        self.events.append(("cancel_requested", request_id))
        return {"jsonrpc": "2.0", "method": "notifications/cancelled",
                "params": {"requestId": request_id, "reason": "lab cancellation"}}

    def disconnect(self):
        self.uncertain_operations.update(
            p["operation_key"] for p in self.pending.values() if p["operation_key"])
        self.pending.clear()
        self.catalog_valid = False
        self.state = "disconnected"


def response(request, result):
    return {"jsonrpc": "2.0", "id": request["id"], "result": result}


def ready(session):
    request = session.initialize()
    session.receive(response(request, {"protocolVersion": VERSION, "capabilities": {"tools": {"listChanged": True}}}))
    session.initialized()
    listing = session.request("tools/list")
    session.receive(response(listing, {"tools": [{"name": "create_review_ticket",
        "inputSchema": {"type": "object", "properties": {"source": {"type": "string"}}}}]}))


def demo():
    with tempfile.TemporaryDirectory(prefix="harness-foundations-") as directory:
        store = Store(Path(directory) / "service.sqlite")
        barrier = Barrier(2)

        def writer(body):
            version, _ = store.read_document()
            barrier.wait(timeout=5)
            return store.update_document(version, body)

        with ThreadPoolExecutor(max_workers=2) as pool:
            writes = list(pool.map(writer, ["draft-a", "draft-b"]))
        session = SessionModel()
        ready(session)
        request = session.request("tools/call", {"name": "create_review_ticket",
            "arguments": {"source": "source-001"}}, operation_key="review-001:ticket")
        ticket_id = store.create_ticket("review-001:ticket", "source-001")
        session.disconnect()  # Drop the response after the real SQLite commit.
        ready(session)
        late = session.receive(response(request, {"content": [{"type": "text", "text": str(ticket_id)}]}))
        print(json.dumps({"concurrent_updates_accepted": sum(writes),
            "document_version": store.read_document()[0],
            "late_response": late,
            "needs_reconciliation": sorted(session.uncertain_operations),
            "actual_ticket": store.ticket("review-001:ticket"),
            "actual_ticket_count": store.ticket_count()}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    demo()
