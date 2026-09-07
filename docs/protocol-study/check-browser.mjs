import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.join(process.env.BLOG_PLAYWRIGHT_ROOT, 'playwright/package.json'));
const { chromium } = require('playwright');
const manifest = JSON.parse(fs.readFileSync('docs/protocol-study/manifest.json','utf8'));
const base = process.env.BLOG_BASE_URL || 'http://localhost:4321';
const shots = process.env.BLOG_DIAGRAM_SCREENSHOTS || '/tmp/aidea-protocol-screenshots';
fs.mkdirSync(shots,{recursive:true});
const browser = await chromium.launch({headless:true,channel:'chrome'});
const results=[];
const exampleKinds = new Set();
try {
 for (const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r => new URL(r.request().url()).origin === new URL(base).origin ? r.continue() : r.abort());
  const page=await context.newPage();
  for (const item of manifest.articles) {
   const errors=[];
   const listener=e=>{if(!e.message.includes('Failed to fetch'))errors.push(e.message)};
   page.on('pageerror',listener);
   const response=await page.goto(`${base}/writing/${item.slug}/`);
   assert.equal(response.status(),200);
   await page.waitForFunction(n => {
     const all=[...document.querySelectorAll('.mermaid')];
     return all.length===n && all.every(x=>['ready','error'].includes(x.dataset.renderState));
   },item.diagrams,{timeout:45000});
   for(const theme of ['light','dark']) {
    await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new Event('site-theme-change'));},theme);
    await page.waitForFunction(()=>[...document.querySelectorAll('.mermaid')].every(x=>x.dataset.renderState==='ready'),null,{timeout:45000});
    const states=await page.locator('.mermaid').evaluateAll(els=>els.map(el=>({ready:el.dataset.renderState,svg:!!el.querySelector('svg'),error:!!el.querySelector('.error-icon,.error-text'),width:el.querySelector('svg')?.getBoundingClientRect().width,height:el.querySelector('svg')?.getBoundingClientRect().height})));
    assert.ok(states.every(x=>x.ready==='ready'&&x.svg&&!x.error&&x.width>0&&x.height>0),`${item.slug}: render error`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${item.slug}: page overflow at ${width}`);
    // Capture one representative of every requested diagram kind in both themes and sizes.
    const frames=page.locator('.mermaid-figure');
    for(let i=0;i<item.diagrams;i++) {
     const label=await frames.nth(i).locator('.reader-label').textContent();
     const kind=label.split(' · ')[0];
     const key=`${width}-${theme}-${kind}`;
     if(!exampleKinds.has(key)) {
      exampleKinds.add(key);
      await frames.nth(i).scrollIntoViewIfNeeded();
      await frames.nth(i).screenshot({path:path.join(shots,`${key}.png`)});
     }
    }
    results.push({slug:item.slug,width,theme,diagrams:item.diagrams,render:'passed',pageContainment:'passed'});
   }
   const first=page.locator('.mermaid-figure').first();
   await first.getByRole('button',{name:'放大图表'}).click();
   assert.equal(await first.locator('.scale-label').textContent(),'125%');
   const viewport=first.locator('.diagram-viewport');
   const edge=await viewport.evaluate(el=>{el.scrollLeft=el.scrollWidth;return Math.abs(el.scrollLeft-(el.scrollWidth-el.clientWidth))<2});
   assert.ok(edge,'Diagram right edge is reachable');
   await first.getByRole('button',{name:'恢复图表尺寸'}).click();
   assert.equal(await first.locator('.scale-label').textContent(),'100%');
   assert.deepEqual(errors,[],item.slug);
   page.off('pageerror',listener);
   console.log(`PASS ${width} ${item.slug}: ${item.diagrams} diagrams, both themes, zoom and containment`);
  }
  await context.close();
 }
 fs.writeFileSync('docs/protocol-study/browser-results.json',JSON.stringify({results,screenshotDirectory:shots,visualReview:'pending',publication:'authorized'},null,2)+'\n');
} finally {await browser.close();}
