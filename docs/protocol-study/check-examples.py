"""Bounded offline checks of article JSON and two official schemas, not protocol conformance."""
from pathlib import Path
from copy import deepcopy
import json,re,hashlib
from jsonschema import Draft202012Validator
from referencing import Registry,Resource
root=Path(__file__).parent
cache=Path('/tmp/aidea-protocol-sources')
manifest=json.loads((root/'manifest.json').read_text())
results=[]
examples={}
for a in manifest['articles']:
 body=Path('src/content/writing',a['slug']+'.md').read_text()
 examples[a['slug']]=[json.loads(b) for b in re.findall(r'```json\n(.*?)\n```',body,re.S)]
 for i,b in enumerate(examples[a['slug']]):results.append({'case':a['slug']+f': JSON {i+1}','result':'pass','scope':'JSON syntax only'})
# ACP validates request params against the unmodified upstream v1 definition.
schema=json.loads((cache/'agent-client-protocol-schema.json').read_text())
v=Draft202012Validator({'$ref':'#/$defs/InitializeRequest','$defs':schema['$defs']})
params=examples['acp-protocol'][0]['params'];v.validate(params)
results.append({'case':'ACP initialize params','result':'pass','scope':'upstream v1 JSON Schema'})
bad=deepcopy(params);bad['protocolVersion']='1'
assert not v.is_valid(bad)
results.append({'case':'ACP rejects string protocolVersion','result':'pass','scope':'negative schema control'})
# A2UI generic envelope resolves its catalog placeholder to the pinned basic catalog.
s=json.loads((cache/'a2ui-server_to_client.json').read_text())
c=json.loads((cache/'a2ui-common_types.json').read_text())
b=json.loads((cache/'a2ui-catalog.json').read_text())
registry=Registry().with_resources([(x['$id'],Resource.from_contents(x)) for x in [s,c,b]])
registry=registry.with_resource('https://a2ui.org/specification/v0_9/catalog.json',Resource.from_contents(b))
v=Draft202012Validator(s,registry=registry)
for i,msg in enumerate(examples['a2ui-protocol'][0]):
 v.validate(msg);results.append({'case':f'A2UI envelope {i+1}','result':'pass','scope':'upstream v0.9 envelope and basic catalog'})
bad=deepcopy(examples['a2ui-protocol'][0][1]);bad['updateComponents']['components'][0]['component']='UnregisteredWidget'
assert not v.is_valid(bad)
results.append({'case':'A2UI rejects unknown component','result':'pass','scope':'negative schema control'})
bad=deepcopy(examples['a2ui-protocol'][0][0]);bad['version']='v0.8'
assert not v.is_valid(bad)
results.append({'case':'A2UI rejects old version','result':'pass','scope':'negative schema control'})
# Check the example function contracts themselves with good and invalid arguments.
for slug,key in [('openai-api-protocol','parameters'),('anthropic-api-protocol','input_schema')]:
 v=Draft202012Validator(examples[slug][0]['tools'][0][key]);v.validate({'ticket_id':'T-17'})
 assert not v.is_valid({'ticket_id':17})
 results.append({'case':slug+' tool argument type','result':'pass','scope':'article tool schema only; no model request'})
(root/'example-results.json').write_text(json.dumps({'checks':results,'limits':'No real MCP/A2A/ACP session, UI renderer, OAuth provider, JWT signature verification or model call is exercised.'},ensure_ascii=False,indent=2)+'\n')
print('PASS',len(results),'bounded example checks')
