// Run from repository root. Optional browser QA uses an already installed Playwright.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(new URL('./series.json', import.meta.url), 'utf8'));
const knowledge = JSON.parse(fs.readFileSync(path.join(root, 'src/data/knowledge.json'), 'utf8'));
const errors = [];
const articles = [];
const known = new Set(fs.readdirSync(path.join(root, 'src/content/writing')).map(x => x.replace(/\.mdx?$/, '')));
const seenTitles = new Map();
const seenDescriptions = new Map();

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

for (const priority of [1, 2]) {
  if (!manifest.some(series => series.priority === priority)) errors.push(`priority ${priority}: no series registered`);
}
for (const series of manifest) {
  if (![1, 2].includes(series.priority)) errors.push(`${series.original}: invalid editorial priority`);
  if (series.articles[0]?.slug !== series.original) errors.push(`${series.original}: entry article must preserve original slug`);
  if (series.articles.length < 3) errors.push(`${series.original}: total-part-total series needs at least three articles`);
  const registry = knowledge.series.find(item => item.articles?.includes(series.original));
  if (!registry) {
    errors.push(`${series.original}: missing from knowledge registry`);
  } else if (JSON.stringify(registry.articles) !== JSON.stringify(series.articles.map(item => item.slug))) {
    errors.push(`${series.original}: editorial order differs from knowledge registry`);
  }
  let crossSeriesLinks = 0;
  for (const [i, item] of series.articles.entries()) {
    const source = fs.readFileSync(path.join(root, 'src/content/writing', item.slug + '.md'), 'utf8');
    const front = source.match(/^---\n([\s\S]*?)\n---\n/);
    if (!front) { errors.push(`${item.slug}: missing frontmatter`); continue; }
    const body = source.slice(front[0].length);
    const title = front[1].match(/^title: (.+)$/m)?.[1]?.trim();
    const description = front[1].match(/^description: (.+)$/m)?.[1]?.trim();
    if (title !== item.title) errors.push(`${item.slug}: manifest title differs from frontmatter`);
    if (!description) errors.push(`${item.slug}: missing description`);
    if (description && (description.length < 20 || description.length > 120)) errors.push(`${item.slug}: description should be 20-120 characters`);
    if (!/^updatedAt: \d{4}-\d{2}-\d{2}$/m.test(front[1])) errors.push(`${item.slug}: missing updatedAt`);
    if (seenTitles.has(title)) errors.push(`${item.slug}: duplicate title with ${seenTitles.get(title)}`);
    if (seenDescriptions.has(description)) errors.push(`${item.slug}: duplicate description with ${seenDescriptions.get(description)}`);
    seenTitles.set(title, item.slug);
    seenDescriptions.set(description, item.slug);
    const minutes = Number(front[1].match(/^readingTime: (\d+) min$/m)?.[1]);
    if (!(minutes > 0 && minutes <= 10)) errors.push(`${item.slug}: invalid reading budget`);
    const estimatedMinutes = estimateMainReadingMinutes(body);
    if (estimatedMinutes > 10) errors.push(`${item.slug}: estimated main reading is ${estimatedMinutes} min`);
    if (minutes + 1 < estimatedMinutes) errors.push(`${item.slug}: readingTime ${minutes} min underestimates ${estimatedMinutes} min main path`);
    if ((body.match(/^```/gm) || []).length % 2) errors.push(`${item.slug}: unbalanced fences`);
    if (/\]\((?:file:\/\/|\/Users\/|[A-Za-z]:\\)/.test(body)) errors.push(`${item.slug}: local filesystem link leaked into article`);
    const headingLevels = [...body.matchAll(/^(#{2,6})\s+/gm)].map(match => match[1].length);
    for (let j = 1; j < headingLevels.length; j += 1) {
      if (headingLevels[j] > headingLevels[j - 1] + 1) errors.push(`${item.slug}: heading level jumps from h${headingLevels[j - 1]} to h${headingLevels[j]}`);
    }
    const proseParagraphs = body
      .replace(/```[\s\S]*?```/g, '')
      .split(/\n\s*\n/)
      .map(x => x.replace(/\s+/g, ' ').trim())
      .filter(x => x.length >= 80 && !x.startsWith('> ') && !x.startsWith('|'));
    const paragraphSet = new Set();
    for (const paragraph of proseParagraphs) {
      if (paragraphSet.has(paragraph)) errors.push(`${item.slug}: duplicated prose paragraph`);
      paragraphSet.add(paragraph);
    }
    for (const match of body.matchAll(/\]\(\/writing\/([^/)#]+)\/?(?:#[^)]*)?\)/g)) {
      if (!known.has(match[1])) errors.push(`${item.slug}: broken writing link ${match[1]}`);
      if (!series.articles.some(article => article.slug === match[1])) crossSeriesLinks += 1;
    }
    const nav = body.split('\n').find(line => line.startsWith('> ') && line.includes('系列：')) || '';
    for (const part of series.articles) {
      if (!nav.includes(`/writing/${part.slug}/`)) errors.push(`${item.slug}: incomplete navigation`);
    }
    const previousLink = body.match(/上一篇：\[[^\]]+\]\(\/writing\/([^/)]+)\/\)/)?.[1];
    if (i > 0 && previousLink !== series.articles[i - 1].slug) errors.push(`${item.slug}: wrong previous link`);
    if (i < series.articles.length - 1 && !body.includes(`](/writing/${series.articles[i + 1].slug}/)。`)) errors.push(`${item.slug}: no next link`);
    if (i === 0 && !/(地图|全景|框架|主线|先看|先把)/.test(`${title}\n${body.slice(0, 1800)}`)) errors.push(`${item.slug}: entry article does not establish a map`);
    if (i === series.articles.length - 1) {
      if (!body.includes('本系列到此完成')) errors.push(`${item.slug}: synthesis does not close the series`);
      if (!body.includes(`/writing/${series.original}/`)) errors.push(`${item.slug}: synthesis does not link back to entry`);
    }
    const diagrams = [...body.matchAll(/```mermaid\n([\s\S]*?)```/g)];
    const diagramCount = diagrams.length;
    const diagramTypes = [];
    for (const diagram of diagrams) {
      const declarations = diagram[1].match(/^(?:flowchart|graph\s|sequenceDiagram|stateDiagram(?:-v2)?|classDiagram|erDiagram|gantt|mindmap)\b/gm) || [];
      if (declarations.length !== 1) errors.push(`${item.slug}: Mermaid block must contain exactly one diagram declaration`);
      diagramTypes.push(declarations[0]?.trim().split(/\s+/)[0] || 'unknown');
    }
    if ((body.match(/\*图 \d+｜/g) || []).length !== diagramCount) errors.push(`${item.slug}: diagram captions missing`);
    if (/\b(?:TODO|TBD)\b/.test(body)) errors.push(`${item.slug}: unresolved placeholder`);
    articles.push({ ...item, priority: series.priority, minutes, estimatedMinutes, diagramCount, diagramTypes });
  }
  if (crossSeriesLinks === 0) errors.push(`${series.original}: series has no cross-series knowledge links`);
}
console.log(JSON.stringify({ series: manifest.length, articles: articles.length,
  priorities: Object.fromEntries([1, 2].map(priority => [priority, {
    series: manifest.filter(item => item.priority === priority).length,
    articles: articles.filter(item => item.priority === priority).length,
  }])),
  diagrams: articles.reduce((sum, x) => sum + x.diagramCount, 0),
  minutes: [Math.min(...articles.map(x => x.minutes)), Math.max(...articles.map(x => x.minutes))],
  estimatedMainMinutes: [Math.min(...articles.map(x => x.estimatedMinutes)), Math.max(...articles.map(x => x.estimatedMinutes))],
  errors }, null, 2));
if (errors.length) process.exit(1);

const packageRoot = process.env.EDITORIAL_PLAYWRIGHT_ROOT;
if (packageRoot) {
  const require = createRequire(import.meta.url);
  const { chromium } = require(require.resolve('playwright', { paths: [packageRoot] }));
  const browser = await chromium.launch({ headless: true, channel: process.env.EDITORIAL_BROWSER_CHANNEL || 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
  const base = process.env.EDITORIAL_BASE_URL || 'http://localhost:4321';
  const screenshots = process.env.EDITORIAL_SCREENSHOTS;
  const selected = new Set(['agent-system-evaluation-research', 'deepseek-harness-state', 'ai-value-voice']);
  try {
    for (const item of articles) {
      const response = await page.goto(`${base}/writing/${item.slug}/`, { waitUntil: 'networkidle' });
      if (response?.status() !== 200) throw new Error(`${item.slug}: HTTP ${response?.status()}`);
      await page.waitForFunction(expected => document.querySelectorAll('.mermaid svg').length === expected, item.diagramCount, { timeout: 20000 });
      const state = await page.evaluate(() => ({
        diagrams: document.querySelectorAll('.mermaid svg').length,
        diagramErrors: document.querySelectorAll('.mermaid .error-icon, .mermaid .error-text').length,
        diagramHeights: [...document.querySelectorAll('.mermaid-figure')].map(element => Math.round(element.getBoundingClientRect().height)),
        mathErrors: document.querySelectorAll('.katex-error').length,
        headings: [...document.querySelectorAll('.prose h2')].map(x => x.textContent),
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
      }));
      if (state.diagramErrors || state.mathErrors || state.overflow) throw new Error(`${item.slug}: ${JSON.stringify(state)}`);
      for (const [index, height] of state.diagramHeights.entries()) {
        if (['flowchart', 'graph'].includes(item.diagramTypes[index]) && height > 1200) {
          throw new Error(`${item.slug}: flowchart ${index + 1} is ${height}px tall; split it or use a clearer reading direction`);
        }
      }
      if (screenshots && selected.has(item.slug) && item.diagramCount) {
        await page.locator('.mermaid-figure').first().screenshot({ path: path.join(screenshots, item.slug + '.png'), style: 'header { visibility: hidden !important; }' });
      }
      console.log(`BROWSER PASS ${item.slug} diagrams=${state.diagrams}`);
    }
    // Mobile layout check: a representative page from every series.
    await page.setViewportSize({ width: 390, height: 844 });
    for (const series of manifest) {
      await page.goto(`${base}/writing/${series.original}/`, { waitUntil: 'networkidle' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2)) throw new Error(`${series.original}: mobile overflow`);
    }
    console.log(`BROWSER PASS: all article diagrams/math + ${manifest.length} mobile entry pages`);
  } finally { await browser.close(); }
}
