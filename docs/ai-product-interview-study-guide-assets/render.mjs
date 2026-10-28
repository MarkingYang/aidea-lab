import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const runtime = process.env.GUIDE_NODE_MODULES || '/Users/fei/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const require = createRequire(path.join(runtime, 'package.json'));
const { chromium } = require('playwright');
const sharp = require('sharp');
const specs = JSON.parse(await fs.readFile(path.join(here, 'figures.json'), 'utf8'));
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 2 });
await page.setContent('<html lang="zh-CN"><head><meta charset="utf-8"></head><body style="margin:0"></body></html>');
await page.addScriptTag({ path: path.join(root, 'node_modules/mermaid/dist/mermaid.min.js') });
await page.addScriptTag({ path: path.join(root, 'node_modules/echarts/dist/echarts.min.js') });
await page.evaluate(() => mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { fontFamily: 'PingFang SC, Arial, sans-serif', fontSize: '21px', primaryColor: '#edf4ff', primaryTextColor: '#172b49', primaryBorderColor: '#7494b8', lineColor: '#627991', secondaryColor: '#eaf7f3', tertiaryColor: '#fff6e7', clusterBkg: '#f6f8fc', clusterBorder: '#c8d5e3', actorBkg: '#edf4ff', actorBorder: '#7494b8', actorTextColor: '#172b49', signalColor: '#486887', signalTextColor: '#172b49', noteBkgColor: '#fff1d9', noteBorderColor: '#d9b36f', noteTextColor: '#573c16' }, flowchart: { htmlLabels: false, curve: 'linear', nodeSpacing: 26, rankSpacing: 35, padding: 16, subGraphTitleMargin: {top: 16, bottom: 32} }, sequence: { useMaxWidth: false, actorFontSize: 22, messageFontSize: 20, noteFontSize: 20, width: 185, height: 56, actorMargin: 38, boxMargin: 16, messageMargin: 32 } }));
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x,y,s,size=24,fill='#203652',weight=400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${esc(s)}</text>`;
const rect = (x,y,w,h,fill='#edf4ff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}"/>`;
function matrix() {
  let s = text(285,36,'专家：实际有问题',24,'#203652',600) + text(677,36,'专家：实际合格',24,'#203652',600);
  const cells = [[245,64,'18','真阳性 · 查对了','#e8f4ef'],[638,64,'8','假阳性 · 误报','#fff0da'],[245,245,'2','假阴性 · 漏报','#ffe7e4'],[638,245,'72','真阴性 · 判对了','#e8f4ef']];
  s += text(20,142,'裁判：报警',23) + text(20,322,'裁判：不报警',23);
  for (const [x,y,n,label,color] of cells) s += rect(x,y,367,155,color)+text(x+28,y+67,n,50,'#203652',700)+text(x+28,y+119,label,23);
  const metrics=[['总体正确率','(18 + 72) / 100','90%'],['问题召回率','18 / (18 + 2)','90%'],['报警精确率','18 / (18 + 8)','69.2%']];
  metrics.forEach((m,i)=> {let x=20+i*348;s+=rect(x,446,328,140,'#f0f3f8')+text(x+20,481,m[0],22)+text(x+20,514,m[1],20,'#61748b')+text(x+20,562,m[2],34,'#295fa7',700);});
  return { body:s, w:1080,h:610 };
}
function competitors() {
  const cards=[
    {name:'Dify',tag:'可视化应用流程',color:'#edf4ff',items:['知识检索、模型与工具节点','把处理路径连接成应用','Agent 节点能力按版本核对'],q:['知识分支怎样配置？','故障后能否查清与恢复？']},
    {name:'Copilot Studio',tag:'已有企业能力的编排',color:'#eaf7f3',items:['主题、知识、工具与连接器','连接现有企业系统和流程','身份与凭证依触发方式核对'],q:['用谁的身份调用工具？','已有系统接入成本多大？']},
    {name:'Agentforce',tag:'受约束的业务动作',color:'#f1edfa',items:['把 Flow / Apex 等封装成动作','明确输入、输出与调用条件','按动作风险设置确认机制'],q:['怎样界定动作权限？','结果能否核验并被审计？']}
  ];
  let s='';cards.forEach((c,i)=>{let x=12+i*360;s+=rect(x,0,342,495,c.color)+text(x+23,48,c.name,28,'#203652',700)+text(x+23,91,c.tag,23,'#426384',600)+text(x+23,145,'公开能力侧重点',19,'#61748b');c.items.forEach((v,j)=>s+=text(x+23,186+j*42,v,20));s+=text(x+23,337,'选型时要验证',19,'#61748b');c.q.forEach((v,j)=>s+=text(x+23,380+j*42,v,21));});
  s+=rect(12,522,1062,85,'#fff4e3')+text(37,557,'统一对照条件',22,'#6e4c20',600)+text(37,588,'同一业务任务、同一权限边界、同一失败场景，再比较完整成本与交付负担。',21);
  return {body:s,w:1080,h:625};
}
function selection() {
 const rows=[['缺少当前私有知识','RAG：检索与知识治理','查召回、证据与时效'],['任务说明或规则不清','Prompt：指令与示例','查约束与任务表达'],['固定行为范式仍不稳定','评估 SFT，含 LoRA 方案','查示范质量与泛化'],['可比较的行为偏好问题','评估 DPO / 经典 RLHF','查偏好一致性与收益'],['权限、执行或恢复失败','修工具、策略和 Runtime','查可信状态与副作用']];
 let s=text(30,35,'已定位的瓶颈',23,'#203652',600)+text(380,35,'候选改动',23,'#203652',600)+text(780,35,'验证重点',23,'#203652',600);
 rows.forEach((r,i)=>{let y=65+i*99;s+=rect(12,y,1056,82,i===4?'#fff2df':i%2?'#edf4ff':'#eaf7f3')+text(32,y+49,r[0],23)+text(336,y+49,'→',26,'#6b819a')+text(380,y+49,r[1],23)+text(780,y+49,r[2],22,'#45617e');});
 s+=rect(12,585,1056,84,'#f0ecf8')+text(32,620,'所有候选都要接受同一套验收',23,'#55477a',600)+text(32,653,'业务硬约束 → 任务完成与接管 → 完整成本 → 延迟与交付负担',23);
 return {body:s,w:1080,h:690};
}
const manifest=[];
for (const spec of specs) {
  let rendered;
  if (spec.code) {
    await fs.writeFile(path.join(here,'sources',spec.id+'.mmd'),spec.code+'\n');
    rendered = await page.evaluate(async ({code,id})=>{const {svg}=await mermaid.render('m'+id.replaceAll('-',''),code);const doc=new DOMParser().parseFromString(svg,'image/svg+xml');const el=doc.documentElement;const vb=el.getAttribute('viewBox').split(/\s+/).map(Number);return {body:el.innerHTML,w:vb[2],h:vb[3],vx:vb[0],vy:vb[1],svgId:el.id};},{code:spec.code,id:spec.id});
  } else if (spec.kind==='matrix') rendered=matrix();
  else if (spec.kind==='competitors') rendered=competitors();
  else if (spec.kind==='selection') rendered=selection();
  else if (spec.kind==='cost') {
    rendered=await page.evaluate(()=>{
      const c=echarts.init(null,null,{renderer:'svg',ssr:true,width:1080,height:550});
      c.setOption({animation:false,color:['#487cc1','#e5a24f'],textStyle:{fontFamily:'PingFang SC, Arial',fontSize:22},legend:{top:12,itemWidth:22,itemHeight:18,data:['运行成本','人工补救成本'],textStyle:{fontSize:22}},grid:{top:87,left:110,right:65,bottom:105},xAxis:{type:'category',data:['方案 A\n自主解决 750 / 1,000','方案 B\n自主解决 960 / 1,000'],axisTick:{show:false},axisLabel:{fontSize:22,lineHeight:32,margin:18}},yAxis:{type:'value',name:'元 / 1,000 个任务',nameTextStyle:{fontSize:21,padding:[0,0,12,30]},min:0,max:1500,interval:300,axisLabel:{fontSize:20},splitLine:{lineStyle:{color:'#dce4ed'}}},series:[{name:'运行成本',type:'bar',stack:'total',barWidth:160,label:{show:true,formatter:'{c} 元',fontSize:25,color:'#fff'},data:[600,800]},{name:'人工补救成本',type:'bar',stack:'total',label:{show:true,formatter:'{c} 元',fontSize:24,color:'#352b1e'},data:[750,120]},{type:'bar',barGap:'-100%',barWidth:160,itemStyle:{color:'transparent'},silent:true,label:{show:true,position:'top',formatter:'合计 {c} 元',fontSize:25,fontWeight:'bold',color:'#203652'},data:[1350,920]}]});
      const svg=c.renderToSVGString();c.dispose();return {body:svg,w:1080,h:550};
    });
  }
  const scale=Math.min(1080/rendered.w, 1.5);
  const dh=Math.ceil(rendered.h*scale);
  const height=dh+215;
  const inner=`<svg id="${rendered.svgId || spec.id}" x="${(1200-rendered.w*scale)/2}" y="126" width="${rendered.w*scale}" height="${dh}" viewBox="${rendered.vx||0} ${rendered.vy||0} ${rendered.w} ${rendered.h}">${rendered.body}</svg>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="${height}" viewBox="0 0 1200 ${height}" font-family="PingFang SC,Arial,sans-serif"><rect width="1200" height="${height}" fill="#f7f9fc"/><rect x="24" y="24" width="1152" height="${height-48}" rx="20" fill="#fff"/>${text(55,60,'AI 产品与 Agent 系统学习指南  /  图 '+spec.id.slice(0,2),17,'#61748b',600)}${text(55,101,spec.title,30,'#172b49',700)}${inner}${text(55,height-40,spec.note,17,'#61748b')}</svg>`;
  await fs.writeFile(path.join(here,'figures',spec.id+'.svg'),svg);
  await page.setViewportSize({width:1200,height});
  await page.evaluate(s=>{document.body.innerHTML=s;},svg);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({path:path.join(here,'figures',spec.id+'.png'),fullPage:false});
  manifest.push({id:spec.id,width:1200,height,pngScale:2});
  console.log(`${spec.id}: 1200 × ${height}`);
}
await fs.writeFile(path.join(here,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const thumbs=await Promise.all(specs.map(async(s,i)=>({input:await sharp(path.join(here,'figures',s.id+'.png')).resize(360,440,{fit:'contain',background:'#e7ecf3'}).png().toBuffer(),left:(i%4)*360,top:Math.floor(i/4)*440})));
await sharp({create:{width:1440,height:1760,channels:3,background:'#e7ecf3'}}).composite(thumbs).png().toFile(path.join(here,'contact-sheet.png'));
await browser.close();
