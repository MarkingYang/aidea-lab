"""Run real Haystack pipelines against deterministic components, without model calls."""
import os
os.environ['HAYSTACK_TELEMETRY_ENABLED'] = 'False'
os.environ['HAYSTACK_CONTENT_TRACING_ENABLED'] = 'False'
import asyncio
import json
import threading
import time
import importlib.metadata
from pathlib import Path
import importlib.util
import hashlib
import sys
source_record = json.loads(Path(__file__).with_name('sources.json').read_text())
installed_root = Path(next(iter(importlib.util.find_spec('haystack').submodule_search_locations)))
assert importlib.metadata.version('haystack-ai') == source_record['package_version']
for source in source_record['files']:
    if source['path'].startswith('haystack/'):
        actual = hashlib.sha256((installed_root / source['path'][len('haystack/'):]).read_bytes()).hexdigest()
        assert actual == source['sha256'], 'Installed source differs: ' + source['path']
from haystack import Pipeline, Document, component
from haystack.core.errors import PipelineConnectError, PipelineMaxComponentRuns, PipelineRuntimeError
from haystack.core.component.types import Variadic
from haystack.components.routers import ConditionalRouter
from haystack.components.joiners import DocumentJoiner, BranchJoiner
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.document_stores.types import FilterPolicy
from haystack.components.builders import PromptBuilder
from haystack.tools import PipelineTool

@component
class Number:
    @component.output_types(value=int)
    def run(self): return {'value': 1}

@component
class Text:
    @component.output_types(value=str)
    def run(self, value: str): return {'value': value}

@component
class Branch:
    def __init__(self, name, record): self.name, self.record = name, record
    def enter(self):
        self.record['active'] += 1
        self.record['peak'] = max(self.record['peak'], self.record['active'])
        self.record['events'].append(self.name + ':start')
    def leave(self):
        self.record['active'] -= 1
        self.record['events'].append(self.name + ':end')
        return {'value': self.name}
    @component.output_types(value=str)
    def run(self):
        self.enter(); time.sleep(0.01); return self.leave()
    @component.output_types(value=str)
    async def run_async(self):
        self.enter(); await asyncio.sleep(0.01); return self.leave()

@component
class Gather:
    def __init__(self): self.calls = []
    @component.output_types(values=list[str])
    def run(self, values: Variadic[str]):
        self.calls.append(sorted(values)); return {'values': sorted(values)}

@component
class Increment:
    @component.output_types(value=int)
    def run(self, value: int): return {'value': value + 1}


def branch_pipeline():
    record = {'active': 0, 'peak': 0, 'events': []}; join = Gather(); p = Pipeline()
    p.add_component('a', Branch('a', record)); p.add_component('b', Branch('b', record))
    p.add_component('join', join); p.connect('a.value', 'join.values'); p.connect('b.value', 'join.values')
    return p, record, join


def loop_pipeline(limit, target):
    p = Pipeline(max_runs_per_component=limit)
    p.add_component('join', BranchJoiner(int)); p.add_component('increment', Increment())
    p.add_component('route', ConditionalRouter([
        {'condition': '{{ value < ' + str(target) + ' }}', 'output': '{{ value }}', 'output_name': 'again', 'output_type': int},
        {'condition': '{{ value >= ' + str(target) + ' }}', 'output': '{{ value }}', 'output_name': 'done', 'output_type': int},
    ]))
    p.connect('join.value', 'increment.value'); p.connect('increment.value', 'route.value'); p.connect('route.again', 'join.value')
    return p


async def main():
    cases = {}
    p = Pipeline(); p.add_component('number', Number()); p.add_component('text', Text())
    try: p.connect('number.value', 'text.value')
    except PipelineConnectError: cases['connection_type_check'] = {'rejected_before_run': True}
    else: raise AssertionError('incompatible sockets accepted')

    p, record, join = branch_pipeline(); out = p.run({})
    assert out['join']['values'] == ['a', 'b'] and record['peak'] == 1 and join.calls == [['a', 'b']]
    cases['sync_branches'] = {'peak_active': record['peak'], 'join_calls': join.calls}
    for limit in [2, 1]:
        p, record, join = branch_pipeline(); out = await p.run_async({}, concurrency_limit=limit)
        assert out['join']['values'] == ['a', 'b'] and record['peak'] == limit and join.calls == [['a', 'b']]
        cases[f'async_limit_{limit}'] = {'peak_active': record['peak'], 'join_calls': join.calls}

    p = Pipeline(); p.add_component('route', ConditionalRouter([
        {'condition': '{{ n > 0 }}', 'output': '{{ "positive" }}', 'output_name': 'positive', 'output_type': str},
        {'condition': '{{ True }}', 'output': '{{ "fallback" }}', 'output_name': 'other', 'output_type': str},
    ])); p.add_component('join', BranchJoiner(str)); p.connect('route.positive', 'join.value'); p.connect('route.other', 'join.value')
    out = p.run({'route': {'n': 1}}); assert out == {'join': {'value': 'positive'}}
    cases['exclusive_route'] = {'output': out, 'unselected_branch_not_required': True}

    out = loop_pipeline(10, 3).run({'join': {'value': 0}}); assert out['route']['done'] == 3
    try: loop_pipeline(2, 99).run({'join': {'value': 0}})
    except PipelineMaxComponentRuns: limited = True
    else: raise AssertionError('cycle limit not enforced')
    cases['bounded_cycle'] = {'terminating_value': 3, 'unbounded_goal_stopped_by_limit': limited}

    lists = [[Document(id='a', content='A', score=100), Document(id='b', content='B', score=90)],
             [Document(id='b', content='B', score=.9), Document(id='c', content='C', score=.8)]]
    concat = DocumentJoiner(join_mode='concatenate').run(lists)['documents']
    rrf = DocumentJoiner(join_mode='reciprocal_rank_fusion').run(lists)['documents']
    assert concat[0].id == 'a' and rrf[0].id == 'b'
    cases['rank_fusion'] = {'concatenate': [d.id for d in concat], 'rrf': [d.id for d in rrf]}

    store = InMemoryDocumentStore()
    store.write_documents([Document(id='allowed', content='refund policy is seven days', meta={'tenant': 'A'}),
                           Document(id='other', content='refund policy is thirty days', meta={'tenant': 'B'})])
    retrieve = InMemoryBM25Retriever(store, filters={'field': 'meta.tenant', 'operator': '==', 'value': 'A'})
    p = Pipeline(); p.add_component('search', retrieve)
    p.add_component('prompt', PromptBuilder(template='Question: {{query}}\n{% for d in documents %}[{{d.id}}] {{d.content}}\n{% endfor %}', required_variables=['query', 'documents']))
    p.connect('search.documents', 'prompt.documents')
    data = {'search': {'query': 'refund'}, 'prompt': {'query': 'refund'}}
    out = p.run(data, include_outputs_from={'search'})
    assert [d.id for d in out['search']['documents']] == ['allowed']
    tool = PipelineTool(pipeline=p, name='lookup_policy', description='Read permitted policy evidence.',
                        input_mapping={'query': ['search.query', 'prompt.query']}, output_mapping={'prompt.prompt': 'context'})
    assert set(tool.parameters['properties']) == {'query'}
    result = tool.invoke(query='refund')
    assert '[allowed]' in result['context'] and 'thirty' not in result['context']
    cases['filtered_retrieval_as_tool'] = {'document_ids': ['allowed'], 'tool_context': result['context'], 'no_llm': True}
    override = {'field': 'meta.tenant', 'operator': '==', 'value': 'B'}
    replaced = retrieve.run(query='refund', filters=override)['documents']
    merged_retriever = InMemoryBM25Retriever(store, filters={'field': 'meta.tenant', 'operator': '==', 'value': 'A'}, filter_policy=FilterPolicy.MERGE)
    merged = merged_retriever.run(query='refund', filters=override)['documents']
    explicit = retrieve.run(query='refund', filters={'operator': 'AND', 'conditions': [{'field': 'meta.tenant', 'operator': '==', 'value': 'A'}, override]})['documents']
    assert [d.id for d in replaced] == ['other'] and [d.id for d in merged] == ['other'] and explicit == []
    cases['filter_policy_boundary'] = {'replace_runtime_B': ['other'], 'merge_same_field_runtime_B': ['other'], 'explicit_A_AND_B': [], 'tool_public_inputs': ['query']}
    store.shutdown()

    state = {'started': asyncio.Event(), 'cleaned': False}
    @component
    class Wait:
        @component.output_types(value=str)
        def run(self): return {'value': 'unused'}
        @component.output_types(value=str)
        async def run_async(self):
            state['started'].set()
            try: await asyncio.Event().wait()
            finally: state['cleaned'] = True
    @component
    class Fail:
        @component.output_types(value=str)
        def run(self): raise RuntimeError('controlled failure')
        @component.output_types(value=str)
        async def run_async(self):
            await state['started'].wait(); raise RuntimeError('controlled failure')
    p = Pipeline(); p.add_component('wait', Wait()); p.add_component('fail', Fail())
    try: await asyncio.wait_for(p.run_async({}, concurrency_limit=2), timeout=3)
    except PipelineRuntimeError: pass
    else: raise AssertionError('missing failure')
    assert state['cleaned']
    cases['native_async_cleanup'] = {'sibling_finalizer_completed_before_error_return': True}

    state2 = {'started': threading.Event(), 'release': threading.Event(), 'done': threading.Event()}
    @component
    class ThreadWrite:
        @component.output_types(value=str)
        def run(self):
            state2['started'].set()
            if not state2['release'].wait(3): raise TimeoutError('test gate')
            state2['done'].set(); return {'value': 'local effect completed'}
    @component
    class AsyncFailure:
        @component.output_types(value=str)
        def run(self): raise RuntimeError('unused')
        @component.output_types(value=str)
        async def run_async(self):
            while not state2['started'].is_set(): await asyncio.sleep(0)
            raise RuntimeError('controlled failure')
    p = Pipeline(); p.add_component('thread', ThreadWrite()); p.add_component('fail', AsyncFailure())
    try:
        try: await asyncio.wait_for(p.run_async({}, concurrency_limit=2), timeout=2)
        except PipelineRuntimeError: pass
        else: raise AssertionError('missing failure')
        assert not state2['done'].is_set()
    finally: state2['release'].set()
    assert await asyncio.to_thread(state2['done'].wait, 2)
    cases['sync_thread_after_cancel'] = {'local_effect_completed_after_pipeline_error': True}
    return cases

if __name__ == '__main__':
    cases = asyncio.run(main())
    result = {'commit': '82da3adc2fac4675b80ff5573b790ec07113697b',
              'package_version': importlib.metadata.version('haystack-ai'), 'python': sys.version.split()[0], 'case_count': len(cases), 'cases': cases,
              'limits': ['Real Pipeline and components; deterministic custom branches and failures',
                         'No LLM, learned embeddings, external vector database, performance benchmark or cross-process recovery',
                         'Tenant filter is fixed by the test harness, not an authentication test']}
    Path(__file__).with_name('results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))
