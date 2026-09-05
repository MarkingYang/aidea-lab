// Run from repository root. Optional browser QA uses an already installed Playwright.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(fs.readFileSync(new URL('./series.json', import.meta.url), 'utf8'));
const errors = [];
const articles = [];
const known = new Set(fs.readdirSync(path.join(root, 'src/content/writing')).map(x => x.replace(/\.mdx?$/, '')));
for (const series of manifest) {
  for (const [i, item] of series.articles.entries()) {
    const source = fs.readFileSync(path.join(root, 'src/content/writing', item.slug + '.md'), 'utf8');
    const front = source.match(/^---\n([\s\S]*?)\n---\n/);
    if (!front) { errors.push(`${item.slug}: missing frontmatter`); continue; }
    const body = source.slice(front[0].length);
    const minutes = Number(front[1].match(/^readingTime: (\d+) min$/m)?.[1]);
    if (!(minutes > 0 && minutes <= 10)) errors.push(`${item.slug}: invalid reading budget`);
    if ((body.match(/^```/gm) || []).length % 2) errors.push(`${item.slug}: unbalanced fences`);
    for (const match of body.matchAll(/\]\(\/writing\/([^/)#]+)\/?(?:#[^)]*)?\)/g)) {
      if (!known.has(match[1])) errors.push(`${item.slug}: broken writing link ${match[1]}`);
    }
    const nav = body.split('\n').find(line => line.startsWith('> ') && line.includes('系列：')) || '';
    for (const part of series.articles) {
      if (!nav.includes(`/writing/${part.slug}/`)) errors.push(`${item.slug}: incomplete navigation`);
    }
    const previousLink = body.match(/上一篇：\[[^\]]+\]\(\/writing\/([^/)]+)\/\)/)?.[1];
    if (i > 0 && previousLink !== series.articles[i - 1].slug) errors.push(`${item.slug}: wrong previous link`);
    if (i < series.articles.length - 1 && !body.includes(`](/writing/${series.articles[i + 1].slug}/)。`)) errors.push(`${item.slug}: no next link`);
    const diagramCount = [...body.matchAll(/```mermaid\n([\s\S]*?)```/g)].length;
    if ((body.match(/\*图 \d+｜/g) || []).length !== diagramCount) errors.push(`${item.slug}: diagram captions missing`);
    if (/\b(?:TODO|TBD)\b/.test(body)) errors.push(`${item.slug}: unresolved placeholder`);
    articles.push({ ...item, minutes, diagramCount });
  }
}
console.log(JSON.stringify({ series: manifest.length, articles: articles.length,
  diagrams: articles.reduce((sum, x) => sum + x.diagramCount, 0),
  minutes: [Math.min(...articles.map(x => x.minutes)), Math.max(...articles.map(x => x.minutes))], errors }, null, 2));
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
        mathErrors: document.querySelectorAll('.katex-error').length,
        headings: [...document.querySelectorAll('.prose h2')].map(x => x.textContent),
        overflow: document.documentElement.scrollWidth > innerWidth + 2,
      }));
      if (state.diagramErrors || state.mathErrors || state.overflow) throw new Error(`${item.slug}: ${JSON.stringify(state)}`);
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
    console.log('BROWSER PASS: all article diagrams/math + 6 mobile entry pages');
  } finally { await browser.close(); }
}
