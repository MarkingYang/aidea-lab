"""Local service only: worker replacement, side-effect retry, history replay."""
import asyncio
import json
import sqlite3
import tempfile
from datetime import timedelta
from pathlib import Path

from temporalio import activity, workflow
from temporalio.common import RetryPolicy
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Replayer, UnsandboxedWorkflowRunner, Worker

calls = {"read": 0, "write": 0}
database = ""


@activity.defn
async def read_evidence() -> str:
    calls["read"] += 1
    return "verified-A"


@activity.defn
async def write_result(key: str) -> str:
    calls["write"] += 1
    with sqlite3.connect(database) as db:
        db.execute("CREATE TABLE IF NOT EXISTS results (op TEXT PRIMARY KEY, value TEXT)")
        db.execute("INSERT OR IGNORE INTO results VALUES (?, ?)", (key, "approved-A"))
        db.commit()
    if calls["write"] == 1:
        raise RuntimeError("injected response loss after commit")
    return key


@workflow.defn
class Review:
    def __init__(self):
        self.approved = False
        self.ready = False

    @workflow.signal
    def approve(self):
        self.approved = True

    @workflow.query
    def is_ready(self) -> bool:
        return self.ready

    @workflow.run
    async def run(self, key: str) -> str:
        await workflow.execute_activity(read_evidence, start_to_close_timeout=timedelta(seconds=10))
        self.ready = True
        await workflow.wait_condition(lambda: self.approved)
        return await workflow.execute_activity(
            write_result, key, start_to_close_timeout=timedelta(seconds=10),
            retry_policy=RetryPolicy(initial_interval=timedelta(milliseconds=20), maximum_attempts=2),
        )


async def main():
    global database
    with tempfile.TemporaryDirectory() as folder:
        database = str(Path(folder) / "business.sqlite")
        async with await WorkflowEnvironment.start_local() as env:
            def worker():
                return Worker(env.client, task_queue="harness-source-study", workflows=[Review],
                              activities=[read_evidence, write_result], workflow_runner=UnsandboxedWorkflowRunner())
            async with worker():
                handle = await env.client.start_workflow(Review.run, "task-1:publish", id="source-study-review", task_queue="harness-source-study")
                async with asyncio.timeout(30):
                    while not await handle.query(Review.is_ready):
                        await asyncio.sleep(0.05)
            # Service stays alive; the Worker and its workflow cache are replaced.
            async with worker():
                await handle.signal(Review.approve)
                result = await asyncio.wait_for(handle.result(), timeout=30)
                history = await handle.fetch_history()
            before_replay = dict(calls)
            await Replayer(workflows=[Review], workflow_runner=UnsandboxedWorkflowRunner()).replay_workflow(history)
            assert calls == before_replay == {"read": 1, "write": 2}, calls
            with sqlite3.connect(database) as db:
                rows = db.execute("SELECT * FROM results").fetchall()
            assert rows == [("task-1:publish", "approved-A")], rows
            assert result == "task-1:publish"
            out = {"calls": calls, "business_rows": len(rows), "worker_replaced": True,
                   "replay_without_activity_execution": True, "history_events": len(history.events),
                   "limitations": ["Local in-memory Temporal service stayed alive", "Worker object replacement, not cross-host failover", "UnsandboxedWorkflowRunner for this teaching module", "SQLite response-loss simulation, no real network fault"]}
            Path(__file__).with_name("temporal-history.json").write_text(history.to_json() + "\n")
            Path(__file__).with_name("temporal-results.json").write_text(json.dumps(out, indent=2) + "\n")
            print(json.dumps(out))


if __name__ == "__main__":
    asyncio.run(main())
