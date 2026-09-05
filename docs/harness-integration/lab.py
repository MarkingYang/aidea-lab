"""Single-worker, bounded one-action Harness with a real local MCP server."""
import argparse
import asyncio
from contextlib import asynccontextmanager
from datetime import timedelta
import json
import os
from pathlib import Path
import sys

import httpx
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from mcp.client.streamable_http import streamable_http_client
from model import propose, validate_action
from store import Runs

EXPECTED={'source':'source-001','title':'核验 Agent Harness 资料'}


@asynccontextmanager
async def local_http(url):
    # Loopback test traffic must not be routed through the machine's proxy.
    async with httpx.AsyncClient(timeout=5,trust_env=False) as client:
        async with streamable_http_client(url,http_client=client) as streams:
            yield streams


@asynccontextmanager
async def session_for(root, crash_server=False, http_url=None):
    if http_url:
        transport=local_http(http_url)
    else:
        args=[str(Path(__file__).with_name('server.py')),'--db',str(root/'tickets.sqlite')]
        if crash_server: args.append('--crash-after-commit')
        transport=stdio_client(StdioServerParameters(command=sys.executable,args=args))
    async with transport as streams:
        async with ClientSession(streams[0],streams[1],read_timeout_seconds=timedelta(seconds=5)) as session:
            negotiated=await session.initialize()
            if negotiated.protocolVersion!='2025-11-25':
                raise ValueError('lab protocol baseline mismatch')
            catalog=await session.list_tools()
            names={tool.name for tool in catalog.tools}
            if not {'lookup_review_ticket','create_review_ticket'} <= names:
                raise ValueError('required tools missing')
            yield session,negotiated.protocolVersion


async def call(session,name,arguments):
    result=await session.call_tool(name,arguments)
    if result.isError:
        raise ValueError('tool execution failed; reconcile writes before retrying')
    data=result.structuredContent
    if not isinstance(data,dict) or 'ticket' not in data:
        raise ValueError('unexpected structured tool result')
    return data['ticket']


async def execute(root,run='review-001',expected=None,provider='fixture',model=None,
                  execute_write=False,fault=None,http_url=None):
    root=Path(root).resolve();root.mkdir(parents=True,exist_ok=True)
    expected=validate_action(EXPECTED if expected is None else expected)
    runs=Runs(root/'runs.sqlite')
    runs.open(run,{'expected':expected,'max_dispatches':2,'provider':provider,'model':model})
    saved=runs.snapshot(run)
    if saved['state'] in {'succeeded','failed'}:return saved
    action=saved['action']
    if action is None:
        action,metadata=await asyncio.to_thread(propose,expected,provider,model)
        if action!=expected:
            runs.record(run,'failed','proposal_rejected')
            return runs.snapshot(run)
        runs.record(run,'planned','proposal_saved',metadata,action=action)
    op=run+':ticket'
    async with session_for(root,crash_server=fault=='server-after-commit',http_url=http_url) as (session,version):
        runs.record(run,'reconciling','session_initialized',{'protocol':version})
        ticket=await call(session,'lookup_review_ticket',{'operation_key':op})
        if ticket is None:
            if not execute_write:
                runs.record(run,'waiting_execution','execution_required')
                return runs.snapshot(run)
            if runs.snapshot(run)['attempts']>=2:
                runs.record(run,'reconcile_required','dispatch_budget_exhausted')
                return runs.snapshot(run)
            runs.record(run,'dispatching','intent_committed',{'operation_key':op},spend=1)
            if fault=='client-after-intent':os._exit(74)
            await call(session,'create_review_ticket',{'operation_key':op,**action})
            if fault=='client-after-result':os._exit(75)
            ticket=await call(session,'lookup_review_ticket',{'operation_key':op})
        valid=isinstance(ticket,dict) and type(ticket.get('id')) is int and ticket.get('action')==expected
        runs.record(run,'succeeded' if valid else 'failed','validation_passed' if valid else 'validation_failed',
                    {'ticket_id':ticket.get('id') if isinstance(ticket,dict) else None})
    return runs.snapshot(run)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--state-dir',required=True)
    parser.add_argument('--run-id',default='review-001')
    parser.add_argument('--provider',choices=['fixture','anthropic'],default='fixture')
    parser.add_argument('--model')
    parser.add_argument('--execute',action='store_true',help='Permit creation in the local test ticket database')
    parser.add_argument('--fault',choices=['server-after-commit','client-after-intent','client-after-result'])
    args=parser.parse_args()
    try:
        result=asyncio.run(execute(args.state_dir,args.run_id,provider=args.provider,model=args.model,
                                  execute_write=args.execute,fault=args.fault))
    except Exception as error:
        # Do not print raw provider responses, headers, or exception groups.
        print(json.dumps({'state':'interrupted','error_type':type(error).__name__,
                          'next':'rerun with the same state directory and run ID, without --fault'}))
        raise SystemExit(2)
    print(json.dumps(result,ensure_ascii=False,indent=2))
    if result['state']=='failed':raise SystemExit(1)


if __name__=='__main__':main()
