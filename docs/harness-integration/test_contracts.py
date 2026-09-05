import asyncio
import copy
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

from lab import EXPECTED, execute, session_for
from model import TOOL, parse_response, propose
from store import Runs, Tickets, connect

HERE=Path(__file__).resolve().parent


class ModelContracts(unittest.TestCase):
    def setUp(self):
        self.response={'stop_reason':'tool_use','content':[{'type':'tool_use','name':TOOL,'input':dict(EXPECTED)}]}

    def test_complete_proposal(self):
        self.assertEqual(parse_response(self.response),EXPECTED)

    def test_truncated_proposal_rejected(self):
        self.response['stop_reason']='max_tokens'
        with self.assertRaises(ValueError):parse_response(self.response)

    def test_plain_text_rejected(self):
        self.response['stop_reason']='end_turn'
        self.response['content']=[{'type':'text','text':'Done'}]
        with self.assertRaises(ValueError):parse_response(self.response)

    def test_parallel_proposals_rejected(self):
        self.response['content']*=2
        with self.assertRaises(ValueError):parse_response(self.response)

    def test_wrong_tool_rejected(self):
        self.response['content'][0]['name']='delete_everything'
        with self.assertRaises(ValueError):parse_response(self.response)

    def test_extra_authority_field_rejected(self):
        self.response['content'][0]['input']['approved']=True
        with self.assertRaises(ValueError):parse_response(self.response)

    def test_blank_field_rejected(self):
        self.response['content'][0]['input']['title']=' '
        with self.assertRaises(ValueError):parse_response(self.response)

    def test_live_missing_credentials_never_sends(self):
        with patch.dict(os.environ,{},clear=True),patch('model.urlopen') as send:
            with self.assertRaises(ValueError):propose(EXPECTED,'anthropic','explicit-model')
            send.assert_not_called()


class IntegrationContracts(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)

    def cli(self,*args):
        return subprocess.run([sys.executable,str(HERE/'lab.py'),'--state-dir',str(self.root),*args],
                              capture_output=True,text=True,timeout=20,
                              env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})

    def count(self):
        with connect(self.root/'tickets.sqlite') as db:
            return db.execute('SELECT COUNT(*) FROM tickets').fetchone()[0]

    def test_default_stops_before_write(self):
        result=self.cli()
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual(json.loads(result.stdout)['state'],'waiting_execution')
        self.assertEqual(self.count(),0)

    def test_stdio_happy_path_and_terminal_resume(self):
        first=self.cli('--execute');second=self.cli('--execute')
        self.assertEqual(first.returncode,0,first.stderr)
        self.assertEqual(second.returncode,0,second.stderr)
        self.assertEqual(json.loads(first.stdout),json.loads(second.stdout))
        self.assertEqual(self.count(),1)
        self.assertEqual(json.loads(first.stdout)['events'][1]['detail']['protocol'],'2025-11-25')

    def recover(self,fault,expected_count,needs_execute):
        broken=self.cli('--execute','--fault',fault)
        self.assertNotEqual(broken.returncode,0)
        self.assertEqual(self.count(),expected_count)
        self.assertEqual(Runs(self.root/'runs.sqlite').snapshot('review-001')['state'],'dispatching')
        resumed=self.cli(*(['--execute'] if needs_execute else []))
        self.assertEqual(resumed.returncode,0,resumed.stderr)
        snapshot=json.loads(resumed.stdout)
        self.assertEqual(snapshot['state'],'succeeded')
        self.assertEqual(self.count(),1)
        self.assertEqual(sum(e['kind']=='proposal_saved' for e in snapshot['events']),1)
        return snapshot

    def test_server_process_exits_after_commit(self):
        snapshot=self.recover('server-after-commit',1,False)
        self.assertEqual(snapshot['attempts'],1)

    def test_client_process_exits_after_intent(self):
        snapshot=self.recover('client-after-intent',0,True)
        self.assertEqual(snapshot['attempts'],2)

    def test_client_process_exits_after_result(self):
        snapshot=self.recover('client-after-result',1,False)
        self.assertEqual(snapshot['attempts'],1)

    def test_changed_contract_rejected(self):
        self.assertEqual(self.cli().returncode,0)
        with self.assertRaises(ValueError):
            asyncio.run(execute(self.root,expected={**EXPECTED,'title':'changed'}))
        self.assertEqual(self.count(),0)

    def test_wrong_existing_resource_fails_validation(self):
        Tickets(self.root/'tickets.sqlite').create('review-001:ticket','wrong','wrong')
        result=self.cli('--execute')
        self.assertEqual(result.returncode,1,result.stderr)
        self.assertEqual(json.loads(result.stdout)['state'],'failed')
        self.assertEqual(self.count(),1)

    def test_http_transport_happy_path(self):
        with socket.socket() as sock:
            sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
        process=subprocess.Popen([sys.executable,str(HERE/'server.py'),'--db',str(self.root/'tickets.sqlite'),
                                  '--transport','streamable-http','--port',str(port)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        try:
            deadline=time.monotonic()+8
            while True:
                if process.poll() is not None:self.fail('HTTP test server exited')
                try:
                    with socket.create_connection(('127.0.0.1',port),timeout=.1):break
                except OSError:
                    if time.monotonic()>deadline:self.fail('HTTP server startup timeout')
                    time.sleep(.05)
            result=asyncio.run(execute(self.root,execute_write=True,http_url=f'http://127.0.0.1:{port}/mcp'))
            self.assertEqual(result['state'],'succeeded')
            self.assertEqual(self.count(),1)
        finally:
            process.terminate()
            try:process.wait(timeout=5)
            except subprocess.TimeoutExpired:process.kill();process.wait(timeout=5)


if __name__=='__main__':unittest.main()
