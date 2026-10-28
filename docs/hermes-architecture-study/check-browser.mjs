import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(process.env.BLOG_PLAYWRIGHT_ROOT+'/playwright/package.json');
const {chromium}=require('playwright');
const base=process.env.BLOG_BASE_URL||'http://127.0.0.1:4418';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  const page=await context.newPage();
  await page.goto(base+'/writing/hermes-agent-architecture-deep-dive/',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('h1').innerText(),'Hermes 架构设计：优点、代价与适用边界');
  for(const theme of ['light','dark']) {
   await page.evaluate(t=>{document.documentElement.dataset.theme=t;window.dispatchEvent(new Event('site-theme-change'));},theme);
   await page.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.locator('.mermaid .error-icon,.mermaid .error-text').count(),0);
   const box=await page.locator('.mermaid svg').boundingBox();assert.ok(box.width>0&&box.height>0);
   await page.locator('.mermaid-figure').screenshot({path:`/tmp/hermes-diagram-${width}-${theme}.png`});
   results.push({width,theme,diagramRendered:true,pageOverflow:false,svg:box});
  }
  await context.close();
 }
 fs.writeFileSync('docs/hermes-architecture-study/browser-results.json',JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
