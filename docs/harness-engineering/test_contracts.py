from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from lab import Action, Context, Harness, SimulatedCrash, TicketService, approval_for


class Contracts(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.context = Context("team-a", "alice")
        self.action = Action("source-001", "核验 Agent Harness 资料")
        self.service = TicketService(self.root / "tickets.sqlite")
        self.harness = Harness(self.root / "runs.sqlite", self.service)

    def run_task(self, **kwargs):
        return self.harness.run(self.context, "run-1", self.action, self.action, **kwargs)

    def approval(self):
        return approval_for(self.context, "run-1", self.action)

    def test_approval_required_before_effect(self):
        self.assertEqual(self.run_task()["state"], "waiting_approval")
        self.assertEqual(self.service.count("team-a"), 0)

    def test_normal_completion_and_repeated_run(self):
        for _ in range(2):
            self.assertEqual(self.run_task(approval=self.approval())["state"], "succeeded")
        self.assertEqual(self.service.count("team-a"), 1)

    def test_service_retries_are_atomic_and_reject_changed_payload(self):
        first = self.service.create("team-a", "operation", self.action)
        self.assertEqual(self.service.create("team-a", "operation", self.action), first)
        with self.assertRaises(ValueError):
            self.service.create("team-a", "operation", Action("source-002", "different"))
        self.assertEqual(self.service.count("team-a"), 1)

    def test_same_operation_key_is_scoped_by_tenant(self):
        self.service.create("team-a", "operation", self.action)
        self.service.create("team-b", "operation", self.action)
        self.assertEqual(self.service.count("team-a"), 1)
        self.assertEqual(self.service.count("team-b"), 1)

    def test_all_commit_boundaries_recover(self):
        for fault in ("before_effect", "after_effect", "after_result", "after_validation"):
            with self.subTest(fault=fault):
                run_id = fault
                with self.assertRaises(SimulatedCrash):
                    self.harness.run(self.context, run_id, self.action, self.action,
                                     approval=approval_for(self.context, run_id, self.action), fault=fault)
                restarted = Harness(self.root / "runs.sqlite", TicketService(self.root / "tickets.sqlite"))
                state = restarted.run(self.context, run_id, self.action, self.action,
                                      approval=approval_for(self.context, run_id, self.action))
                self.assertEqual(state["state"], "succeeded")
                self.assertEqual(state["attempts"], 2 if fault == "before_effect" else 1)
        self.assertEqual(self.service.count("team-a"), 4)

    def test_process_exit_after_external_commit(self):
        code = """
import os, sys
from pathlib import Path
from lab import *
root = Path(sys.argv[1])
context = Context('team-a', 'alice')
action = Action('source-001', '核验 Agent Harness 资料')
try:
    Harness(root / 'runs.sqlite', TicketService(root / 'tickets.sqlite')).run(
        context, 'run-1', action, action,
        approval=approval_for(context, 'run-1', action), fault='after_effect')
except SimulatedCrash:
    os._exit(23)
"""
        process = subprocess.run([sys.executable, "-c", code, str(self.root)],
                                 cwd=Path(__file__).parent, capture_output=True, text=True)
        self.assertEqual(process.returncode, 23, process.stderr)
        self.assertEqual(self.run_task()["state"], "succeeded")
        self.assertEqual(self.service.count("team-a"), 1)

    def test_budget_is_persisted_across_resume(self):
        with self.assertRaises(SimulatedCrash):
            self.run_task(approval=self.approval(), max_attempts=1, fault="before_effect")
        self.harness = Harness(self.root / "runs.sqlite", self.service)
        self.assertEqual(self.run_task(approval=self.approval(), max_attempts=1)["state"], "budget_exhausted")
        self.assertEqual(self.service.count("team-a"), 0)

    def test_zero_budget_and_cancel_have_no_effect(self):
        self.assertEqual(self.run_task(approval=self.approval(), max_attempts=0)["state"], "budget_exhausted")
        state = self.harness.run(self.context, "cancel", self.action, self.action, cancelled=True)
        self.assertEqual(state["state"], "cancelled")
        self.assertEqual(self.service.count("team-a"), 0)

    def test_cancel_after_dispatch_requires_reconciliation(self):
        with self.assertRaises(SimulatedCrash):
            self.run_task(approval=self.approval(), fault="after_effect")
        self.assertEqual(self.run_task(cancelled=True)["state"], "reconcile_required")
        self.assertEqual(self.service.count("team-a"), 1)
        reconciled = self.run_task()
        self.assertEqual(reconciled["state"], "cancelled")
        self.assertIn("cancellation_reconciled", reconciled["events"])
        self.assertEqual(self.service.count("team-a"), 1)

    def test_pending_cancel_never_dispatches_missing_effect(self):
        with self.assertRaises(SimulatedCrash):
            self.run_task(approval=self.approval(), fault="before_effect")
        self.run_task(cancelled=True)
        self.assertEqual(self.run_task(approval=self.approval())["state"], "cancelled")
        self.assertEqual(self.service.count("team-a"), 0)

    def test_existing_operation_with_different_parameters_fails(self):
        self.service.create("team-a", "run-1:ticket", Action("another-source", "another title"))
        self.assertEqual(self.run_task(approval=self.approval())["state"], "failed")
        self.assertIn("operation_conflict", self.run_task()["events"])

    def test_revoked_policy_blocks_resumption(self):
        self.context = Context("team-a", "alice", allowed=False)
        self.assertEqual(self.run_task(approval=self.approval())["state"], "denied")
        self.assertEqual(self.service.count("team-a"), 0)

    def test_stale_and_foreign_approvals_are_rejected(self):
        approvals = [self.approval(), approval_for(Context("team-b", "bob", 2), "run-1", self.action)]
        self.context = Context("team-a", "alice", 2)
        for approval in approvals:
            self.assertEqual(self.run_task(approval=approval)["state"], "waiting_approval")
        self.assertEqual(self.run_task(approval=self.approval())["state"], "succeeded")

    def test_changed_action_invalidates_approval(self):
        previous = self.approval()
        self.action = Action("source-002", "changed")
        self.assertEqual(self.run_task(approval=previous)["state"], "waiting_approval")
        self.assertEqual(self.service.count("team-a"), 0)

    def test_task_contract_cannot_change_on_resume(self):
        self.run_task()
        self.action = Action("source-002", "changed")
        with self.assertRaises(ValueError):
            self.run_task(approval=self.approval())

    def test_tool_success_does_not_override_independent_acceptance(self):
        wrong = Action("wrong-source", "wrong title")
        state = self.harness.run(self.context, "run-1", wrong, self.action,
                                 approval=approval_for(self.context, "run-1", wrong))
        self.assertEqual(state["state"], "failed")
        self.assertIn("validation_failed", state["events"])
        self.assertEqual(self.service.count("team-a"), 1)


if __name__ == "__main__":
    unittest.main()
