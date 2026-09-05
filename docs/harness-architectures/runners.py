"""Three real persistence/control implementations over one business contract."""
import json
import sqlite3
from datetime import timedelta
from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.sqlite import SqliteSaver
from temporalio import activity, workflow
from temporalio.common import RetryPolicy
from core import advance, TERMINAL


def run_explicit(path, state, run='run', approval=None):
    with sqlite3.connect(str(path) + '.runs') as db:
        db.execute('CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY, state TEXT)')
        row = db.execute('SELECT state FROM runs WHERE id=?', (run,)).fetchone()
        s = json.loads(row[0]) if row else state
        if s['status'] == 'waiting' and approval is not None:
            s = {**s, 'approved': approval, 'status': 'ready' if approval else 'cancelled'}
        # Save entry state too, so a first-step interruption cannot lose the contract.
        while True:
            db.execute('INSERT OR REPLACE INTO runs VALUES(?,?)', (run, json.dumps(s)))
            db.commit()
            if s['status'] in TERMINAL or s['status'] == 'waiting':
                return s
            s = advance(s, str(path))


class GraphState(TypedDict):
    data: dict


def run_graph(path, state, run='run', approval=None, resume=False):
    def step(s):
        return {'data': advance(s['data'], str(path))}

    def approve(s):
        accepted = interrupt({'proposal': s['data']['proposal']})
        return {'data': {**s['data'], 'approved': accepted,
                         'status': 'ready' if accepted else 'cancelled'}}

    def route(s):
        status = s['data']['status']
        return END if status in TERMINAL else 'approve' if status == 'waiting' else 'step'

    graph = StateGraph(GraphState)
    graph.add_node('step', step)
    graph.add_node('approve', approve)
    graph.add_edge(START, 'step')
    graph.add_conditional_edges('step', route)
    graph.add_edge('approve', 'step')
    with SqliteSaver.from_conn_string(str(path) + '.graph') as saver:
        app = graph.compile(checkpointer=saver)
        config = {'configurable': {'thread_id': run}, 'recursion_limit': 30}
        argument = Command(resume=approval) if approval is not None else None if resume else {'data': state}
        result = app.invoke(argument, config=config)
        return result['data']


@activity.defn
async def review_step(args: dict) -> dict:
    # Local SQLite calls are short and serial in this teaching fixture.
    return advance(args['state'], args['path'])


@workflow.defn
class ReviewWorkflow:
    def __init__(self):
        self.state = {}
        self.approval = None

    @workflow.signal
    def approve(self, accepted: bool):
        self.approval = accepted

    @workflow.query
    def snapshot(self) -> dict:
        return self.state

    @workflow.run
    async def run(self, args: dict) -> dict:
        self.state = args['state']
        while self.state['status'] not in TERMINAL:
            self.state = await workflow.execute_activity(
                review_step, {'state': self.state, 'path': args['path']},
                start_to_close_timeout=timedelta(seconds=5),
                retry_policy=RetryPolicy(maximum_attempts=2, initial_interval=timedelta(milliseconds=10)),
            )
            if self.state['status'] == 'waiting':
                await workflow.wait_condition(lambda: self.approval is not None)
                self.state = {**self.state, 'approved': self.approval,
                              'status': 'ready' if self.approval else 'cancelled'}
        return self.state
