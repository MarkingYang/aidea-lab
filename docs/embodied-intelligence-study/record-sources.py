"""Record response hashes for the article's cited primary sources; no full text saved."""
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
body = (ROOT / 'docs/embodied-intelligence-evolution.md').read_text()
sources = {}
section = 'Introduction'
for line in body.splitlines():
    if line.startswith('### '):
        section = line[4:]
    for title, url in re.findall(r'\[([^\]]+)\]\((https?://[^)]+)\)', line):
        sources.setdefault(url, {'url': url, 'title': title, 'sections': []})['sections'].append(section)

def fetch(item):
    result = dict(item, checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat())
    try:
        request = urllib.request.Request(item['url'], headers={'User-Agent': 'Mozilla/5.0 (article source verification)'})
        with urllib.request.urlopen(request, timeout=18) as response:
            data = response.read()
            result.update(status=response.status, final_url=response.url,
                          content_type=response.headers.get('Content-Type'), bytes=len(data),
                          sha256=hashlib.sha256(data).hexdigest())
    except Exception as error:
        result.update(status='request_failed', error=str(error))
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    records = list(pool.map(fetch, sources.values()))
output = {'scope': 'Citation response identity only; HTTP success does not validate source claims. Failed supplemental requests do not negate prior browser verification.',
          'sources': records}
(Path(__file__).parent / 'sources.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
received = lambda r: isinstance(r['status'], int) and 200 <= r['status'] < 300
print(json.dumps({'sources': len(records), 'http_received_2xx': sum(received(r) for r in records),
                  'failed': [{'url': r['url'], 'error': r.get('error')} for r in records if not received(r)]}, ensure_ascii=False))
