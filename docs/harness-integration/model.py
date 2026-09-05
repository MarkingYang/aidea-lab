"""Optional non-streaming Anthropic adapter; fixture tests do not call the API."""
import json
import os
from urllib.request import Request, urlopen

TOOL='propose_review_ticket'
SCHEMA={'type':'object','properties':{'source':{'type':'string'},'title':{'type':'string'}},
        'required':['source','title'],'additionalProperties':False}


def validate_action(action):
    if not isinstance(action,dict) or set(action)!={'source','title'}:
        raise ValueError('action must contain exactly source and title')
    if any(not isinstance(v,str) or not v.strip() or len(v)>300 for v in action.values()):
        raise ValueError('action fields must be non-empty strings of at most 300 characters')
    return dict(action)


def parse_response(response):
    if response.get('stop_reason')!='tool_use':
        raise ValueError('no complete tool-use proposal; nothing may execute')
    blocks=response.get('content')
    if not isinstance(blocks,list) or any(not isinstance(b,dict) for b in blocks):
        raise ValueError('invalid content blocks')
    calls=[b for b in blocks if b.get('type')=='tool_use']
    if len(calls)!=1 or calls[0].get('name')!=TOOL:
        raise ValueError('exactly one permitted proposal required')
    return validate_action(calls[0].get('input'))


def propose(expected, provider='fixture', model=None):
    if provider=='fixture':
        response={'stop_reason':'tool_use','content':[{'type':'tool_use','name':TOOL,'input':expected}]}
        return parse_response(response),{'provider':'fixture','live':False}
    key=os.environ.get('ANTHROPIC_API_KEY')
    if not key or not model:
        raise ValueError('live mode requires ANTHROPIC_API_KEY and explicit --model')
    payload={'model':model,'max_tokens':512,'stream':False,
             'messages':[{'role':'user','content':'Propose this exact local test ticket: '+json.dumps(expected,ensure_ascii=False)}],
             'tools':[{'name':TOOL,'description':'Propose a local review ticket; does not execute a write.','input_schema':SCHEMA}],
             'tool_choice':{'type':'tool','name':TOOL,'disable_parallel_tool_use':True}}
    request=Request('https://api.anthropic.com/v1/messages',data=json.dumps(payload).encode(),
                    headers={'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'})
    with urlopen(request,timeout=30) as reply:
        data=reply.read(1_048_577)
        if len(data)>1_048_576:
            raise ValueError('model response exceeds local size limit')
        response=json.loads(data)
    return parse_response(response),{'provider':'anthropic','live':True,'model':response.get('model'),
                                     'response_id':response.get('id'),'usage':response.get('usage')}
