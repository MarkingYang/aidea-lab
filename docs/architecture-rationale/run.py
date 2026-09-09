"""Paired counterexamples over the existing synthetic ticket-review core.

No LLM, framework runtime, credentials, network or real business resources.
Variants are built in memory; the source core and historical results are untouched.
"""
from pathlib import Path
import hashlib
import json
import platform
import tempfile
import types

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'core.py' if (HERE / 'core.py').exists() else ROOT / 'docs/harness-architectures/core.py'


def load_core(change=None):
    source = SOURCE.read_text()
    if change:
        old, new = change
        assert source.count(old) == 1, 'Mutation must match exactly once'
        source = source.replace(old, new)
    module = types.ModuleType('review_core')
    exec(compile(source, str(SOURCE), 'exec'), module.__dict__)
    return module


def observe(core, scenario):
    with tempfile.TemporaryDirectory(prefix='architecture-rationale-') as temp:
        db = Path(temp) / 'business.sqlite'
        business = core.Business(db)
        result = scenario(core, business, db)
        return {**result, **business.summary()}


def budget(core, business, db):
    state = core.initial(budget=0)
    result = core.advance(state, db)
    return {'status': result['status'], 'calls': result['calls']}


def version(core, business, db):
    state = {**core.initial(task='baseline'), 'version': 999, 'approved': True}
    return {'status': core.advance(state, db)['status']}


def forged_proposal(core, business, db):
    state = core.initial(task='baseline')
    state['proposal']['approved'] = True
    return {'status': core.advance(state, db)['status']}


def wrong_existing_resource(core, business, db):
    business.create('review:ticket', {**core.EXPECTED, 'observed': 'wrong'})
    return {'status': core.advance(core.initial(), db)['status']}


def revoke_between_checks(core, business, db):
    assert business.policy() == (1, 0)
    business.set_policy(allowed=False)
    accepted = business.create('review:ticket', core.EXPECTED)
    return {'accepted': accepted}


def retry_payload_conflict(core, business, db):
    business.create('review:ticket', core.EXPECTED)
    try:
        accepted = business.create('review:ticket', {**core.EXPECTED, 'field': 'published'})
        result = 'accepted' if accepted else 'denied'
    except ValueError:
        result = 'conflict'
    return {'result': result, 'stored_field': business.lookup('review:ticket')['field']}


def cancel_after_lost_response(core, business, db):
    state = {**core.initial(task='baseline', fault='response_lost'), 'approved': True}
    try:
        core.advance(state, db)
        raise AssertionError('Expected committed write followed by lost response')
    except core.ResponseLost:
        pass
    business.set_policy(cancelled=True)
    return {'status': core.advance(state, db)['status']}


CASES = [
    ('budget', budget,
     ("if s['calls'] >= s['budget']:", "if False:"),
     {'status': 'exhausted', 'calls': 0, 'tickets': 0, 'create_calls': 0},
     {'status': 'ready', 'calls': 1, 'tickets': 0, 'create_calls': 0}),
    ('state_version', version,
     ("if s['version'] != 1:", "if False:"),
     {'status': 'migration_required', 'tickets': 0, 'create_calls': 0},
     {'status': 'succeeded', 'tickets': 1, 'create_calls': 1}),
    ('proposal_contract', forged_proposal,
     ("if s['proposal'] != EXPECTED:", "if False:"),
     {'status': 'failed', 'tickets': 0, 'create_calls': 0},
     {'status': 'waiting', 'tickets': 0, 'create_calls': 0}),
    ('resource_verification', wrong_existing_resource,
     ("status = 'succeeded' if existing == EXPECTED else 'failed'", "status = 'succeeded'"),
     {'status': 'failed', 'tickets': 1, 'create_calls': 1},
     {'status': 'succeeded', 'tickets': 1, 'create_calls': 1}),
    ('resource_policy', revoke_between_checks,
     ("if not allowed or cancelled:\n                return False", "if False:\n                return False"),
     {'accepted': False, 'tickets': 0, 'create_calls': 0},
     {'accepted': True, 'tickets': 1, 'create_calls': 1}),
    ('same_key_payload_binding', retry_payload_conflict,
     ("if previous and previous[0] != text:", "if False:"),
     {'result': 'conflict', 'stored_field': 'effective', 'tickets': 1, 'create_calls': 1},
     {'result': 'accepted', 'stored_field': 'effective', 'tickets': 1, 'create_calls': 2}),
    ('cancel_effect_accounting', cancel_after_lost_response,
     ("if cancelled:\n            status = 'cancelled_with_effect'", "if cancelled:\n            status = 'cancelled'"),
     {'status': 'cancelled_with_effect', 'tickets': 1, 'create_calls': 1},
     {'status': 'cancelled', 'tickets': 1, 'create_calls': 1}),
]


def stable_operation_key(reuse_key):
    core = load_core()
    with tempfile.TemporaryDirectory(prefix='architecture-key-') as temp:
        business = core.Business(Path(temp) / 'business.sqlite')
        try:
            business.create('review:ticket', core.EXPECTED, lose_response=True)
        except core.ResponseLost:
            pass
        key = 'review:ticket' if reuse_key else 'review:ticket:retry-2'
        existing = business.lookup(key)
        if existing is None:
            business.create(key, core.EXPECTED)
        return {'recovered_existing': existing is not None, **business.summary()}


def main():
    baseline = json.loads((HERE / 'source-baseline.json').read_text())
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == baseline['sha256'], 'Source baseline changed'
    rows = []
    for name, scenario, mutation, expected_control, expected_variant in CASES:
        control = observe(load_core(), scenario)
        variant = observe(load_core(mutation), scenario)
        assert control == expected_control, (name, 'control', control)
        assert variant == expected_variant, (name, 'variant', variant)
        rows.append({'case': name, 'intervention': {'from': mutation[0], 'to': mutation[1]},
                     'control': control, 'variant': variant, 'passed': True})
    control, variant = stable_operation_key(True), stable_operation_key(False)
    assert control == {'recovered_existing': True, 'tickets': 1, 'create_calls': 1}
    assert variant == {'recovered_existing': False, 'tickets': 2, 'create_calls': 2}
    rows.append({'case': 'stable_operation_identity',
                 'intervention': 'Retry uses a new operation key; no core source mutation',
                 'control': control, 'variant': variant, 'passed': True})
    output = {'date': '2026-09-08', 'python': platform.python_version(),
              'source': baseline['path'],
              'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
              'scope': 'Synthetic fixed-response review task; core + real temporary SQLite only',
              'cases': rows, 'paired_cases': len(rows), 'executions': len(rows) * 2,
              'limitations': ['No live LLM or external business service',
                              'No Codex or other upstream runtime executed',
                              'No performance or success-rate estimate',
                              'Policy is a fixture row, not authenticated user identity',
                              'Variants deliberately violate one contract; not candidate architectures']}
    Path(__file__).with_name('results.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'paired_cases': len(rows), 'executions': len(rows) * 2, 'passed': True}))


if __name__ == '__main__':
    main()
