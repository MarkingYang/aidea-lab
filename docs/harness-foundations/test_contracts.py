from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import tempfile
from threading import Barrier
import unittest

from lab import VERSION, SessionModel, Store, ready, response


class ConcurrencyContracts(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.store = Store(Path(self.directory.name) / "service.sqlite")

    def test_two_readers_cannot_overwrite_the_same_version(self):
        barrier = Barrier(2)
        def update(body):
            version, _ = self.store.read_document()
            barrier.wait(timeout=5)
            return self.store.update_document(version, body)
        with ThreadPoolExecutor(max_workers=2) as pool:
            result = list(pool.map(update, ["a", "b"]))
        self.assertEqual(sum(result), 1)
        self.assertEqual(self.store.read_document()[0], 2)

    def test_fresh_version_can_be_updated_after_conflict(self):
        self.assertTrue(self.store.update_document(1, "first"))
        self.assertFalse(self.store.update_document(1, "stale"))
        self.assertTrue(self.store.update_document(2, "merged"))
        self.assertEqual(self.store.read_document(), (3, "merged"))

    def test_parallel_retries_create_one_resource(self):
        barrier = Barrier(2)
        def create(_):
            barrier.wait(timeout=5)
            return self.store.create_ticket("op-1", "source-001")
        with ThreadPoolExecutor(max_workers=2) as pool:
            result = list(pool.map(create, range(2)))
        self.assertEqual(result[0], result[1])
        self.assertEqual(self.store.ticket_count(), 1)

    def test_reused_key_with_different_intent_is_rejected(self):
        self.store.create_ticket("op-1", "source-001")
        with self.assertRaises(ValueError):
            self.store.create_ticket("op-1", "source-002")
        self.assertEqual(self.store.ticket_count(), 1)

    def test_disconnect_does_not_undo_committed_effect(self):
        session = SessionModel()
        ready(session)
        call = session.request("tools/call", operation_key="op-1")
        self.store.create_ticket("op-1", "source-001")
        session.disconnect()
        ready(session)
        self.assertEqual(session.receive(response(call, {"content": []})), "ignored_response")
        self.assertIn("op-1", session.uncertain_operations)
        restarted_store = Store(self.store.path)
        self.assertEqual(restarted_store.ticket("op-1")[1], "source-001")
        self.assertEqual(restarted_store.ticket_count(), 1)


class ProtocolContracts(unittest.TestCase):
    def setUp(self):
        self.session = SessionModel()

    def test_tools_blocked_before_initialization(self):
        with self.assertRaises(ValueError):
            self.session.request("tools/list")

    def test_initialized_notification_is_required_by_lab(self):
        request = self.session.initialize()
        self.session.receive(response(request, {"protocolVersion": VERSION, "capabilities": {"tools": {}}}))
        with self.assertRaises(ValueError):
            self.session.request("tools/list")
        message = self.session.initialized()
        self.assertNotIn("id", message)
        self.assertEqual(message["method"], "notifications/initialized")

    def test_incompatible_version_disconnects(self):
        request = self.session.initialize()
        with self.assertRaises(ValueError):
            self.session.receive(response(request, {"protocolVersion": "unknown", "capabilities": {}}))
        self.assertEqual(self.session.state, "disconnected")

    def test_absent_tools_capability_blocks_tool_requests(self):
        request = self.session.initialize()
        self.session.receive(response(request, {"protocolVersion": VERSION, "capabilities": {}}))
        self.session.initialized()
        with self.assertRaises(ValueError):
            self.session.request("tools/list")

    def test_responses_are_matched_by_id_not_arrival_order(self):
        ready(self.session)
        first = self.session.request("tools/call")
        second = self.session.request("tools/call")
        self.session.receive(response(second, {"content": []}))
        self.assertIn(first["id"], self.session.pending)
        self.assertNotIn(second["id"], self.session.pending)
        self.session.receive(response(first, {"content": []}))
        self.assertEqual(self.session.pending, {})

    def test_cancelled_response_is_ignored_and_effect_remains_unknown(self):
        ready(self.session)
        request = self.session.request("tools/call", operation_key="op-1")
        notification = self.session.cancel(request["id"])
        self.assertNotIn("id", notification)
        self.assertEqual(self.session.receive(response(request, {"content": []})), "ignored_response")
        self.assertIn("op-1", self.session.uncertain_operations)

    def test_initialize_cannot_be_cancelled(self):
        request = self.session.initialize()
        with self.assertRaises(ValueError):
            self.session.cancel(request["id"])

    def test_unknown_cancellation_is_noop(self):
        self.assertIsNone(self.session.cancel("missing"))

    def test_catalog_change_invalidates_inflight_listing(self):
        ready(self.session)
        listing = self.session.request("tools/list")
        notice = {"jsonrpc": "2.0", "method": "notifications/tools/list_changed"}
        self.assertEqual(self.session.receive(notice), "catalog_invalidated")
        self.assertEqual(self.session.receive(response(listing, {"tools": []})), "stale_catalog")
        with self.assertRaises(ValueError):
            self.session.request("tools/call")
        fresh = self.session.request("tools/list")
        self.session.receive(response(fresh, {"tools": []}))
        self.assertTrue(self.session.catalog_valid)

    def test_protocol_error_and_tool_error_are_distinct(self):
        ready(self.session)
        first = self.session.request("tools/call")
        self.assertEqual(self.session.receive({"jsonrpc": "2.0", "id": first["id"],
            "error": {"code": -32601, "message": "Unknown method"}}), "protocol_error")
        second = self.session.request("tools/call")
        self.assertEqual(self.session.receive(response(second, {"content": [], "isError": True})), "tool_error")

    def test_malformed_response_does_not_complete_request(self):
        ready(self.session)
        request = self.session.request("tools/call")
        with self.assertRaises(ValueError):
            self.session.receive({"jsonrpc": "2.0", "id": request["id"], "result": {}, "error": {}})
        self.assertIn(request["id"], self.session.pending)


if __name__ == "__main__":
    unittest.main()
