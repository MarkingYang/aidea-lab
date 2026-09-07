"""Read selected immutable upstream files; retain hashes, not copied source trees."""
import json,urllib.request,hashlib,concurrent.futures
from pathlib import Path
root=Path(__file__).parent
rs=json.loads((root/'repository-baselines.json').read_text())
files={
'a2aproject/A2A':['specification/a2a.proto'],
'ag-ui-protocol/ag-ui':['sdks/typescript/packages/core/src/events.ts','sdks/typescript/packages/core/src/types.ts'],
'a2ui-project/a2ui':['specification/v0_9/docs/a2ui_protocol.md','specification/v0_9/json/server_to_client.json','specification/v0_9/json/common_types.json','specification/v0_9/catalogs/basic/catalog.json'],
'agentclientprotocol/agent-client-protocol':['schema/v1/schema.json','schema/v1/meta.json'],
'agentskills/agentskills':['docs/specification.mdx']}
cache=Path('/tmp/aidea-protocol-sources');cache.mkdir(exist_ok=True)
def fetch(args):
 r,p=args;u=f"https://raw.githubusercontent.com/{r['repo']}/{r['commit']}/{p}"
 data=urllib.request.urlopen(u,timeout=30).read()
 dest=cache/(r['repo'].split('/')[-1]+'-'+Path(p).name);dest.write_bytes(data)
 return {'repository':r['repo'],'commit':r['commit'],'path':p,'url':u,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'local_review_cache':str(dest)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
 out=list(pool.map(fetch,[(r,p) for r in rs for p in files[r['repo']]]))
(root/'source-files.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
for i in out:print(i['path'],i['bytes'])
