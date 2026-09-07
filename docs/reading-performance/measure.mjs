import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(process.env.BLOG_PLAYWRIGHT_ROOT + '/playwright/package.json');
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
const results=[];
for(let i=0;i<3;i++){
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const client=await page.context().newCDPSession(page);
 await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
 await client.send('Network.emulateNetworkConditions',{offline:false,latency:100,downloadThroughput:200000,uploadThroughput:100000});
 await client.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.addInitScript(()=>{window.longTasks=[];new PerformanceObserver(l=>window.longTasks.push(...l.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${process.env.BLOG_BASE_URL || 'http://localhost:4398'}/graph/`,{waitUntil:'domcontentloaded'});
 await page.waitForSelector('[data-graph-loading][hidden]',{state:'attached'});
 results.push(await page.evaluate(()=>({ready:performance.now(),paint:performance.getEntriesByType('paint').map(e=>({name:e.name,time:e.startTime})),longTasks:window.longTasks,resources:performance.getEntriesByType('resource').map(e=>({name:e.name.split('/').pop(),size:e.decodedBodySize,duration:e.duration})),loadingVisible:!!document.querySelector('[data-graph-loading]').getBoundingClientRect().height,labels:document.querySelectorAll('[data-graph-node-label]:not([hidden])').length})));
 results.at(-1).errors=errors;await page.close();
}
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await page.goto(`${process.env.BLOG_BASE_URL || 'http://localhost:4398'}/writing/a2a-protocol/`);
await page.waitForFunction(()=>document.querySelectorAll('.mermaid[data-render-state="ready"]').length===4);
results.push(await page.locator('.mermaid-figure').evaluateAll(es=>es.map(e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width,svg:e.querySelector('svg').getBoundingClientRect().height}))));
fs.writeFileSync(process.argv[2],JSON.stringify(results,null,2)); console.log(JSON.stringify(results));await browser.close();
