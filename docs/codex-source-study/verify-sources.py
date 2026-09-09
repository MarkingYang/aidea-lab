"""Check immutable source identity. This does not compile or execute Codex."""
import argparse
import hashlib
import json
from pathlib import Path
import urllib.request

HERE = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, help='Checkout at the pinned commit; otherwise fetch GitHub Raw')
    parser.add_argument('--output', type=Path, default=HERE / 'source-verification.json')
    args = parser.parse_args()
    manifest = json.loads((HERE / 'sources.json').read_text())
    results = []
    for item in manifest['files']:
        if args.source_root:
            data = (args.source_root / item['path']).read_bytes()
        else:
            request = urllib.request.Request(item['raw_url'], headers={'User-Agent': 'aidea-source-study'})
            with urllib.request.urlopen(request, timeout=60) as response:
                data = response.read()
        digest = hashlib.sha256(data).hexdigest()
        assert digest == item['sha256'], f"Source mismatch: {item['path']}"
        for anchor in item.get('anchors', []):
            assert anchor['text'] in data.decode('utf-8').splitlines()[anchor['line'] - 1], anchor
        results.append({'path': item['path'], 'sha256': digest, 'matched': True})
    args.output.write_text(json.dumps({'commit': manifest['commit'],
                                      'method': 'local files' if args.source_root else 'GitHub Raw download',
                                      'kind': 'source identity and line-anchor check only',
                                      'upstream_tests_run': False, 'files': results}, indent=2) + '\n')
    print(f'Verified {len(results)} source files; no Codex runtime tests executed')


if __name__ == '__main__':
    main()
