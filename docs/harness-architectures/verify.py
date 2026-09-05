"""Runs real A/B/C engines against deterministic fixtures; not an LLM benchmark."""
import argparse
import asyncio
from datetime import timedelta
import importlib.metadata
import json
import logging
from pathlib import Path
import platform
import tempfile
import time
from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker, UnsandboxedWorkflowRunner
from core import Business, EXPECTED, ResponseLost, initial
from runners import run_explicit, run_graph, ReviewWorkflow, review_step

CASES = {'baseline': 'succeeded', 'review': 'succeeded', 'response_lost': 'succeeded',
         'invalid_proposal': 'failed', 'budget': 'exhausted', 'revoke': 'failed',
         'cancel': 'cancelled', 'version': 'migration_required'}


def prepare(root, name):
    path = root / (name + '.sqlite')
    Business(path)
    state = initial(task='baseline' if name == 'baseline' else 'review',
                    fault=name if name in ('response_lost', 'invalid_proposal') else None,
                    budget=1 if name == 'budget' else 3)
    if name == 'version':
        state['version'] = 2
    return path, state


def before_approval(path, name):
    if name == 'revoke':
        Business(path).set_policy(allowed=False)
    if name == 'cancel':
        Business(path).set_policy(cancelled=True)


def check(engine, name, result, path, elapsed):
    summary = Business(path).summary()
    assert result['status'] == CASES[name], (engine, name, result)
    assert summary['tickets'] == (1 if CASES[name] == 'succeeded' else 0), (engine, name, summary)
    if summary['tickets']:
        assert Business(path).lookup('review:ticket') == EXPECTED
        assert summary['create_calls'] == 1, 'Recovery should reconcile the committed ticket'
    return {'engine': engine, 'case': name, 'status': result['status'], **summary,
            'fixture_decisions': result['calls'], 'elapsed_ms': round(elapsed * 1000, 2)}


async def wait_paused(handle):
    for _ in range(200):
        value = await handle.query(ReviewWorkflow.snapshot)
        if value.get('status') == 'waiting':
            return
        await asyncio.sleep(.025)
    raise AssertionError('Workflow did not pause')


def worker(client):
    return Worker(client, task_queue='architecture-lab', workflows=[ReviewWorkflow],
                  activities=[review_step], workflow_runner=UnsandboxedWorkflowRunner())


async def main(output, repeats):
    results = []
    with tempfile.TemporaryDirectory(prefix='architecture-lab-') as directory:
        root = Path(directory)
        for engine, runner in [('A', run_explicit), ('B', run_graph)]:
            for repetition in range(repeats):
                for name in CASES:
                    folder = root / f'{engine}-{repetition}-{name}'
                    folder.mkdir()
                    path, state = prepare(folder, name)
                    started = time.perf_counter()
                    result = runner(path, state)
                    if result['status'] == 'waiting':
                        before_approval(path, name)
                        try:
                            result = runner(path, state, approval=True)
                        except ResponseLost:
                            result = runner(path, state, **({'resume': True} if engine == 'B' else {}))
                    results.append(check(engine, name, result, path, time.perf_counter() - started))
            print(f'{engine}: {len(CASES) * repeats} cases passed', flush=True)
        async with await WorkflowEnvironment.start_local(ui=False) as env:
            async with worker(env.client):
                for repetition in range(repeats):
                    for name in CASES:
                        folder = root / f'C-{repetition}-{name}'
                        folder.mkdir()
                        path, state = prepare(folder, name)
                        started = time.perf_counter()
                        handle = await env.client.start_workflow(ReviewWorkflow.run,
                            {'state': state, 'path': str(path)}, id=f'{repetition}-{name}',
                            task_queue='architecture-lab', execution_timeout=timedelta(seconds=30))
                        if name not in ('invalid_proposal', 'budget', 'version'):
                            await wait_paused(handle)
                            before_approval(path, name)
                            await handle.signal(ReviewWorkflow.approve, True)
                        result = await asyncio.wait_for(handle.result(), 30)
                        results.append(check('C', name, result, path, time.perf_counter() - started))
            print(f'C: {len(CASES) * repeats} cases passed', flush=True)
            # A new Worker must reconstruct the paused workflow from server history.
            folder = root / 'worker-restart'; folder.mkdir()
            path, state = prepare(folder, 'review')
            async with worker(env.client):
                handle = await env.client.start_workflow(ReviewWorkflow.run,
                    {'state': state, 'path': str(path)}, id='worker-restart', task_queue='architecture-lab')
                await wait_paused(handle)
            async with worker(env.client):
                await handle.signal(ReviewWorkflow.approve, True)
                resumed = await asyncio.wait_for(handle.result(), 30)
                assert resumed['status'] == 'succeeded' and Business(path).summary()['tickets'] == 1
            print('C: Worker restart while waiting passed', flush=True)
    report = {'python': platform.python_version(),
              'dependencies': {name: importlib.metadata.version(name) for name in
                               ('langgraph', 'langgraph-checkpoint-sqlite', 'temporalio')},
              'model': 'deterministic fixture; no live model calls', 'repeats': repeats,
              'cases_passed': len(results), 'worker_restart_passed': True, 'results': results}
    Path(output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default='results.json')
    parser.add_argument('--repeats', type=int, default=3)
    args = parser.parse_args()
    if args.repeats < 1:
        parser.error('--repeats must be positive')
    logging.basicConfig(level=logging.ERROR)
    asyncio.run(main(args.output, args.repeats))
