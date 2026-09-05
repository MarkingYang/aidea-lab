"""Synthetic document review; no live model or external business service."""
import copy
from contextlib import contextmanager
import json
import sqlite3

TERMINAL = {'succeeded', 'failed', 'cancelled', 'cancelled_with_effect', 'exhausted', 'migration_required'}
SOURCES = {'notice': {'published': '2026-09-01', 'effective': '2026-09-15'},
           'catalog': {'effective': '2026-09-01'}}
EXPECTED = {'source': 'notice', 'field': 'effective', 'observed': '2026-09-15', 'recorded': '2026-09-01'}


class ResponseLost(Exception):
    pass


class Business:
    def __init__(self, path):
        self.path = str(path)
        with self.connect() as db:
            db.executescript('''CREATE TABLE IF NOT EXISTS tickets(op TEXT PRIMARY KEY, payload TEXT);
              CREATE TABLE IF NOT EXISTS policy(id INTEGER PRIMARY KEY, allowed INTEGER, cancelled INTEGER);
              INSERT OR IGNORE INTO policy VALUES(1,1,0);
              CREATE TABLE IF NOT EXISTS faults(name TEXT PRIMARY KEY);
              CREATE TABLE IF NOT EXISTS counts(name TEXT PRIMARY KEY, value INTEGER);''')

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path)
        try:
            with db:
                yield db
        finally:
            db.close()

    def set_policy(self, allowed=True, cancelled=False):
        with self.connect() as db:
            db.execute('UPDATE policy SET allowed=?,cancelled=? WHERE id=1', (allowed, cancelled))

    def policy(self):
        with self.connect() as db:
            return db.execute('SELECT allowed,cancelled FROM policy WHERE id=1').fetchone()

    def lookup(self, op):
        with self.connect() as db:
            row = db.execute('SELECT payload FROM tickets WHERE op=?', (op,)).fetchone()
        return json.loads(row[0]) if row else None

    def create(self, op, payload, lose_response=False):
        with self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            allowed, cancelled = db.execute('SELECT allowed,cancelled FROM policy WHERE id=1').fetchone()
            if not allowed or cancelled:
                return False
            text = json.dumps(payload, sort_keys=True)
            previous = db.execute('SELECT payload FROM tickets WHERE op=?', (op,)).fetchone()
            if previous and previous[0] != text:
                raise ValueError('same operation key, different payload')
            db.execute('INSERT OR IGNORE INTO tickets VALUES(?,?)', (op, text))
            db.execute("INSERT INTO counts VALUES('create_calls',1) ON CONFLICT(name) DO UPDATE SET value=value+1")
            first = db.execute("INSERT OR IGNORE INTO faults VALUES('response_lost')").rowcount
        if lose_response and first:
            raise ResponseLost('resource committed, acknowledgement lost')
        return True

    def summary(self):
        with self.connect() as db:
            return {'tickets': db.execute('SELECT COUNT(*) FROM tickets').fetchone()[0],
                    'create_calls': db.execute('SELECT COALESCE(SUM(value),0) FROM counts').fetchone()[0]}


def initial(task='review', fault=None, budget=3, op='review:ticket'):
    return {'version': 1, 'task': task, 'fault': fault, 'budget': budget, 'op': op,
            'calls': 0, 'observations': {}, 'proposal': EXPECTED.copy() if task == 'baseline' else None,
            'approved': False, 'status': 'ready'}


def advance(state, path):
    """One controlled step. Each engine owns persistence of the returned state."""
    s = copy.deepcopy(state)
    business = Business(path)
    if s['version'] != 1:
        return {**s, 'status': 'migration_required'}
    if s['status'] in TERMINAL:
        return s
    # Reconciliation precedes cancellation: cancellation cannot erase a committed resource.
    existing = business.lookup(s['op'])
    allowed, cancelled = business.policy()
    if existing is not None:
        status = 'succeeded' if existing == EXPECTED else 'failed'
        if cancelled:
            status = 'cancelled_with_effect'
        return {**s, 'status': status}
    if cancelled:
        return {**s, 'status': 'cancelled'}
    if not allowed:
        return {**s, 'status': 'failed', 'reason': 'permission_revoked'}
    if s['proposal'] is None:
        if s['calls'] >= s['budget']:
            return {**s, 'status': 'exhausted'}
        # Deterministic model fixture: chooses its next tool from observations.
        s['calls'] += 1
        for name in ('notice', 'catalog'):
            if name not in s['observations']:
                s['observations'][name] = SOURCES[name].copy()
                return s
        s['proposal'] = {'source': 'notice', 'field': 'effective',
                         'observed': s['observations']['notice']['effective'],
                         'recorded': s['observations']['catalog']['effective']}
        if s['fault'] == 'invalid_proposal':
            s['proposal']['approved'] = True
        return s
    if s['proposal'] != EXPECTED:
        return {**s, 'status': 'failed', 'reason': 'proposal_rejected'}
    if not s['approved']:
        return {**s, 'status': 'waiting'}
    created = business.create(s['op'], s['proposal'], s['fault'] == 'response_lost')
    if not created:
        return {**s, 'status': 'failed', 'reason': 'policy_changed_at_commit'}
    actual = business.lookup(s['op'])
    return {**s, 'status': 'succeeded' if actual == EXPECTED else 'failed'}
