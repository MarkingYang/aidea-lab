import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const packageRoot=process.env.BLOG_PLAYWRIGHT_ROOT || '/Users/fei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=createRequire(packageRoot+'/playwright/package.json')('playwright');
const base=process.env.BLOG_BASE_URL || 'http://127.0.0.1:4497';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
try {
  for (const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/writing/deepseek-harness-composition/',{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('h1').innerText(),'DeepSeek Agent Harness：架构设计的优点与代价');
    for (const theme of ['light','dark']) {
      await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new Event('site-theme-change'))},theme);
      await page.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===1);
      const figure=page.locator('.mermaid-figure');
      const size=await figure.evaluate(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,svgHeight:e.querySelector('svg').getBoundingClientRect().height,error:!!e.querySelector('.error-icon,.error-text')}));
      assert.ok(size.svgHeight>0 && size.svgHeight<=421 && !size.error,JSON.stringify(size));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await figure.screenshot({path:`/tmp/aidea-deepseek-${width}-${theme}.png`});
      results.push({width,theme,size});
    }
    const figure=page.locator('.mermaid-figure');
    const initial=await figure.locator('svg').evaluate(e=>e.getBoundingClientRect().width);
    await figure.getByRole('button',{name:'放大图表',exact:true}).click();
    assert.ok(await figure.locator('svg').evaluate(e=>e.getBoundingClientRect().width)>initial);
    await figure.getByRole('button',{name:'恢复图表尺寸'}).click();
    for(const id of ['deepseek-harness-composition','deepseek-harness-state','deepseek-harness-execution']) assert.equal(await page.locator(`[id="${id}"]`).count(),1);
    assert.deepEqual(errors,[]);
    await context.close();
  }
  fs.writeFileSync('docs/deepseek-harness-study/browser-results.json',JSON.stringify({date:'2026-09-20',base,results,interactions:['zoom','reset'],legacyAnchors:'present',pageErrors:[],scope:'Static production build in isolated temporary checkout; no Harness execution'},null,2)+'\n');
  console.log('PASS desktop/mobile × light/dark; diagram, overflow, zoom/reset, legacy anchors, page errors');
} finally { await browser.close(); }
