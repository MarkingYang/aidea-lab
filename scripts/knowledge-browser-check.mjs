import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(process.env.BLOG_PLAYWRIGHT_ROOT ? path.join(process.env.BLOG_PLAYWRIGHT_ROOT,'playwright/package.json') : import.meta.url);
const {chromium}=require('playwright');
const base=process.env.BLOG_BASE_URL || 'http://127.0.0.1:4322';
const screenshots=process.env.BLOG_SCREENSHOTS;
const registry=JSON.parse(fs.readFileSync('src/data/knowledge.json','utf8'));
const browser=await chromium.launch({headless:true,channel:process.env.BLOG_BROWSER_CHANNEL || 'chrome'});
let checks=0;
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  // Preview QA must not increment production analytics or contact comment services.
  await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin ? route.continue() : route.abort());
  const page=await context.newPage();
  const errors=[],blockedCommentErrors=[];page.on('pageerror',error=>{
    if(error.message==='Failed to fetch' && error.stack?.includes('/_astro/ArtalkComments.')) blockedCommentErrors.push(error.message);
    else errors.push(error.message);
  });
  async function visit(url) {const response=await page.goto(base+url);assert.equal(response.status(),200,url);await page.locator('h1').waitFor();}
  const routes=['/','/topics/','/series/','/library/','/graph/','/notes/','/about/',...registry.topics.map(x=>`/topics/${x.id}/`),...registry.series.map(x=>`/series/${x.id}/`)];
  for(const route of routes) {
    await visit(route);assert.equal(await page.locator('h1').count(),1,route);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route);
    const hrefs=await page.locator('a[href^="/"]').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
    for(const href of hrefs) {const url=new URL(href,base);assert.ok(fs.existsSync(path.join('dist',decodeURIComponent(url.pathname),'index.html')),`${route}: broken link ${href}`);}
    checks++;
  }
  console.log('PASS desktop directory routes and internal links:',routes.length);
  await visit('/library/');await page.locator('.library-controls').waitFor({state:'visible'});
  const totalArticles=await page.locator('[data-library-index]').evaluate(node=>JSON.parse(node.textContent).length);
  assert.equal(await page.locator('.library-result').count(),12);
  await visit('/library/?series=agent-evaluation');await page.waitForFunction(()=>document.querySelectorAll('.library-result').length===5);
  const chapterLinks=await page.locator('.library-result h2 a').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  assert.deepEqual(chapterLinks,registry.series.find(x=>x.id==='agent-evaluation').articles.map(id=>`/writing/${id}/`));
  await page.reload();await page.locator('.library-controls').waitFor({state:'visible'});assert.equal(await page.locator('[data-context-label]').textContent(),'agent-evaluation');
  await visit('/library/?series=agent-evaluation&topic=practice');await page.locator('.library-empty').waitFor({state:'visible'});
  await page.locator('[data-reset]').first().click();await page.waitForFunction(()=>document.querySelectorAll('.library-result').length===12);
  await page.locator('.library-pagination a[aria-label="第 2 页"]').click();assert.match(page.url(),/page=2/);assert.equal(await page.locator('.library-pagination [aria-current="page"]').textContent(),'2');
  await page.reload();await page.locator('.library-controls').waitFor({state:'visible'});assert.equal(await page.locator('.library-pagination [aria-current="page"]').textContent(),'2');
  await page.locator('[name="q"]').fill('记忆 ACL');await page.waitForURL(/q=/);assert.ok(await page.locator('.library-result').count()>0);assert.equal(await page.locator('.library-pagination [aria-current="page"]').textContent(),'1');
  await page.locator('[name="q"]').fill('<script>alert(1)</script>');await page.locator('.library-empty').waitFor({state:'visible'});
  await visit('/library/?tag=UnknownTag');await page.locator('.library-empty').waitFor({state:'visible'});assert.equal(await page.locator('[data-context-label]').textContent(),'UnknownTag');
  await page.locator('[data-reset]').first().click();assert.equal(await page.locator('#library-query').evaluate(node=>node===document.activeElement),true);
  await visit('/essays/');await page.waitForURL('**/library/?type=essay');await page.locator('.library-controls').waitFor({state:'visible'});assert.equal(await page.locator('[data-context-label]').textContent(),'essay');
  console.log('PASS single search, keyword/legacy links, series order, URL/reload, reset, empty state, pagination, keyboard and legacy entry');checks+=12;
  for(const series of registry.series) {
    for(const [i,id] of series.articles.entries()) {
      await visit(`/writing/${id}/`);
      assert.match(await page.locator('.series-position').textContent(),new RegExp(`第 ${i+1} / ${series.articles.length} 篇`));
      assert.equal(await page.locator('.series-sidebar a[aria-current="page"]').count(),1);
      const expectedPrevious=i ? `/writing/${series.articles[i-1]}/` : `/series/${series.id}/`;
      const expectedNext=i===series.articles.length-1 ? `/series/${series.id}/` : `/writing/${series.articles[i+1]}/`;
      assert.equal(await page.locator('.article-pagination a').first().getAttribute('href'),expectedPrevious);
      assert.equal(await page.locator('.article-pagination a').last().getAttribute('href'),expectedNext);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,id);checks++;
    }
  }
  console.log('PASS all ordered article navigation:',registry.series.flatMap(x=>x.articles).length);
  for(const width of [390,768,1024]) {
    await page.setViewportSize({width,height:844});
    for(const route of ['/','/topics/','/series/agent-evaluation/','/library/','/graph/','/writing/agent-evaluation-metrics/']) {
      await visit(route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: ${route}`);checks++;
    }
    if(width<=900) {await page.locator('.mobile-reading summary').click();assert.equal(await page.locator('.mobile-reading a[aria-current="page"]').count(),1);assert.ok(await page.locator('.mobile-reading').getAttribute('open')!==null);}
  }
  await page.setViewportSize({width:390,height:844});await visit('/library/?series=agent-memory');await page.locator('.library-controls').waitFor({state:'visible'});assert.equal(await page.locator('.library-result').count(),5);
  await page.locator('.theme-toggle').click();const theme=await page.locator('html').getAttribute('data-theme');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  if(screenshots) {
    fs.mkdirSync(screenshots,{recursive:true});
    await page.evaluate(()=>localStorage.setItem('theme','light'));
    for(const [name,route] of [['home','/'],['directory','/topics/'],['series','/series/agent-evaluation/'],['library','/library/'],['graph','/graph/'],['article','/writing/agent-evaluation-metrics/']]) {
      await page.setViewportSize({width:1440,height:1000});await visit(route);await page.screenshot({path:path.join(screenshots,name+'.png'),fullPage:false});
    }
    await page.setViewportSize({width:390,height:844});await visit('/');await page.screenshot({path:path.join(screenshots,'home-mobile.png')});
    await visit('/writing/agent-evaluation-metrics/');await page.locator('.mobile-reading summary').click();await page.screenshot({path:path.join(screenshots,'article-mobile.png')});
    await page.setViewportSize({width:1440,height:1000});await visit('/library/');await page.locator('.theme-toggle').click();await page.waitForFunction(()=>getComputedStyle(document.body).color==='rgb(238, 237, 232)' && getComputedStyle(document.querySelector('.library-result h2 a')).color==='rgb(238, 237, 232)');await page.screenshot({path:path.join(screenshots,'library-dark.png')});
  }
  assert.deepEqual(errors,[]);console.log('PASS responsive layouts, mobile navigation, theme persistence, no first-party page errors');console.log(`NOTE: ${blockedCommentErrors.length} expected Artalk fetch errors from intentionally blocked external service; live comments not tested.`);
  const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();
  const allIds=new Set();
  for(let n=1;n<=Math.ceil(totalArticles/12);n++) {
    await staticPage.goto(base+(n===1?'/library/':`/library/${n}/`));assert.equal(await staticPage.locator('.library-result').count(),Math.min(12,totalArticles-(n-1)*12));
    for(const id of await staticPage.locator('.library-result h2 a').evaluateAll(links=>links.map(link=>link.getAttribute('href')))) allIds.add(id);
  }
  assert.equal(allIds.size,totalArticles);await nojs.close();console.log(`PASS no-JavaScript static pagination: all ${totalArticles} unique articles`);checks++;
  const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage denied')}});});
  const blockedPage=await blocked.newPage();const blockedErrors=[];blockedPage.on('pageerror',error=>blockedErrors.push(error.message));await blockedPage.goto(base+'/');await blockedPage.locator('.theme-toggle').click();assert.deepEqual(blockedErrors,[]);await blocked.close();checks++;
  console.log('PASS blocked storage fallback');console.log(`Browser QA complete: ${checks} checks`);
} finally {await browser.close();}
