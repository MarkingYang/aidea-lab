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
  assert.equal(await page.locator('[data-graph-root]').getAttribute('data-layout'), 'force-directed');
  assert.equal(await page.locator('[data-relation-filter="similarity"]').isChecked(), false);
  await page.locator('[data-relation-filter="similarity"]').check();
  await page.locator('[data-relation-filter="similarity"]').uncheck();

  const titles = page.locator('[data-graph-node-label]:visible');
  assert.ok(await titles.count() > 0);
  const bounds = await titles.evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; }));
  for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
    const a = bounds[i], b = bounds[j];
    assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y, 'Visible title boxes must not overlap');
  }
  await page.locator('.graph-tuning summary').click();
  await page.locator('[data-show-labels]').uncheck();
  assert.equal(await titles.count(), 0);
  await page.locator('[data-show-labels]').check();
  const beforeSpacing = await page.locator('[data-graph-canvas]').screenshot();
  await page.locator('[data-graph-spacing]').focus();
  await page.locator('[data-graph-spacing]').press('ArrowRight');
  assert.equal(await page.locator('[data-spacing-output]').textContent(), '1.1×');
  assert.notDeepEqual(await page.locator('[data-graph-canvas]').screenshot(), beforeSpacing, 'Spacing changes rendered graph positions');
  await page.locator('[data-reset-layout]').click();
  assert.equal(await page.locator('[data-spacing-output]').textContent(), '1.0×');
  await page.locator('.graph-tuning summary').click();
  await titles.first().focus();
  await titles.first().press('Enter');
  assert.equal(await page.locator('[data-node-panel]').getAttribute('data-open'), 'true');
  await page.locator('[data-depth="2"]').click();
  assert.equal(await page.locator('[data-depth="2"]').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-local-only]').uncheck();
  await page.locator('[data-local-only]').check();
  await page.locator('[data-depth="1"]').click();
  await page.locator('[data-clear-focus]').click();

  await page.locator('#graph-query').fill('Context Engineering');
  await page.locator('.search-results [data-node-id="keyword:Context Engineering"]').click();
  assert.equal(await page.locator('[data-panel-title]').textContent(), 'Context Engineering');
  assert.equal(await page.locator('[data-graph-root]').getAttribute('data-edge-mode'), 'detail');
  assert.ok(await page.locator('[data-panel-relations] li').count() >= 5);
  assert.match(await page.locator('[data-panel-link]').getAttribute('href'), /\/library\/\?tag=Context%20Engineering/);
  await page.locator('[data-clear-focus]').click();
  assert.equal(await page.locator('[data-graph-root]').getAttribute('data-edge-mode'), 'overview');

  await page.locator('#graph-query').fill('工具、协议与执行边界');
  await page.locator('.search-results [data-node-id="series:harness-tools"]').click();
  assert.equal(await page.locator('[data-panel-title]').textContent(), '工具、协议与执行边界');
  assert.match(page.url(), /node=series%3Aharness-tools/);
  assert.match(page.url(), /view=local/);
  assert.ok(await page.locator('[data-panel-relations] li').count() > 0);

  await page.locator('[data-clear-focus]').click();
  await page.locator('#graph-query').fill('项目实现研究');
  await page.locator('.search-results [data-node-id="series:harness-projects"]').click();
  assert.equal(await page.locator('[data-panel-title]').textContent(), '项目实现研究');
  assert.match(page.url(), /node=series%3Aharness-projects/);
  assert.ok(await page.locator('[data-panel-relations] li').count() >= 4);
  assert.match(await page.locator('[data-panel-link]').getAttribute('href'), /\/series\/harness-projects\//);

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
  assert.match(await page.locator('[data-panel-title]').textContent(), /成功率、稳定性/);
  await page.locator('[data-panel-link]').click();
  await page.waitForURL('**/writing/agent-evaluation-metrics/');
  assert.equal(await page.locator('h1').textContent(), '成功率、稳定性与成本，不能揉成一个分数');

  await page.goto(`${base}/graph/?node=agent-evaluation-metrics&view=local`);
  await page.locator('[data-graph-canvas] canvas').first().waitFor();
  assert.equal(await page.locator('[data-panel-title]').textContent(), '成功率、稳定性与成本，不能揉成一个分数');

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
  for (const [legacy, destination] of [
    ['claude-code-agent-loop', '/writing/claude-code-internals-overview/'],
    ['series:harness-foundations', '/series/harness-recovery/'],
    ['topic:systems', '/topics/harness/'],
  ]) {
    await page.goto(`${base}/graph/?node=${encodeURIComponent(legacy)}&view=local`);
    await page.locator('[data-graph-canvas] canvas').first().waitFor();
    assert.equal(await page.locator('[data-panel-link]').getAttribute('href'), destination, `Legacy graph node: ${legacy}`);
  }
  for (const [legacy, destination] of [
    ['/writing/claude-code-agent-loop/', '/writing/claude-code-internals-overview/'],
    ['/series/harness-foundations/', '/series/harness-recovery/'],
    ['/topics/systems/', '/topics/harness/'],
  ]) {
    await page.goto(base + legacy);
    await page.waitForURL(base + destination);
    assert.equal(await page.locator('h1').count(), 1, `Legacy route: ${legacy}`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS Sigma graph render, force layout, relation filters, keyword regions, single search, article exploration and reading, region camera focus/reset, URL state, zoom, theme, mobile drawer and article relations');
} finally {
  await browser.close();
}
