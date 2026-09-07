"""Verify cited primary-source URLs and record fetched-byte hashes; no upstream text is republished."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,urllib.parse,re,json,hashlib,datetime
root=Path(__file__).parent
m=json.loads((root/'manifest.json').read_text())
urls={}
for a in m['articles']:
 s=Path('src/content/writing',a['slug']+'.md').read_text()
 for u in re.findall(r'\]\((https://[^\s)]+)\)',s):
  u=u.split('#')[0];urls.setdefault(u,[]).append(a['slug'])
previous={x["url"]:x for x in json.loads((root/"sources.json").read_text())["sources"] if "status" in x} if (root/"sources.json").exists() else {}
def fetch(u):
 if u in previous:
  cached=dict(previous[u]);cached["articles"]=sorted(set(urls[u]));return cached
 actual=u
 if u.startswith('https://github.com/') and '/blob/' in u:
  actual=u.replace('https://github.com/','https://raw.githubusercontent.com/').replace('/blob/','/')
 try:
  req=urllib.request.Request(actual,headers={'User-Agent':'Mozilla/5.0 AideaProtocolResearch/1.0'})
  with urllib.request.urlopen(req,timeout=25) as r:
   data=r.read();result={'url':u,'fetched_url':r.url,'status':r.status,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 except Exception as e:result={'url':u,'error':str(e)}
 result['articles']=sorted(set(urls[u]));return result
with ThreadPoolExecutor(max_workers=6) as p:r=list(p.map(fetch,sorted(urls)))
(root/'sources.json').write_text(json.dumps({'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sources':r},ensure_ascii=False,indent=2)+'\n')
print('Sources:',len(r),'passed:',sum('status' in i for i in r))
for i in r:
 if 'error' in i:print(i['url'],i['error'])
