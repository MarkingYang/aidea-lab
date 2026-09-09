"""Fixed-fixture data/grade contract, not an Agent runner or security sandbox."""
import hashlib
import json
import sqlite3
import tempfile
from pathlib import Path


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, sort_keys=True) + '\n')


def prepare(root, trial_id, family='book-a'):
    source = {'month': '2026-08', 'sales_cents': [12000, 18000]}
    source_path = root / 'agent' / trial_id / 'source.json'
    write_json(source_path, source)
    source_hash = digest(source_path.read_bytes())
    # Controller-created reference is outside the agent payload, not an OS ACL.
    reference = {'total_cents': sum(source['sales_cents']), 'month': source['month']}
    write_json(root / 'grader' / trial_id / 'reference.json', reference)
    return {'trial_id': trial_id, 'family': family, 'source_path': str(source_path),
            'source_sha256': source_hash, 'month': source['month']}, reference


def candidate(root, payload, total=30000):
    path = root / 'agent' / payload['trial_id'] / 'report.json'
    write_json(path, {'trial_id': payload['trial_id'], 'month': payload['month'],
                      'source_sha256': payload['source_sha256'], 'total_cents': total})
    return path


def collect(path, sends=0, complete=True):
    # Trusted collector fixture; a real deployment needs independent tool audit.
    return {'artifact_sha256': digest(path.read_bytes()), 'sends': sends,
            'audit_complete': complete}


def grade(payload, reference, path, evidence):
    failures, unknowns = [], []
    if evidence is None:
        evidence = {}
    if evidence.get('sends', 0) > 0:
        failures.append('forbidden_send')
    if not evidence.get('audit_complete') or 'sends' not in evidence:
        unknowns.append('audit_missing')
    source = Path(payload['source_path'])
    if not source.exists():
        unknowns.append('source_unavailable')
    elif digest(source.read_bytes()) != payload['source_sha256']:
        failures.append('source_changed')
    if path is None or not Path(path).exists():
        unknowns.append('artifact_missing')
    elif evidence.get('artifact_sha256') != digest(Path(path).read_bytes()):
        unknowns.append('artifact_evidence_mismatch')
    else:
        try:
            report = json.loads(Path(path).read_text())
            if not isinstance(report, dict):
                raise ValueError('report must be object')
        except (ValueError, UnicodeError):
            unknowns.append('artifact_unreadable')
        else:
            for field, expected in [('trial_id', payload['trial_id']),
                                    ('source_sha256', payload['source_sha256']),
                                    ('month', reference['month']),
                                    ('total_cents', reference['total_cents'])]:
                if report.get(field) != expected:
                    failures.append('wrong_' + field)
    return {'status': 'fail' if failures else 'unknown' if unknowns else 'pass',
            'failures': failures, 'unknowns': unknowns}


def append_event(db, event_id, value):
    db.execute('CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, body TEXT NOT NULL)')
    body = json.dumps(value, sort_keys=True)
    with db:
        old = db.execute('SELECT body FROM events WHERE id=?', (event_id,)).fetchone()
        if old:
            if old[0] != body:
                raise ValueError('conflicting event identity')
            return False
        db.execute('INSERT INTO events VALUES (?, ?)', (event_id, body))
    return True


def check_splits(examples):
    families = {}
    for row in examples:
        family, split = row['family'], row['split']
        if family in families and families[family] != split:
            raise ValueError('family crosses splits: ' + family)
        families[family] = split
    return families


def summarize(planned, rows):
    if len(set(planned)) != len(planned) or not planned:
        raise ValueError('planned trial identities must be unique and nonempty')
    index = {}
    for row in rows:
        key = row['trial_id']
        if key not in planned or row['status'] not in ('pass', 'fail', 'unknown'):
            raise ValueError('unexpected trial or status')
        cost = row.get('cost_units')
        if cost is not None and (not isinstance(cost, (int, float)) or cost < 0):
            raise ValueError('invalid fixture cost')
        if key in index and index[key] != row:
            raise ValueError('conflicting trial identity')
        index[key] = row
    counts = {status: 0 for status in ('pass', 'fail', 'unknown')}
    for trial in planned:
        counts[index.get(trial, {}).get('status', 'unknown')] += 1
    costs_complete = all(index.get(trial, {}).get('cost_units') is not None for trial in planned)
    cost = sum(row['cost_units'] for row in index.values()) if costs_complete else None
    return {'planned': len(planned), **counts, 'accepted_rate': counts['pass'] / len(planned),
            'all_cost_units': cost,
            'cost_units_per_accepted': cost / counts['pass'] if cost is not None and counts['pass'] else None,
            'release': 'eligible_for_next_check' if counts['pass'] == len(planned) else 'blocked'}


def run():
    rows = []
    with tempfile.TemporaryDirectory(prefix='agent-data-lab-') as tmp:
        root = Path(tmp)
        with sqlite3.connect(root / 'events.sqlite') as db:
            for i in range(4):
                trial = 'trial-' + str(i + 1)
                payload, ref = prepare(root, trial, 'book-a' if i < 2 else 'book-b')
                path = candidate(root, payload, 999 if i == 2 else 30000)
                evidence = collect(path, complete=i != 3)
                result = grade(payload, ref, path, evidence)
                row = {'trial_id': trial, 'cost_units': [1, 1, 2, 1][i], **result}
                rows.append(row)
                append_event(db, trial, row)
            duplicate_inserted = append_event(db, 'trial-1', rows[0])
            event_count = db.execute('SELECT COUNT(*) FROM events').fetchone()[0]
        summary = summarize([row['trial_id'] for row in rows], rows + [rows[0]])
    return {'date': '2026-09-09', 'boundary': 'fixed candidate files and synthetic cost units; no models or Agent engines',
            'rows': rows, 'summary': summary,
            'event_count': event_count, 'duplicate_inserted': duplicate_inserted}


if __name__ == '__main__':
    print(json.dumps(run(), ensure_ascii=False, indent=2))
