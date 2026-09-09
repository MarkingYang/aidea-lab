import {createRequire} from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire((process.env.BLOG_PLAYWRIGHT_ROOT || '/tmp/aidea-browser/node_modules')+'/playwright/package.json');
const {chromium}=require('playwright');
const base=process.env.BLOG_BASE_URL || 'http://127.0.0.1:4408';
const slugs=['codex-system-overview','prompt-context-harness-engineering','agent-runtime','harness-architecture-selection'];
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r=>new URL(r.request().url()).origin===new URL(base).origin?r.continue():r.abort());
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>{if(!e.stack?.includes('ArtalkComments'))errors.push(e.message)});
  for(const slug of slugs) {
   const content=fs.readFileSync('src/content/writing/'+slug+'.md','utf8');
   const count=[...content.matchAll(/^```mermaid/gm)].length;
   await page.goto(`${base}/writing/${slug}/`,{waitUntil:'domcontentloaded'});
   for(const theme of ['light','dark']) {
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new Event('site-theme-change'))},theme);
    await page.waitForFunction(n=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===n,count);
    const sizes=await page.locator('.mermaid-figure').evaluateAll(es=>es.map(e=>({height:e.getBoundingClientRect().height,svg:e.querySelector('svg').getBoundingClientRect().height,error:!!e.querySelector('.error-icon,.error-text')})));
    assert.ok(sizes.every(x=>x.svg>0&&x.svg<=421&&x.height<=560&&!x.error),JSON.stringify({slug,width,sizes}));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    results.push({slug,width,theme,count,sizes});
    if(slug==='codex-system-overview') {
     await page.locator('.mermaid-figure').last().screenshot({path:`/tmp/aidea-codex-sequence-${width}-${theme}.png`});
    }
   }
   const anchors=[...content.matchAll(/\]\((\/[^)\s]+)\)/g)].map(m=>m[1]);
   for(const href of [...new Set(anchors)]) {
    const response=await context.request.get(base+href.split('#')[0]);
    assert.equal(response.status(),200,href);
    if(href.includes('#')) {
     const html=await response.text();
     assert.ok(html.includes(`id="${href.split('#')[1]}"`),href);
    }
   }
  }
  await page.goto(`${base}/writing/codex-system-overview/`);
  await page.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===4);
  const figure=page.locator('.mermaid-figure').last();
  const original=await figure.locator('svg').evaluate(e=>e.getBoundingClientRect().width);
  await figure.getByRole('button',{name:'放大图表',exact:true}).click();
  assert.ok(await figure.locator('svg').evaluate(e=>e.getBoundingClientRect().width)>original);
  await figure.getByRole('button',{name:'恢复图表尺寸'}).click();
  await figure.getByRole('button',{name:'全屏查看图表'}).click();
  await page.waitForFunction(()=>!!document.fullscreenElement);
  await page.evaluate(()=>document.exitFullscreen());
  await page.waitForFunction(()=>!document.fullscreenElement);
  const downloadPromise=page.waitForEvent('download');
  await figure.getByRole('button',{name:'导出 SVG'}).click();
  const downloaded=await downloadPromise;
  assert.ok(fs.readFileSync(await downloaded.path(),'utf8').includes('xmlns="http://www.w3.org/2000/svg"'));
  assert.deepEqual(errors,[]);
  await context.close();
 }
 fs.writeFileSync('docs/architecture-rationale/browser-results.json',JSON.stringify({date:'2026-09-08',results,new_diagrams:4,interactions:['zoom','reset','fullscreen','export'],internal_links:'HTTP 200 and target anchors checked',page_errors:[]},null,2)+'\n');
 console.log('PASS 16 article/viewport/theme combinations; links and new diagram interactions');
}finally{await browser.close()}
