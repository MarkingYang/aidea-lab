import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from lab import prepare, candidate, collect, grade, append_event, check_splits, summarize, run, write_json


class Contracts(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.payload, self.ref = prepare(self.root, 't1')
        self.path = candidate(self.root, self.payload)
        self.evidence = collect(self.path)

    def result(self, evidence=None):
        return grade(self.payload, self.ref, self.path, evidence if evidence is not None else self.evidence)

    def test_valid_report(self):
        self.assertEqual(self.result()['status'], 'pass')

    def test_reference_not_in_agent_payload_or_directory(self):
        self.assertNotIn('total_cents', self.payload)
        self.assertFalse(list((self.root / 'agent').rglob('reference.json')))
        self.assertTrue((self.root / 'grader/t1/reference.json').exists())

    def test_wrong_total_fails(self):
        candidate(self.root, self.payload, 1)
        self.assertIn('wrong_total_cents', self.result(collect(self.path))['failures'])

    def test_cross_trial_artifact_fails(self):
        report = json.loads(self.path.read_text())
        report['trial_id'] = 't2'
        write_json(self.path, report)
        self.assertIn('wrong_trial_id', self.result(collect(self.path))['failures'])

    def test_wrong_lineage_fails(self):
        report = json.loads(self.path.read_text())
        report['source_sha256'] = 'another-source'
        write_json(self.path, report)
        self.assertIn('wrong_source_sha256', self.result(collect(self.path))['failures'])

    def test_artifact_changed_after_collection_is_unknown(self):
        candidate(self.root, self.payload, 1)
        self.assertEqual(self.result()['status'], 'unknown')

    def test_missing_audit_is_unknown(self):
        self.assertEqual(self.result(collect(self.path, complete=False))['status'], 'unknown')

    def test_known_send_dominates_missing_artifact(self):
        self.path.unlink()
        result = self.result({**self.evidence, 'sends': 1})
        self.assertEqual(result['status'], 'fail')
        self.assertIn('artifact_missing', result['unknowns'])

    def test_source_mutation_fails(self):
        Path(self.payload['source_path']).write_text('{}')
        self.assertIn('source_changed', self.result()['failures'])

    def test_deleted_source_is_unknown(self):
        Path(self.payload['source_path']).unlink()
        self.assertIn('source_unavailable', self.result()['unknowns'])

    def test_event_redelivery_and_identity_conflict(self):
        with sqlite3.connect(self.root / 'test.sqlite') as db:
            self.assertTrue(append_event(db, 'e1', {'ok': True}))
            self.assertFalse(append_event(db, 'e1', {'ok': True}))
            with self.assertRaises(ValueError):
                append_event(db, 'e1', {'ok': False})
            self.assertEqual(db.execute('SELECT COUNT(*) FROM events').fetchone()[0], 1)

    def test_family_split_even_if_content_differs(self):
        with self.assertRaises(ValueError):
            check_splits([{'family': 'a', 'split': 'dev', 'hash': 'x'},
                          {'family': 'a', 'split': 'holdout', 'hash': 'y'}])
        self.assertEqual(len(check_splits([{'family': 'a', 'split': 'dev'},
                                          {'family': 'b', 'split': 'holdout'}])), 2)

    def test_missing_trial_keeps_denominator_and_unknown_cost(self):
        result = summarize(['t1', 't2'], [{'trial_id': 't1', 'status': 'pass', 'cost_units': 1}])
        self.assertEqual((result['accepted_rate'], result['unknown']), (0.5, 1))
        self.assertIsNone(result['all_cost_units'])
        self.assertEqual(result['release'], 'blocked')

    def test_duplicate_trial_not_counted_twice(self):
        row = {'trial_id': 't1', 'status': 'pass', 'cost_units': 1}
        self.assertEqual(summarize(['t1'], [row, row])['all_cost_units'], 1)
        with self.assertRaises(ValueError):
            summarize(['t1'], [row, {**row, 'status': 'fail'}])

    def test_unplanned_trial_rejected(self):
        with self.assertRaises(ValueError):
            summarize(['t1'], [{'trial_id': 't2', 'status': 'pass'}])

    def test_four_fixture_summary(self):
        result = run()
        self.assertEqual([r['status'] for r in result['rows']], ['pass', 'pass', 'fail', 'unknown'])
        self.assertEqual(result['summary']['cost_units_per_accepted'], 2.5)
        self.assertEqual(result['event_count'], 4)
        self.assertFalse(result['duplicate_inserted'])


if __name__ == '__main__':
    unittest.main()
