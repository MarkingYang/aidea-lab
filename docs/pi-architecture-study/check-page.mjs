import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(process.env.BLOG_PLAYWRIGHT_ROOT+'/playwright/package.json');
const {chromium}=require('playwright');
const base=process.env.BLOG_BASE_URL || 'http://127.0.0.1:4399';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
const externalErrors=[];
try {
 for (const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1050},reducedMotion:'reduce'});
  const page=await context.newPage(); const errors=[];
  page.on('pageerror',e=>{const error={message:e.message,stack:e.stack}; if(e.stack?.includes('ArtalkComments')) externalErrors.push(error); else errors.push(error);});
  await page.goto(base+'/writing/pi-architecture-deep-dive/',{waitUntil:'networkidle'});
  assert.ok((await page.locator('h1').innerText()).includes('Pi 架构设计的优缺点'));
  for (const id of ['pi-architecture-deep-dive','pi-session-extension-architecture','pi-durable-harness-governance']) assert.equal(await page.locator('#'+id).count(),1);
  for (const theme of ['light','dark']) {
   await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new Event('site-theme-change'))},theme);
   await page.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===1);
   const figure=page.locator('.mermaid-figure');
   const size=await figure.evaluate(e=>({frame:e.getBoundingClientRect().height,svg:e.querySelector('svg').getBoundingClientRect().height,error:!!e.querySelector('.error-icon,.error-text')}));
   assert.ok(size.svg>0 && size.svg<=421 && !size.error,JSON.stringify(size));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await figure.screenshot({path:`/tmp/pi-architecture-${width}-${theme}.png`});
   results.push({width,theme,diagramCount:1,...size,horizontalOverflow:false});
  }
  const figure=page.locator('.mermaid-figure');
  const original=await figure.locator('svg').evaluate(e=>e.getBoundingClientRect().width);
  await figure.getByRole('button',{name:'放大图表',exact:true}).click();
  await page.waitForFunction(original=>document.querySelector('.mermaid-figure svg').getBoundingClientRect().width>original,original);
  await figure.getByRole('button',{name:'恢复图表尺寸'}).click();
  assert.deepEqual(errors,[]);
  await context.close();
 }
 fs.writeFileSync('docs/pi-architecture-study/browser-results.json',JSON.stringify({results,pageErrors:[],externalCommentErrors:externalErrors,anchorsPreserved:3,zoomAndReset:true},null,2)+'\n');
 console.log(JSON.stringify(results));
} finally {await browser.close();}
