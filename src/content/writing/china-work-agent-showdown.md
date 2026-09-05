---
title: Agent 工作系统全景（六）：Kimi Work、WorkBuddy 与豆包工作如何分工
description: 从研究、企业协作和多模态创作三个入口，比较国内办公 Agent 的产品定位与能力结构。
publishedAt: 2026-09-04
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - 办公 Agent
  - Kimi
  - WorkBuddy
  - 豆包
featured: true
readingTime: 9 min
---

> 系列：[1. 三条赛道](/writing/ai-agent-landscape-2026/)｜[2. 比较方法](/writing/agent-landscape-comparison-methods/)｜[3. 工程产品](/writing/coding-agent-harness-showdown/)｜[4. 开源路线](/writing/open-source-agent-harness-routes/)｜[5. 工程验证](/writing/coding-agent-harness-poc/)｜[6. 办公产品](/writing/china-work-agent-showdown/)｜[7. 组织落地](/writing/china-work-agent-adoption/)｜[8. 整体思考](/writing/agent-work-system-synthesis/)

办公 Agent 最容易被误解成“更强的聊天机器人”：多一个任务面板，回答结束时顺便生成 PPT。但真正的产品分水岭是，它能否从一个含糊目标出发，持续读取材料、调用工具、处理失败，最后交付人类可以直接验收的文件或系统状态。

截至 2026 年 9 月，国内最有代表性的三条路线已经相当清楚：

- Kimi Work 以研究、长材料和 Agent Swarm 为中心；
- WorkBuddy 以桌面工作台、腾讯生态和企业交付为中心；
- 豆包工作以大众入口、多模态内容和跨设备操作为中心。

> [!IMPORTANT]
> **结论先行：**知识研究和高并行资料任务优先看 Kimi Work；国内企业办公、知识库与协作系统接入优先看 WorkBuddy；大众办公、多模态创作和手机—电脑连续体验优先看豆包工作。若任务的最终真相在 Git、测试与 CI 中，Claude Code 或 Codex 仍然更合适。办公 Agent 与 Coding Agent 的边界正在融合，但两者的“完成证明”仍然不同。

## 三款产品争夺的不是同一个“办公”

### Kimi Work：研究型知识工作站

[Kimi Work 官方介绍](https://www.kimi.com/zh-hans/resources/kimi-work-introduction)将它定义为桌面上的本地 AI Agent，组合本地文档、开放网络、专业数据集、浏览器和 Agent Skills。最显眼的卖点是 Agent Swarm：系统可按任务复杂度组织最多 300 个子 Agent。

它最自然的任务是“资料空间很大、问题可拆分、最终需要综合”的工作，例如行业研究、尽调、长文档比对、批量实体收集与专题报告。

需要保持清醒的是，300 是并行上限和产品能力描述，不是质量保证。研究任务的瓶颈常常不是抓到更多网页，而是来源去重、口径统一、反例检索和最终论证。大量子 Agent 只有在证据合并机制足够好时才产生正收益。

### WorkBuddy：企业工作台与腾讯生态入口

[腾讯云官方产品页](https://cloud.tencent.com/product/workbuddy)把 WorkBuddy 定位为覆盖日常办公、代码开发与设计创意的全场景 AI 工作台。用户从自然语言下达任务，Agent 自主拆解并交付结果；产品同时提供专家、Skills、连接器、自动任务和企业版。

WorkBuddy 的关键不是某个通用模型，而是“工作环境已经在腾讯体系中”的组织优势。企业微信、QQ、腾讯文档、腾讯会议、乐享知识库、身份和云资源可以被放进同一条交付链。它更像带有 Agent Runtime 的企业工作入口，而非单一聊天 App。

### 豆包工作：大众生产力与多模态工作入口

字节跳动 Seed 团队在[Seed2.1 发布说明](https://seed.bytedance.com/zh/blog/seed2-1-officially-released-advancing-ai-productivity)中，把豆包“办公任务”描述为可完成项目规划、文件处理和跨工具任务的通用 Agent，并把同一模型系列部署到豆包和 TRAE。

豆包工作的优势来自豆包既有用户入口，以及字节在图像、视频、内容理解和消费级产品体验上的积累。Mac App Store 的[豆包产品说明](https://apps.apple.com/cn/app/%E8%B1%86%E5%8C%85/id6683305962?mt=12)已把工作任务、浏览器、Skills、定时任务、Office 套件和图片视频生成放进同一桌面产品。

它最有潜力的不是做另一个企业知识库，而是让普通用户第一次愿意把“整理材料—查资料—做文档—生成视觉内容—跨设备继续”当成一项连续任务。

## 六个维度，比“谁能生成 PPT”更有意义

| 维度 | Kimi Work | WorkBuddy | 豆包工作 |
| --- | --- | --- | --- |
| 核心工作对象 | 长材料、网页、数据集、研究问题 | 本地文件、企业知识、办公系统、项目任务 | 文档、网页、Office、多模态内容、电脑操作 |
| 核心差异化 | Agent Swarm 与研究综合 | 腾讯协作生态、企业管理与交付版本 | 大众入口、图像视频、手机—电脑连续性 |
| 典型制品 | 报告、资料汇总、分析结果 | 文档、表格、PPT、项目成果、业务流程结果 | 文档、PPT、表格、图片、视频、应用页面 |
| 扩展方式 | Skills、浏览器、数据集、Kimi Code 协同 | Skills、SkillHub、MCP/CLI 连接器、自定义专家 | Skills、浏览器、Office、字节多模态能力 |
| 企业治理 | 有团队与订阅能力，需按地区与版本核验 | SSO、组织、用量、工具权限、审计、VPC/私有化选项 | 消费产品体验领先，企业治理需看具体“豆包工作”版本 |
| 最大风险 | 并行规模大于证据治理能力 | 产品面宽、版本与能力边界复杂 | 平台能力演进快，企业控制面与稳定性仍需验证 |

三者都能生成内容，但它们的“默认上下文”不同：Kimi 默认从信息世界开始，WorkBuddy 默认从组织工作空间开始，豆包默认从个人设备与内容创作开始。

## 三个关键断点，比功能清单更值得检查

三款产品都能读文件、搜网页和生成办公制品，真正的产品差异发生在任务交接处：

- Kimi Work 要把大量并行检索收束为可核对的证据，而不只是展示子 Agent 数量；
- WorkBuddy 要让企业身份、数据源、权限和制品状态可见，否则“连接得多”会变成新的治理盲区；
- 豆包工作要在保持消费级简单体验的同时，明确跨端操作与高风险动作的确认、恢复和审计。

这三个断点分别对应研究综合、组织连接和跨端执行。它们比“是否支持 PPT、浏览器或 Skills”更能预测产品进入真实工作后的成本。

## 价值曲线：三款产品主动选择了什么

以下 1–5 分是对公开产品策略的编辑性编码，不是统一环境下的性能测试。1 表示非当前核心，5 表示已有高投入和鲜明产品表达。曲线用于看取舍，精确值应在企业 PoC 中由真实任务替换。

```echarts
{
  "title": {
    "text": "国内办公 Agent 价值曲线",
    "subtext": "相对策略投入，1=非核心，5=高投入；截至 2026-09-04",
    "left": "center"
  },
  "tooltip": { "trigger": "axis" },
  "legend": {
    "top": 50,
    "data": ["Kimi Work", "WorkBuddy", "豆包工作"]
  },
  "grid": {
    "left": 40,
    "right": 24,
    "top": 96,
    "bottom": 60,
    "containLabel": true
  },
  "xAxis": {
    "type": "category",
    "boundaryGap": false,
    "data": ["研究\n深度", "企业\n连接", "多模态\n创作", "并行与\n长任务", "跨设备\n连续", "企业\n治理"]
  },
  "yAxis": {
    "type": "value",
    "name": "相对投入",
    "min": 1,
    "max": 5,
    "interval": 1
  },
  "series": [
    {
      "name": "Kimi Work",
      "type": "line",
      "symbol": "circle",
      "symbolSize": 8,
      "lineStyle": { "width": 3, "color": "#b84d2e" },
      "itemStyle": { "color": "#b84d2e" },
      "data": [5, 3, 4, 5, 3, 3]
    },
    {
      "name": "WorkBuddy",
      "type": "line",
      "symbol": "diamond",
      "symbolSize": 9,
      "lineStyle": { "width": 2, "type": "dashed", "color": "#77736d" },
      "itemStyle": { "color": "#77736d" },
      "data": [4, 5, 4, 4, 4, 5]
    },
    {
      "name": "豆包工作",
      "type": "line",
      "symbol": "emptyCircle",
      "symbolSize": 9,
      "lineStyle": { "width": 2, "color": "#9b756a" },
      "itemStyle": { "color": "#9b756a" },
      "data": [4, 4, 5, 4, 5, 3]
    }
  ]
}
```

| 价值要素 | Kimi Work | WorkBuddy | 豆包工作 |
| --- | ---: | ---: | ---: |
| 研究深度 | 5 | 4 | 4 |
| 企业连接 | 3 | 5 | 4 |
| 多模态创作 | 4 | 4 | 5 |
| 并行与长任务 | 5 | 4 | 4 |
| 跨设备连续 | 3 | 4 | 5 |
| 企业治理 | 3 | 5 | 3 |

三条曲线各自有清楚峰值：Kimi Work 抬高研究与并行，WorkBuddy 抬高企业连接与治理，豆包工作抬高多模态与跨设备。战略风险不是某项只有 3 分，而是为了追赶竞品把所有维度都拉成 5，最终失去用户选择它的理由。

## 把差异转成选择，而不是继续堆框架

| 如果主要任务是 | 优先进入 PoC | 必须重点验证 |
| --- | --- | --- |
| 长材料研究、尽调与批量信息综合 | Kimi Work | 来源去重、冲突处理、并行成本与结论可追溯性 |
| 企业知识、办公系统和组织协作 | WorkBuddy | 身份继承、连接器权限、审计、版本与私有化边界 |
| 多模态创作、个人办公与跨设备连续任务 | 豆包工作 | 任务状态、关键动作确认、失败恢复与隐私范围 |
| 仓库修改、测试与 CI 交付 | Claude Code / Codex 等 Coding Agent | Diff、测试、隔离、回归与审查成本 |

这不是总冠军结论。候选产品只有进入同一批真实任务，记录成功、接管、审查与恢复成本后，才能形成采购判断。下一篇会把这些产品差异放进组织系统，继续检查最后一公里。

---

上一篇：[工程验证](/writing/coding-agent-harness-poc/)。

产品差异只能说明它们擅长什么，还不能证明组织能安全地把工作交出去。下一篇沿三类真实任务检查系统连接、治理与最后一公里。

下一篇：[组织落地](/writing/china-work-agent-adoption/)。
