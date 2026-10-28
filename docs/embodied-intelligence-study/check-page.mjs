import { createRequire } from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(process.env.BLOG_PLAYWRIGHT_ROOT + '/playwright/package.json');
const { chromium } = require('playwright');
const base = process.env.BLOG_BASE_URL || 'http://127.0.0.1:4406';
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = [];
const externalErrors = [];
const shots = '/tmp/embodied-intelligence-preview';
fs.mkdirSync(shots, { recursive: true });
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => {
      const error = { message: e.message, stack: e.stack };
      if (e.stack?.includes('ArtalkComments')) externalErrors.push(error);
      else errors.push(error);
    });
    await page.goto(base + '/writing/embodied-intelligence-evolution/', { waitUntil: 'networkidle' });
    assert.ok((await page.locator('h1').first().innerText()).includes('具身智能的发展脉络'));
    const timeline = page.locator('.content-timeline');
    assert.equal(await timeline.locator('.timeline-event').count(), 12);
    const hrefs = await timeline.locator('a[href^="#"]').evaluateAll(es => es.map(e => e.getAttribute('href')));
    assert.equal(hrefs.length, 12);
    for (const href of hrefs) assert.equal(await page.locator(href).count(), 1, href);
    assert.equal(await page.locator('h3').filter({ hasText: /^(1961|1966|1986|2000|2004|2015|2017|2018|2021|2022|2023|2024|2025|2026)/ }).count(), 30);
    const viewport = timeline.locator('.timeline-viewport');
    await timeline.getByRole('button', { name: '向后浏览时间线' }).click();
    await page.waitForFunction(() => document.querySelector('.timeline-viewport').scrollLeft > 0);
    await viewport.focus();
    await page.keyboard.press('End');
    await page.waitForFunction(() => {
      const e = document.querySelector('.timeline-viewport');
      return Math.abs(e.scrollLeft - (e.scrollWidth - e.clientWidth)) < 3;
    });
    await page.keyboard.press('Home');
    await page.waitForFunction(() => document.querySelector('.timeline-viewport').scrollLeft < 2);
    await viewport.blur();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; window.dispatchEvent(new Event('site-theme-change')); }, theme);
      await page.waitForFunction(() => document.querySelectorAll('.mermaid[data-render-state="ready"]').length === 1);
      const diagram = page.locator('.mermaid-figure');
      assert.equal(await diagram.locator('.error-icon,.error-text').count(), 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const font = await timeline.locator('.timeline-event-description').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize));
      assert.ok(font >= 13);
      await timeline.screenshot({ path: `${shots}/timeline-${width}-${theme}.png` });
      await diagram.screenshot({ path: `${shots}/diagram-${width}-${theme}.png` });
      results.push({ width, theme, timelineNodes: 12, datedHeadings: 30, diagramCount: 1, minTimelineFont: font, horizontalOverflow: false });
    }
    await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; window.dispatchEvent(new Event('site-theme-change')); window.scrollTo(0, 0); });
    await page.screenshot({ path: `${shots}/article-${width}.png` });
    assert.deepEqual(errors, []);
    await context.close();
  }
  fs.writeFileSync('docs/embodied-intelligence-study/browser-results.json', JSON.stringify({ results, timelineControls: 'passed', anchors: 'passed', pageErrors: [], externalCommentErrors: externalErrors, screenshots: shots }, null, 2) + '\n');
  console.log(JSON.stringify(results));
} finally { await browser.close(); }
