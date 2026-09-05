"""Local MCP test service. Fault flag is test-only, never a tool parameter."""
import argparse
import os
from mcp.server.fastmcp import FastMCP
from store import Tickets
from pydantic import BaseModel


class TicketEnvelope(BaseModel):
    ticket: dict | None


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--db',required=True)
    parser.add_argument('--transport',choices=['stdio','streamable-http'],default='stdio')
    parser.add_argument('--port',type=int,default=8765)
    parser.add_argument('--crash-after-commit',action='store_true')
    args=parser.parse_args()
    tickets=Tickets(args.db)
    server=FastMCP('local-review-lab',host='127.0.0.1',port=args.port,json_response=True,log_level='ERROR')

    @server.tool()
    def lookup_review_ticket(operation_key: str) -> TicketEnvelope:
        """Read the authoritative local ticket for an application operation key."""
        return TicketEnvelope(ticket=tickets.lookup(operation_key))

    @server.tool()
    def create_review_ticket(operation_key: str, source: str, title: str) -> TicketEnvelope:
        """Create one local ticket; same operation key must retain identical parameters."""
        if not operation_key or not source or not title:
            raise ValueError('non-empty parameters required')
        ticket=tickets.create(operation_key,source,title)
        if args.crash_after_commit:
            os._exit(73)
        return TicketEnvelope(ticket=ticket)

    server.run(transport=args.transport)


if __name__=='__main__':
    main()
