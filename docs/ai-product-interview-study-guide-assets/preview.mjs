import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {marked} from 'marked';
import GithubSlugger from 'github-slugger';

const here=path.dirname(fileURLToPath(import.meta.url));
const guide=await fs.readFile(path.resolve(here,'../ai-product-interview-study-guide.md'),'utf8');
const slugger=new GithubSlugger();
const headings=[];let inCode=false;
for(const line of guide.split('\n')){
 if(line.startsWith('```'))inCode=!inCode;
 const h=!inCode&&line.match(/^(#{1,6}) (.+)$/);
 if(h)headings.push({level:h[1].length,text:h[2],id:slugger.slug(h[2])});
}
let headingIndex=0;
const body=marked.parse(guide,{gfm:true}).replace(/<h([1-6])>/g,(_,level)=>{
 const h=headings[headingIndex++];
 if(h.level!==Number(level))throw new Error('Heading structure mismatch');
 return `<h${level} id="${h.id}">`;
}).replaceAll('ai-product-interview-study-guide-assets/','');
if(headingIndex!==headings.length)throw new Error('Heading count mismatch');
if(/<\/?(?:details|summary|a)\b/.test(guide))throw new Error('Raw HTML remains in Markdown');
const start=headings.find(h=>h.text.startsWith('学习导航')).id;
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AI 产品与 Agent 系统学习指南 · 结构化学习版</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f7fa;color:#283749;font:17px/1.9 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}main{max-width:960px;margin:36px auto;padding:46px 52px;background:#fff;border:1px solid #e3e8ee;border-radius:12px}h1{font-size:34px;line-height:1.45;color:#16334e;margin:16px 0 24px}h2{margin:70px 0 24px;padding-top:26px;border-top:2px solid #c9d8e6;font-size:28px;line-height:1.5;color:#173b60}h3{margin:48px 0 24px;font-size:26px;line-height:1.5;color:#193e60}h4{margin:40px 0 22px;padding:0 0 12px;border-bottom:1px solid #dae4ed;font-size:22px;line-height:1.6;color:#214a70}h5{margin:28px 0 12px;font-size:18px;line-height:1.7;color:#254f70}h2,h3,h4,h5{scroll-margin-top:24px}p{margin:16px 0}strong{color:#173f62}a{color:#28629b;overflow-wrap:anywhere;text-underline-offset:3px}blockquote{margin:22px 0;padding:6px 20px;border-left:4px solid #607f9e;background:#f1f5f9}blockquote p{margin:10px 0}li{margin:8px 0}img{display:block;width:100%;height:auto;margin:26px 0 14px;border:1px solid #e1e8ed;border-radius:8px;cursor:zoom-in}pre{overflow:auto;padding:18px;background:#f2f5f8;font-size:14px;line-height:1.6;border-radius:8px}code{font-family:ui-monospace,monospace;overflow-wrap:anywhere}p code,li code,td code{background:#f0f3f7;padding:2px 4px}.table-scroll{overflow:auto;margin:24px 0}table{width:100%;min-width:620px;border-collapse:collapse;font-size:15px;line-height:1.7}th,td{text-align:left;vertical-align:top;padding:12px 14px;border:1px solid #dae3eb}th{background:#edf3f8}.case-section{margin:44px 0 28px;padding:4px 24px 20px;background:#f1f8f5;border:1px solid #c4dcd2;border-radius:8px}.case-section>h4{color:#235b49;margin-top:20px;border-bottom-color:#c4dcd2}.review-section{margin-top:44px;padding:4px 24px 20px;background:#f6f7fa;border:1px solid #dce2eb;border-radius:8px}.review-section>h4{margin-top:20px}.review-section h5{margin-top:28px;padding-top:18px;border-top:1px solid #dce2eb}.chapter-nav{position:fixed;left:calc(50% + 500px);top:34px;width:186px;max-height:88vh;overflow:auto;font-size:13px;line-height:1.65}.chapter-nav a{display:block;padding:6px 4px;text-decoration:none}.chapter-nav strong{display:block;padding:0 4px 8px}.top{position:fixed;bottom:16px;right:16px;background:#244e74;color:#fff;padding:7px 14px;border-radius:24px;font-size:13px;text-decoration:none}.intro{font-size:13px;color:#66798a;letter-spacing:.03em}@media(max-width:1410px){.chapter-nav{display:none}}@media(max-width:700px){body{font-size:16px}main{margin:0;padding:24px 19px;border:0;border-radius:0}h1{font-size:27px}h2{font-size:24px}h3{font-size:23px}h4{font-size:20px}h5{font-size:17px}.case-section,.review-section{padding:2px 14px 18px}.table-scroll::before{content:"表格可左右滑动 →";display:block;font-size:12px;color:#66798a;margin-bottom:6px}}@media print{body,main{background:#fff}main{margin:0;border:0;padding:0}.chapter-nav,.top,.intro{display:none}h2{break-before:page}tr,img{break-inside:avoid}.case-section,.review-section{border:0;padding:0}}
</style></head><body><main><p class="intro">结构化学习版 · 正文连续讲解 · 案例与章末复习直接显示</p>${body}</main><nav class="chapter-nav" aria-label="章节目录"></nav><a class="top" href="#${start}">回到目录 ↑</a><script>
const nav=document.querySelector('.chapter-nav');nav.innerHTML='<strong>章节目录</strong>';
document.querySelectorAll('h3').forEach(h=>{if(/^\\d+\\. /.test(h.textContent)){const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;nav.append(a)}});
document.querySelectorAll('h4').forEach(h=>{const kind=h.textContent.startsWith('完整案例：')?'case-section':h.textContent.startsWith('本章复习：')?'review-section':null;if(!kind)return;const section=document.createElement('section');section.className=kind;h.before(section);let node=h;while(node){if(node!==h&&/^H[1-4]$/.test(node.tagName))break;const next=node.nextSibling;section.append(node);node=next;}});
document.querySelectorAll('table').forEach(t=>{const w=document.createElement('div');w.className='table-scroll';w.tabIndex=0;w.setAttribute('role','region');w.setAttribute('aria-label','可横向滚动的表格');t.before(w);w.append(t)});
document.querySelectorAll('img').forEach(i=>i.addEventListener('click',()=>window.open(i.src,'_blank','noopener')));
</script></body></html>`;
await fs.writeFile(path.join(here,'reading-preview.html'),html);
const runtime=process.env.GUIDE_NODE_MODULES||'/Users/fei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const require=createRequire(path.join(runtime,'package.json'));const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});const checks=[];
for(const width of [1440,1280,390]){
 const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
 await page.goto('file://'+path.join(here,'reading-preview.html'));
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 const check=await page.evaluate(()=>({viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,images:document.images.length,brokenImages:[...document.images].filter(i=>!i.naturalWidth).length,units:[...document.querySelectorAll('h2')].filter(h=>h.textContent.startsWith('单元')).length,chapters:[...document.querySelectorAll('h3')].filter(h=>/^\d+\. /.test(h.textContent)).length,knowledgeSections:[...document.querySelectorAll('h4')].filter(h=>/^\d+\.\d+ /.test(h.textContent)).length,pointAnswers:[...document.querySelectorAll('h5')].filter(h=>/^复习 \d+\.\d+｜/.test(h.textContent)).length,reviewSections:document.querySelectorAll('.review-section').length,cases:document.querySelectorAll('.case-section').length,interviewAnswers:[...document.querySelectorAll('h4')].filter(h=>/^Q\d+｜/.test(h.textContent)).length,foldingTags:document.querySelectorAll('details,summary').length,navLinks:document.querySelectorAll('.chapter-nav a').length,literalEmphasis:[...document.querySelectorAll('p,li,td')].filter(e=>e.textContent.includes('**')).length,missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i),overflow:document.documentElement.scrollWidth>innerWidth}));
 checks.push(check);
 await page.screenshot({path:path.join(here,`preview-${width}.png`)});
 for(const [name,selector,text] of [['lesson','h4','1.1 原理'],['evaluation','h3','5. AI 评测'],['point-answer','h4','本章复习：第 1 章'],['interview','h4','Q7｜'],['workshop','h4','完整案例：八个任务']]){
  const target=page.locator(selector).filter({hasText:text}).first();await target.evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(here,`preview-${name}-${width}.png`)});
 }
 if(width===1280){await page.locator('h4').filter({hasText:'9.5 DPO'}).evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(here,'preview-tuning-1280.png')});}
 await page.close();
}
await browser.close();
await fs.writeFile(path.join(here,'validation.json'),JSON.stringify({edition:'Structured plain Markdown',checks,scope:'Local document rendering only; no model, agent, training or business execution.'},null,2)+'\n');
console.log(JSON.stringify(checks));
if(checks.some(c=>c.overflow||c.brokenImages||c.images!==16||c.units!==6||c.chapters!==14||c.knowledgeSections!==88||c.pointAnswers!==88||c.reviewSections!==14||c.cases!==14||c.interviewAnswers!==26||c.foldingTags||c.navLinks!==14||c.literalEmphasis||c.missingAnchors.length||c.duplicateIds.length))process.exitCode=1;
