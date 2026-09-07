"""Insert reviewed diagrams once, preserving prose and publication dates."""
from pathlib import Path
import json,re,hashlib,math
from collections import Counter
base=Path(__file__).parent
items=json.loads((base/'specs.json').read_text())
records=[]
for slug in dict.fromkeys(x['slug'] for x in items):
 p=Path('src/content/writing')/(slug+'.md');original=p.read_text();text=original
 assert '<!-- diagram:' not in text, f'{slug}: already applied'
 chosen=[x for x in items if x['slug']==slug]
 for i,x in enumerate(chosen,1):
  heading='## '+x['heading']+'\n'
  assert text.count(heading)==1,(slug,heading)
  lines=x['code'].splitlines();lines.insert(1,'%% title: '+x['kind']);code='\n'.join(lines)
  block=f'\n<!-- diagram:{slug}-{i} -->\n\n```mermaid\n{code}\n```\n\n{x["caption"]}\n\n<!-- /diagram -->\n'
  text=text.replace(heading,heading+block,1)
 # Article revision changed; never reset original publication date.
 if re.search(r'^updatedAt:',text,re.M):text=re.sub(r'^updatedAt: .+$','updatedAt: 2026-09-07',text,count=1,flags=re.M)
 else:text=text.replace('\ntype:','\nupdatedAt: 2026-09-07\ntype:',1)
 # Apply existing content-check's conservative reading-time estimator.
 body=text.split('---',2)[2]
 main=re.sub(r'^## (?:参考资料|参考与延伸|资料来源|延伸阅读)[\s\S]*$','',body,flags=re.M)
 blocks=re.findall(r'```([^\n]*)\n([\s\S]*?)```',main)
 prose=re.sub(r'```[\s\S]*?```','',main);prose=re.sub(r'https?://[^)\s]+','',prose)
 han=len(re.findall(r'[\u3400-\u9fff]',prose));eng=len(re.findall(r'[A-Za-z][A-Za-z0-9.+/-]*',prose))
 diagrams=sum(a.strip() in ['mermaid','echarts'] for a,b in blocks)
 code_lines=sum(len([l for l in b.splitlines() if l.strip()]) for a,b in blocks if a.strip() not in ['mermaid','echarts'])
 rows=sum(bool(re.match(r'^\|.*\|$',l)) and not bool(re.match(r'^\|[ :|\-]+\|$',l)) for l in main.splitlines())
 estimate=math.ceil(han/350+eng/190+diagrams*.45+rows*.035+code_lines*.03)
 old=int(re.search(r'^readingTime: (\d+) min$',text,re.M)[1])
 text=re.sub(r'^readingTime: \d+ min$',f'readingTime: {max(old,estimate)} min',text,count=1,flags=re.M)
 p.write_text(text)
 records.append(dict(slug=slug,source_sha256_before=hashlib.sha256(original.encode()).hexdigest(),source_sha256_after=hashlib.sha256(text.encode()).hexdigest(),diagrams=len(chosen),kinds=dict(Counter(x['kind'] for x in chosen))))
(base/'manifest.json').write_text(json.dumps(dict(date='2026-09-07',status='local_unpublished',basis_commit='b33cd5a',articles=records,diagram_count=len(items)),ensure_ascii=False,indent=2)+'\n')
print(len(records),'articles;',len(items),'diagrams;',dict(Counter(x['kind'] for x in items)))
