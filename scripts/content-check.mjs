import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/content/writing');
const registry = JSON.parse(fs.readFileSync('src/data/knowledge.json', 'utf8'));
const redirects = JSON.parse(fs.readFileSync('src/data/content-redirects.json', 'utf8'));
const migration = JSON.parse(fs.readFileSync('docs/content-restructure-plan.json', 'utf8'));
const files = fs.readdirSync(root).filter(file => file.endsWith('.md'));
const articles = new Set(files.map(file => file.slice(0, -3)));
const domains = new Set(registry.topics.map(item => item.id));
const groups = new Set(registry.series.map(item => item.id));
const errors = [];
const titles = new Set();
const assigned = new Set();
const estimates = [];
if (domains.size !== registry.topics.length || groups.size !== registry.series.length) errors.push('Duplicate directory IDs');
for (const group of registry.series) {
  if (!domains.has(group.topic)) errors.push(`${group.id}: missing domain`);
  if (!group.articles.length) errors.push(`${group.id}: empty topic`);
  for (const id of group.articles) {
    if (!articles.has(id)) errors.push(`${group.id}: missing article ${id}`);
    if (assigned.has(id)) errors.push(`${id}: more than one canonical directory home`);
    assigned.add(id);
  }
}
for (const id of articles) if (!assigned.has(id)) errors.push(`${id}: no directory home`);

function canonicalRoute(href) {
  if (href.startsWith('/writing/')) return articles.has(href.split('/')[2]);
  if (href.startsWith('/series/') && href !== '/series/') return groups.has(href.split('/')[2]);
  if (href.startsWith('/topics/') && href !== '/topics/') return domains.has(href.split('/')[2]);
  if (href.startsWith('/labs/')) return fs.existsSync(path.join('public', href));
  return true;
}
for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) { errors.push(`${file}: missing frontmatter`); continue; }
  const front = match[1], body = source.slice(match[0].length);
  const title = front.match(/^title: (.+)$/m)?.[1];
  const description = front.match(/^description: (.+)$/m)?.[1];
  if (!title || titles.has(title)) errors.push(`${file}: missing or duplicate title`);
  titles.add(title);
  if (!description || description.length < 20 || description.length > 120) errors.push(`${file}: description must be 20–120 characters`);
  if (!/^updatedAt: \d{4}-\d{2}-\d{2}$/m.test(front)) errors.push(`${file}: missing revision date`);
  const minutes = Number(front.match(/^readingTime: (\d+) min$/m)?.[1]);
  const estimate = estimateMainReadingMinutes(body);
  if (!minutes || minutes + 1 < estimate) errors.push(`${file}: reading time ${minutes} underestimates ${estimate}`);
  estimates.push({ article:file.slice(0,-3), minutes, estimate });
  if ((body.match(/^```/gm) || []).length % 2) errors.push(`${file}: unbalanced code fences`);
  const prose = body.replace(/```[\s\S]*?```/g,'');
  if (/^> .*系列：|^上一篇：|^下一篇：/m.test(prose)) errors.push(`${file}: stale duplicated navigation`);
  const headings = [...prose.matchAll(/^(#{2,6}) (.+)$/gm)];
  for (let i=1; i<headings.length; i++) if(headings[i][1].length>headings[i-1][1].length+1) errors.push(`${file}: heading hierarchy jumps`);
  const diagrams = (body.match(/^```mermaid/gm)||[]).length;
  if ((body.match(/\*图 \d+｜/g)||[]).length!==diagrams) errors.push(`${file}: diagram/caption count differs`);
  for (const link of body.matchAll(/\]\((\/[^)\s]+)\)/g)) {
    const href = link[1].split(/[?#]/)[0];
    if (redirects[href]) errors.push(`${file}: internal link still uses retired route ${href}`);
    if (!canonicalRoute(href)) errors.push(`${file}: broken link ${href}`);
  }
}
for (const [from,to] of Object.entries(redirects)) {
  if (from===to || redirects[to] || !canonicalRoute(to)) errors.push(`Redirect must resolve directly: ${from} → ${to}`);
  if (from.startsWith('/writing/') && articles.has(from.split('/')[2])) errors.push(`Retired article is still published: ${from}`);
}
for (const item of migration.articles) {
  if (!articles.has(item.target)) errors.push(`Migration destination is missing: ${item.target}`);
  if (item.source!==item.target && redirects[`/writing/${item.source}/`]!==`/writing/${item.target}/`) errors.push(`Migration redirect mismatch: ${item.source}`);
}
console.log(JSON.stringify({ domains:domains.size, topics:groups.size, articles:articles.size, redirects:Object.keys(redirects).length, readingMinutes:[Math.min(...estimates.map(x=>x.estimate)),Math.max(...estimates.map(x=>x.estimate))], errors },null,2));
if(errors.length) process.exitCode=1;
function estimateMainReadingMinutes(body) {
  // Collapsed evidence appendices and source lists are optional reading; navigation is interface chrome.
  const main = body
    .replace(/^> .*系列：.*$/gm, '')
    .replace(/<details>[\s\S]*?<\/details>/g, '')
    .replace(/^## (?:参考资料|参考与延伸|资料来源|延伸阅读)[\s\S]*$/m, '');
  const blocks = [...main.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)];
  const prose = main
    .replace(/```[^\n]*\n[\s\S]*?```/g, '')
    .replace(/https?:\/\/[^)\s]+/g, '')
    .replace(/[|#>*`_\[\]()]/g, ' ');
  const han = (prose.match(/[\p{Script=Han}]/gu) || []).length;
  const english = (prose.match(/[A-Za-z][A-Za-z0-9.+/-]*/g) || []).length;
  const figures = blocks.filter(x => ['mermaid', 'echarts'].includes(x[1].trim())).length;
  const codeLines = blocks
    .filter(x => !['mermaid', 'echarts'].includes(x[1].trim()))
    .reduce((sum, x) => sum + x[2].split('\n').filter(Boolean).length, 0);
  const tableRows = main.split('\n').filter(x => /^\|.*\|$/.test(x) && !/^\|[ :|-]+\|$/.test(x)).length;
  return Math.max(1, Math.ceil(han / 350 + english / 190 + figures * 0.45 + tableRows * 0.035 + codeLines * 0.03));
}
