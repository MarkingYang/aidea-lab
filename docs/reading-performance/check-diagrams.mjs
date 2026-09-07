import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(process.env.BLOG_PLAYWRIGHT_ROOT+'/playwright/package.json');
const {chromium}=require('playwright');
const base=process.env.BLOG_BASE_URL || 'http://localhost:4398';
const articles=fs.readdirSync('src/content/writing').filter(f=>f.endsWith('.md')).map(f=>({slug:f.slice(0,-3),count:[...fs.readFileSync('src/content/writing/'+f,'utf8').matchAll(/^```mermaid/gm)].length})).filter(x=>x.count);
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
try{
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>{if(!e.stack?.includes('ArtalkComments'))errors.push(e.message)});
  for(const {slug,count} of articles){
   await page.goto(`${base}/writing/${slug}/`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(count=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===count,count);
   for(const theme of ['light','dark']){
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new Event('site-theme-change'))},theme);
    await page.waitForFunction(count=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===count,count);
    const sizes=await page.locator('.mermaid-figure').evaluateAll(es=>es.map(e=>({frame:e.getBoundingClientRect().height,svg:e.querySelector('svg').getBoundingClientRect().height,error:!!e.querySelector('.error-icon,.error-text')})));
    assert.ok(sizes.every(x=>x.svg>0&&x.svg<=421&&x.frame<=560&&!x.error),JSON.stringify({slug,width,sizes}));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    results.push({slug,width,theme,count,maxHeight:Math.max(...sizes.map(x=>x.frame))});
   }
   console.log(`PASS ${width} ${slug}`);
  }
  await page.goto(`${base}/writing/a2a-protocol/`);
  await page.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===4);
  const first=page.locator('.mermaid-figure').first();
  await first.screenshot({path:`/tmp/blog-diagram-${width}.png`});
  const original=await first.locator('svg').evaluate(e=>e.getBoundingClientRect().width);
  for(let i=0;i<6;i++)await first.getByRole('button',{name:'放大图表',exact:true}).click();
  assert.ok(await first.locator('svg').evaluate(e=>e.getBoundingClientRect().width)>original*2.4);
  assert.ok(await first.locator('.diagram-viewport').evaluate(e=>{e.scrollTop=e.scrollHeight;e.scrollLeft=e.scrollWidth;return Math.abs(e.scrollTop-(e.scrollHeight-e.clientHeight))<2 && Math.abs(e.scrollLeft-(e.scrollWidth-e.clientWidth))<2}));
  await first.getByRole('button',{name:'恢复图表尺寸'}).click();
  await first.getByRole('button',{name:'全屏查看图表'}).click();
  await page.waitForFunction(()=>!!document.fullscreenElement);
  await page.waitForFunction(() => { const f=document.fullscreenElement; return f && parseFloat(f.querySelector('svg').style.width)>0 && f.querySelector('svg').getBoundingClientRect().height > (innerWidth>640 ? 420 : 300); });
  await page.evaluate(()=>document.exitFullscreen());
  await page.waitForFunction(()=>!document.fullscreenElement);
  await page.waitForFunction(()=>document.querySelector('.mermaid-figure svg').getBoundingClientRect().height<=421);
  const downloadPromise=page.waitForEvent('download');
  await first.getByRole('button',{name:'导出 SVG'}).click();
  const download=await downloadPromise;
  const exported=fs.readFileSync(await download.path(),'utf8');
  assert.ok(exported.includes('xmlns="http://www.w3.org/2000/svg"'));
  await page.setViewportSize({width:width===390?1000:600,height:800});
  await page.waitForFunction(()=>[...document.querySelectorAll('.mermaid svg')].every(e=>e.getBoundingClientRect().height<=401));
  assert.deepEqual(errors,[]);
  await context.close();
 }
 fs.writeFileSync('docs/reading-performance/diagram-results.json',JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}
