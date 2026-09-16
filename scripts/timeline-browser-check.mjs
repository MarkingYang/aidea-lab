import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(path.join(process.env.BLOG_PLAYWRIGHT_ROOT, 'playwright/package.json'));
const shots=process.env.BLOG_TIMELINE_SCREENSHOTS || '/tmp/aidea-timeline';
fs.mkdirSync(shots,{recursive:true});
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const base=process.env.BLOG_BASE_URL || 'http://127.0.0.1:4398';
const results=[];
try{
 for(const width of [1440,768,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/preview/timeline/');
  const figure=page.locator('.content-timeline').first();
  const viewport=figure.locator('.timeline-viewport');
  const next=figure.getByRole('button',{name:'向后浏览时间线'});
  const previous=figure.getByRole('button',{name:'向前浏览时间线'});
  await next.waitFor({state:'visible'});
  assert.equal(await figure.locator('.timeline-event').count(),6);
  assert.equal(await previous.isDisabled(),true);
  assert.equal(await next.isDisabled(),false);
  const markers=await figure.locator('.timeline-marker').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().y));
  assert.ok(markers.every(y=>Math.abs(y-markers[0])<1),'all nodes share a horizontal line');
  const itemWidth=await figure.locator('.timeline-event').first().evaluate(e=>e.offsetWidth);
  await next.click();
  await page.waitForFunction(({width})=>Math.abs(document.querySelector('.timeline-viewport').scrollLeft-width)<3,{width:itemWidth});
  await page.waitForFunction(()=>!document.querySelector('.content-timeline [data-timeline-direction="-1"]').disabled);
  assert.equal(await previous.isDisabled(),false);
  await viewport.focus();await page.keyboard.press('End');
  await page.waitForFunction(()=>{const e=document.querySelector('.timeline-viewport');return Math.abs(e.scrollLeft-(e.scrollWidth-e.clientWidth))<3});
  await page.waitForFunction(()=>document.querySelector('.content-timeline [data-timeline-direction="1"]').disabled);
  assert.equal(await next.isDisabled(),true);
  await page.keyboard.press('Home');
  await page.waitForFunction(()=>document.querySelector('.timeline-viewport').scrollLeft<2);
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(({width})=>Math.abs(document.querySelector('.timeline-viewport').scrollLeft-width)<3,{width:itemWidth});
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(()=>document.querySelector('.timeline-viewport').scrollLeft<2);
  await viewport.blur();
  for(const theme of ['light','dark']){
   await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const font=await figure.locator('.timeline-event-description').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert.ok(font>=13);
   await figure.screenshot({path:path.join(shots,`timeline-${width}-${theme}.png`)});
   results.push({width,theme,alignment:'passed',navigation:'passed',overflow:false,minDescriptionFont:font});
  }
  // The standalone Astro component shares layout and does not change the first timeline.
  await page.locator('.component-example summary').click();
  const second=page.locator('.content-timeline').nth(1);
  assert.equal(await second.locator('.timeline-event').count(),2);
  await page.waitForFunction(()=>{const f=document.querySelectorAll('.content-timeline')[1];const v=f.querySelector('.timeline-viewport');return f.querySelector('.timeline-controls').hidden === (v.scrollWidth-v.clientWidth<=2)});
  assert.equal(await viewport.evaluate(e=>e.scrollLeft),0);
  assert.deepEqual(errors,[]);
  await context.close();
 }
 // Without JavaScript the Markdown remains semantic, readable, and scrollable.
 const nojs=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});
 const page=await nojs.newPage();await page.goto(base+'/preview/timeline/');
 const f=page.locator('.content-timeline').first();
 assert.equal(await f.locator('.timeline-event').count(),6);
 assert.equal(await f.locator('.timeline-controls').isVisible(),false);
 assert.equal(await f.locator('.timeline-viewport').evaluate(e=>getComputedStyle(e).overflowX),'auto');
 await page.emulateMedia({media:'print'});
 assert.equal(await f.locator('.timeline-track').evaluate(e=>getComputedStyle(e).flexWrap),'wrap');
 assert.equal(await f.locator('.timeline-viewport').evaluate(e=>getComputedStyle(e).overflow),'visible');
 await nojs.close();
 // Existing article diagram initialization still completes.
 const regression=await browser.newPage();
 await regression.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
 await regression.goto(base+'/writing/langgraph-runtime-architecture/');
 await regression.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===4,{},{timeout:45000});
 assert.equal(await regression.locator('.content-timeline').count(),0);
 results.push({noJavaScript:'passed',print:'passed',multipleInstances:'passed',existingMermaidArticle:'passed'});
 assert.ok(!fs.existsSync(path.resolve('dist/preview/timeline/index.html')));
 console.log(JSON.stringify(results,null,2));
 fs.writeFileSync(path.join(shots,'results.json'),JSON.stringify(results,null,2));
}finally{await browser.close()}
