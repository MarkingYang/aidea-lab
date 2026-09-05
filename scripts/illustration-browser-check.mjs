import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(process.env.BLOG_PLAYWRIGHT_ROOT
  ? path.join(process.env.BLOG_PLAYWRIGHT_ROOT, 'playwright/package.json') : import.meta.url);
const { chromium } = require('playwright');
const base = process.env.BLOG_BASE_URL || 'http://localhost:4321';
const screenshots = process.env.BLOG_SCREENSHOTS;
const { illustrations } = JSON.parse(fs.readFileSync('docs/illustration-prompts.json', 'utf8'));
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
let checks = 0;
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin
    ? route.continue() : route.abort());
  const page = await context.newPage();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const item of illustrations) {
      const response = await page.goto(`${base}/writing/${item.article}/`);
      assert.equal(response.status(), 200);
      const figure = page.locator('.article-image');
      await figure.waitFor();
      const img = figure.locator('img');
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.decode());
      assert.equal(await img.getAttribute('alt'), item.alt);
      assert.equal(await figure.locator('figcaption').textContent(), item.caption);
      assert.equal(await img.evaluate(image => image.naturalWidth), 1536);
      assert.equal(await img.getAttribute('height'), '1024');
      assert.equal(await img.getAttribute('loading'), 'lazy');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await img.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: '文章图解查看器' });
      await dialog.waitFor();
      await dialog.locator('img').evaluate(image => image.decode());
      await dialog.getByRole('button', { name: '放大图片细节' }).click();
      const viewport = dialog.getByRole('region');
      const dimensions = await viewport.evaluate(element => {
        element.scrollLeft = element.scrollWidth;
        element.scrollTop = element.scrollHeight;
        return { width: element.clientWidth, scrollWidth: element.scrollWidth,
          endX: element.scrollLeft, maxX: element.scrollWidth - element.clientWidth,
          endY: element.scrollTop, maxY: element.scrollHeight - element.clientHeight };
      });
      assert.ok(dimensions.scrollWidth > dimensions.width, `${item.id}: zoom must reveal readable detail`);
      assert.ok(Math.abs(dimensions.endX - dimensions.maxX) <= 1, 'Right edge must be reachable');
      assert.ok(Math.abs(dimensions.endY - dimensions.maxY) <= 1, 'Bottom edge must be reachable');
      await viewport.evaluate(element => element.scrollTo(0, 0));
      assert.equal(await viewport.evaluate(element => element.scrollLeft + element.scrollTop), 0);
      if (screenshots && item.id === 'mini-harness-assembly') {
        fs.mkdirSync(screenshots, { recursive: true });
        await page.screenshot({ path: path.join(screenshots, `illustration-zoom-${width}.png`) });
      }
      await dialog.getByRole('button', { name: '图片适应窗口' }).click();
      assert.equal(await viewport.evaluate(element => element.scrollWidth > element.clientWidth), false);
      await page.keyboard.press('Escape');
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await img.evaluate(image => image === document.activeElement), true);
      if (screenshots && item.id === 'mini-harness-assembly') {
        await page.screenshot({ path: path.join(screenshots, `illustration-article-${width}.png`) });
      }
      checks++;
    }
  }
  const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plainPage = await plain.newPage();
  await plainPage.goto(`${base}/writing/harness-integration-map/`);
  const plainImage = plainPage.locator('.prose img');
  await plainImage.scrollIntoViewIfNeeded();
  await plainImage.evaluate(image => image.decode());
  assert.equal(await plainImage.isVisible(), true);
  assert.equal(await plainPage.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  console.log(`PASS ${checks} desktop/mobile illustration views: assets, captions, alt text, zoom, all edges, Escape and focus; no-JavaScript image fallback`);
} finally {
  await browser.close();
}
