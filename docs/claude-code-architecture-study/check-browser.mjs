import { createRequire } from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(process.env.BLOG_PLAYWRIGHT_ROOT + '/playwright/package.json');
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const base = process.env.BLOG_BASE_URL || 'http://127.0.0.1:4418';
const results = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    assert.equal((await page.goto(base + '/writing/claude-code-internals-overview/')).status(), 200);
    await page.waitForFunction(() => document.querySelectorAll('.mermaid[data-render-state="ready"]').length === 1);
    assert.match(await page.locator('h1').textContent(), /Claude Code 架构设计/);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => {
        document.documentElement.dataset.theme = theme;
        window.dispatchEvent(new Event('site-theme-change'));
      }, theme);
      await page.waitForFunction(() => document.querySelectorAll('.mermaid[data-render-state="ready"]').length === 1);
      const figure = page.locator('.mermaid-figure');
      await figure.scrollIntoViewIfNeeded();
      assert.equal(await page.locator('.mermaid .error-icon,.mermaid .error-text').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const original = await figure.locator('svg').evaluate(el => el.getBoundingClientRect().width);
      await figure.getByRole('button', { name: '放大图表', exact: true }).click();
      assert.ok(await figure.locator('svg').evaluate(el => el.getBoundingClientRect().width) > original);
      await figure.getByRole('button', { name: '恢复图表尺寸' }).click();
      await figure.screenshot({ path: `/tmp/aidea-claude-diagram-${width}-${theme}.png` });
      results.push({ width, theme, diagrams: 1, overflow: false, zoomAndReset: 'passed' });
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  fs.writeFileSync('docs/claude-code-architecture-study/browser-results.json', JSON.stringify({ results, scope: 'Article rendering only; no Claude Code execution.' }, null, 2) + '\n');
  console.log('PASS article, diagram, zoom, themes, desktop/mobile, and no page script errors');
} finally { await browser.close(); }
