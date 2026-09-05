import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from core import Business, EXPECTED, ResponseLost, advance, initial


class Contracts(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'business.sqlite'
        self.business = Business(self.path)

    def tearDown(self):
        self.temp.cleanup()

    def test_duplicate_operation_returns_one_resource(self):
        for _ in range(2):
            self.business.create('key', EXPECTED)
        self.assertEqual(self.business.summary()['tickets'], 1)

    def test_changed_payload_under_same_key_is_rejected(self):
        self.business.create('key', EXPECTED)
        with self.assertRaises(ValueError):
            self.business.create('key', {**EXPECTED, 'field': 'published'})
        self.assertEqual(self.business.lookup('key'), EXPECTED)

    def test_revocation_at_resource_boundary_blocks_write(self):
        self.business.set_policy(allowed=False)
        self.assertFalse(self.business.create('key', EXPECTED))
        self.assertEqual(self.business.summary()['tickets'], 0)

    def test_cancel_after_commit_reports_existing_effect(self):
        state = {**initial(task='baseline', fault='response_lost'), 'approved': True}
        with self.assertRaises(ResponseLost):
            advance(state, self.path)
        self.business.set_policy(cancelled=True)
        result = advance(state, self.path)
        self.assertEqual(result['status'], 'cancelled_with_effect')
        self.assertEqual(self.business.summary()['tickets'], 1)

    def test_wrong_existing_result_is_not_accepted(self):
        self.business.create('review:ticket', {**EXPECTED, 'observed': 'wrong'})
        self.assertEqual(advance(initial(), self.path)['status'], 'failed')

    def test_fixture_uses_observations_before_proposal(self):
        state = initial()
        for _ in range(3):
            state = advance(state, self.path)
        self.assertEqual(set(state['observations']), {'notice', 'catalog'})
        self.assertEqual(state['proposal'], EXPECTED)
        self.assertEqual(state['calls'], 3)
        self.assertEqual(self.business.summary()['tickets'], 0)

    def subprocess_resume(self, function):
        script = '''import json,sys
from core import initial
from runners import FUNCTION
result=FUNCTION(sys.argv[1],initial(),approval=True if sys.argv[2]=='resume' else None)
print(json.dumps(result))'''.replace('FUNCTION', function)
        def run(mode):
            output = subprocess.check_output([sys.executable, '-c', script, str(self.path), mode],
                                             cwd=Path(__file__).parent, text=True)
            return json.loads(output)
        self.assertEqual(run('start')['status'], 'waiting')
        result = run('resume')
        self.assertEqual(result['status'], 'succeeded')
        self.assertEqual(result['calls'], 3)
        self.assertEqual(self.business.summary()['tickets'], 1)

    def test_explicit_runner_resumes_in_a_new_process(self):
        self.subprocess_resume('run_explicit')

    def test_graph_resumes_in_a_new_process(self):
        self.subprocess_resume('run_graph')


if __name__ == '__main__':
    unittest.main()
