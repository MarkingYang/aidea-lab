"""Single-user local stores; no distributed worker or authentication guarantee."""
import json
import sqlite3
from contextlib import contextmanager


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


@contextmanager
def connect(path):
    db = sqlite3.connect(path)
    try:
        with db:
            yield db
    finally:
        db.close()


class Tickets:
    def __init__(self, path):
        self.path = path
        with connect(path) as db:
            db.execute('CREATE TABLE IF NOT EXISTS tickets (id INTEGER PRIMARY KEY, op TEXT UNIQUE, payload TEXT NOT NULL)')

    def lookup(self, op):
        with connect(self.path) as db:
            row = db.execute('SELECT id,payload FROM tickets WHERE op=?', (op,)).fetchone()
        return {'id': row[0], 'action': json.loads(row[1])} if row else None

    def create(self, op, source, title):
        payload = canonical({'source': source, 'title': title})
        with connect(self.path) as db:
            db.execute('BEGIN IMMEDIATE')
            row = db.execute('SELECT id,payload FROM tickets WHERE op=?', (op,)).fetchone()
            if row:
                if row[1] != payload:
                    raise ValueError('operation key conflicts with saved parameters')
                return {'id': row[0], 'action': json.loads(row[1])}
            cursor = db.execute('INSERT INTO tickets(op,payload) VALUES (?,?)', (op,payload))
            return {'id': cursor.lastrowid, 'action': json.loads(payload)}


class Runs:
    def __init__(self, path):
        self.path = path
        with connect(path) as db:
            db.executescript('''CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY, contract TEXT NOT NULL, state TEXT NOT NULL,
                action TEXT, attempts INTEGER NOT NULL DEFAULT 0);
                CREATE TABLE IF NOT EXISTS events (
                seq INTEGER PRIMARY KEY, run TEXT, kind TEXT, detail TEXT);''')

    def open(self, run, contract):
        with connect(self.path) as db:
            db.execute("INSERT OR IGNORE INTO runs(id,contract,state) VALUES (?,?,'new')", (run,canonical(contract)))
            if db.execute('SELECT contract FROM runs WHERE id=?',(run,)).fetchone()[0] != canonical(contract):
                raise ValueError('run ID belongs to a different task contract')

    def snapshot(self, run):
        with connect(self.path) as db:
            state, action, attempts = db.execute('SELECT state,action,attempts FROM runs WHERE id=?',(run,)).fetchone()
            events = [dict(seq=r[0],kind=r[1],detail=json.loads(r[2])) for r in db.execute('SELECT seq,kind,detail FROM events WHERE run=? ORDER BY seq',(run,))]
        return dict(state=state,action=json.loads(action) if action else None,attempts=attempts,events=events)

    def record(self, run, state, kind, detail=None, action=None, spend=0):
        with connect(self.path) as db:
            db.execute('UPDATE runs SET state=?, action=COALESCE(?,action), attempts=attempts+? WHERE id=?',
                       (state,canonical(action) if action is not None else None,spend,run))
            db.execute('INSERT INTO events(run,kind,detail) VALUES (?,?,?)',(run,kind,canonical(detail or {})))
