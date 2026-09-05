import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(process.env.BLOG_PLAYWRIGHT_ROOT ? path.join(process.env.BLOG_PLAYWRIGHT_ROOT, 'playwright/package.json') : import.meta.url);
const { chromium } = require('playwright');
const base = process.env.BLOG_BASE_URL || 'http://127.0.0.1:4322';
const browser = await chromium.launch({ headless: true, channel: process.env.BLOG_BROWSER_CHANNEL || 'chrome' });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => {
    if (!(error.message === 'Failed to fetch' && error.stack?.includes('/_astro/ArtalkComments.'))) errors.push(error.message);
  });
  const response = await page.goto(`${base}/graph/`);
  assert.equal(response.status(), 200);
  await page.locator('[data-graph-canvas] canvas').first().waitFor();
  assert.ok(await page.locator('[data-graph-canvas] canvas').count() >= 5);
  assert.match(await page.locator('[data-graph-canvas]').getAttribute('aria-label'), /\d+ 个可见节点、\d+ 条关系/);
  assert.equal(await page.locator('[data-graph-loading]').isHidden(), true);
  assert.equal(await page.locator('.site-nav a[href="/graph/"]').getAttribute('aria-current'), 'page');
  assert.equal(await page.locator('[data-graph-root]').getAttribute('data-edge-mode'), 'overview');
  assert.ok(Number(await page.locator('[data-graph-root]').getAttribute('data-local-edges')) > Number(await page.locator('[data-graph-root]').getAttribute('data-cross-edges')));
  assert.ok(Number(await page.locator('[data-graph-root]').getAttribute('data-bridge-edges')) < Number(await page.locator('[data-graph-root]').getAttribute('data-cross-edges')));

  await page.locator('#graph-query').fill('Context Engineering');
  await page.locator('.search-results [data-node-id="keyword:Context Engineering"]').click();
  assert.equal(await page.locator('[data-panel-title]').textContent(), 'Context Engineering');
  assert.equal(await page.locator('[data-graph-root]').getAttribute('data-edge-mode'), 'detail');
  assert.equal(await page.locator('[data-panel-relations] li').count(), 5);
  assert.match(await page.locator('[data-panel-link]').getAttribute('href'), /\/library\/\?tag=Context%20Engineering/);
  await page.locator('[data-clear-focus]').click();
  assert.equal(await page.locator('[data-graph-root]').getAttribute('data-edge-mode'), 'overview');

  await page.locator('#graph-query').fill('万级能力路由');
  await page.locator('.search-results [data-node-id="series:capability-routing"]').click();
  assert.equal(await page.locator('[data-panel-title]').textContent(), '万级能力路由');
  assert.match(page.url(), /node=series%3Acapability-routing/);
  assert.match(page.url(), /view=local/);
  assert.ok(await page.locator('[data-panel-relations] li').count() > 0);

  await page.locator('[data-zoom="in"]').click();
  await page.locator('[data-zoom="reset"]').click();
  assert.doesNotMatch(page.url(), /node=/);
  for (let index = 0; index < 8; index++) await page.locator('[data-zoom="out"]').click();
  assert.ok(Number(await page.locator('[data-graph-root]').getAttribute('data-camera-ratio')) <= 1.221);
  assert.ok(Number(await page.locator('[data-graph-root]').getAttribute('data-camera-ratio')) >= 1.219);
  await page.locator('[data-zoom="reset"]').click();
  for (let index = 0; index < 12; index++) await page.locator('[data-zoom="in"]').click();
  assert.ok(Number(await page.locator('[data-graph-root]').getAttribute('data-camera-ratio')) >= .084);
  assert.ok(Number(await page.locator('[data-graph-root]').getAttribute('data-camera-ratio')) <= .086);
  await page.locator('[data-zoom="reset"]').click();
  await page.reload();
  await page.locator('[data-graph-canvas] canvas').first().waitFor();
  assert.equal(await page.locator('[data-node-panel]').getAttribute('data-open'), 'false');

  await page.locator('#graph-query').fill('成功率、稳定性');
  await page.locator('.search-results [data-node-id="agent-evaluation-metrics"]').click();
  await page.waitForURL('**/writing/agent-evaluation-metrics/');
  assert.equal(await page.locator('h1').textContent(), 'Agent 评测（二）：成功率、稳定性与成本，不能揉成一个分数');

  await page.goto(`${base}/graph/?node=agent-evaluation-metrics&view=local`);
  await page.locator('[data-graph-canvas] canvas').first().waitFor();
  assert.equal(await page.locator('[data-panel-title]').textContent(), 'Agent 评测（二）：成功率、稳定性与成本，不能揉成一个分数');

  const originalTheme = await page.locator('html').getAttribute('data-theme');
  await page.locator('.theme-toggle').click();
  assert.notEqual(await page.locator('html').getAttribute('data-theme'), originalTheme);
  assert.equal(await page.locator('[data-graph-error]').isHidden(), true);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/graph/?node=agent-evaluation-metrics&view=local`);
  await page.locator('[data-graph-canvas] canvas').first().waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('[data-node-panel]').evaluate(node => Math.round(node.getBoundingClientRect().width)), 370);

  await page.goto(`${base}/writing/agent-evaluation-metrics/`);
  assert.ok(await page.locator('.related-knowledge li').count() >= 2);
  assert.match(await page.locator('.related-knowledge header > a').getAttribute('href'), /\/graph\/\?node=agent-evaluation-metrics&view=local/);
  assert.deepEqual(errors, []);
  console.log('PASS Sigma graph render, progressive edge disclosure, keyword regions, single search, direct article entry, region camera focus/reset, URL state, zoom, theme, mobile drawer and article relations');
} finally {
  await browser.close();
}
