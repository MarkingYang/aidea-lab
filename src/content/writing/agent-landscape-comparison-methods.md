---
title: Agent 工作系统全景（二）：不用总分，如何比较不同 Agent
description: 用用户体验五要素、价值曲线和证据矩阵比较不同 Agent，避免用一张总分表制造伪精确。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - AI Agent
  - 竞品分析
  - 产品战略
  - 产品方法论
featured: false
readingTime: 8 min
---

> 系列：[1. 三条赛道](/writing/ai-agent-landscape-2026/)｜[2. 比较方法](/writing/agent-landscape-comparison-methods/)｜[3. 工程产品](/writing/coding-agent-harness-showdown/)｜[4. 开源路线](/writing/open-source-agent-harness-routes/)｜[5. 工程验证](/writing/coding-agent-harness-poc/)｜[6. 办公产品](/writing/china-work-agent-showdown/)｜[7. 组织落地](/writing/china-work-agent-adoption/)｜[8. 整体思考](/writing/agent-work-system-synthesis/)

同一张功能清单无法公平比较 Coding Agent、办公 Agent 与开源 Harness。真正有用的比较，必须先声明决策对象，再让不同框架各自回答一个问题。

## 方法升级：三个框架回答三种不同问题

这次比较不再让一个总分承担所有结论，而是把三个框架串成一条决策链：

| 框架 | 回答的问题 | 在本系列中的用法 | 不负责什么 |
| --- | --- | --- | --- |
| 用户体验五要素 | 用户究竟经历了怎样的产品？ | 从战略层、范围层、结构层、框架层到表现层逐层比较 | 不直接判断企业外部机会 |
| 价值曲线 | 产品把资源集中在哪些价值要素？ | 比较相对策略投入，识别趋同与差异化 | 不冒充实测性能分数 |
| SWOT | 产品下一步应该利用什么、补什么、避开什么？ | 逐个产品区分内部优劣势与外部机会威胁 | 不把功能清单重复放进四格 |

三者的顺序不能颠倒。先用五要素看清“产品实际上为谁、以什么方式工作”，再用价值曲线判断战略取舍，最后用 SWOT 把观察转成行动。如果一上来就做 SWOT，常见结果只是“品牌强、竞争激烈、市场广阔”这类无法决策的套话。

### 用户体验五要素如何适配 Agent

经典五要素从抽象到具体依次是战略层、范围层、结构层、框架层和表现层。用于 Agent 时，每一层都需要重新解释：

| 层级 | 传统问题 | Agent 产品中的关键问题 |
| --- | --- | --- |
| 战略层 | 用户需求与产品目标是什么？ | 用户交付的是一个问题、一项任务，还是持续责任？ |
| 范围层 | 提供哪些功能和内容？ | Agent 能读什么、做什么、明确不能做什么？ |
| 结构层 | 功能如何组织成流程？ | 如何规划、调用工具、并行、失败重试和请求人工介入？ |
| 框架层 | 界面与信息如何排布？ | 计划、进度、权限、证据、Diff 和制品在哪里被看见？ |
| 表现层 | 视觉与感知体验如何？ | 状态反馈是否可信，风险与结果是否一眼可辨？ |

这套框架能解释一个常见现象：两个产品的功能范围几乎相同，用户感受到的完成度仍然悬殊。差距可能出在结构层的中断恢复，也可能出在框架层没有清楚呈现权限和证据。

### 三类产品的价值曲线

下面的曲线不是基准测试，而是依据官方产品与文档做的**编辑性编码**：1 表示该价值要素不是当前产品核心，5 表示已经投入较多产品机制。它用于观察三类产品的资源配置，不用于宣称 5 分产品“性能更强”。

**三类 AI Agent 的相对价值投入（1–5）**

```echarts
{
  "title": {
    "text": "三类 AI Agent 的相对价值投入",
    "subtext": "编辑性编码，1=非核心，5=高投入；截至 2026-09-04",
    "left": "center"
  },
  "tooltip": { "trigger": "axis" },
  "legend": {
    "top": 50,
    "data": ["工程 Agent", "国内工作 Agent", "开源 Harness"]
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
    "data": ["工程\n闭环", "办公\n交付", "长期\n个性化", "运行时\n开放", "企业\n治理", "大众\n易用"]
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
      "name": "工程 Agent",
      "type": "line",
      "symbol": "circle",
      "symbolSize": 8,
      "lineStyle": { "width": 3, "color": "#b84d2e" },
      "itemStyle": { "color": "#b84d2e" },
      "data": [5, 3, 2, 3, 5, 3]
    },
    {
      "name": "国内工作 Agent",
      "type": "line",
      "symbol": "diamond",
      "symbolSize": 9,
      "lineStyle": { "width": 2, "type": "dashed", "color": "#77736d" },
      "itemStyle": { "color": "#77736d" },
      "data": [3, 5, 3, 2, 4, 5]
    },
    {
      "name": "开源 Harness",
      "type": "line",
      "symbol": "emptyCircle",
      "symbolSize": 9,
      "lineStyle": { "width": 2, "color": "#9b756a" },
      "itemStyle": { "color": "#9b756a" },
      "data": [3, 2, 5, 5, 2, 2]
    }
  ]
}
```

| 价值要素 | 工程 Agent | 国内工作 Agent | 开源 Harness |
| --- | ---: | ---: | ---: |
| 工程闭环 | 5 | 3 | 3 |
| 办公交付 | 3 | 5 | 2 |
| 长期个性化 | 2 | 3 | 5 |
| 运行时开放 | 3 | 2 | 5 |
| 企业治理 | 5 | 4 | 2 |
| 大众易用 | 3 | 5 | 2 |

曲线说明三类产品并没有沿同一条路径爬坡。工程 Agent 抬高“工程闭环与治理”，国内工作 Agent 抬高“办公制品与大众入口”，开源 Harness 抬高“长期个性化与运行时控制”。如果未来三条曲线越来越相似，竞争焦点才会从错位市场转向正面替代。

## 全景矩阵：谁在什么位置领先

下表不是绝对能力榜，而是截至 2026-09-04、基于公开产品与文档的相对定位。`强`表示已经形成清晰且可用的产品机制；`中`表示具备能力但不是核心优势；`早期`表示方向成立、成熟度仍需真实项目验证。

| 产品 | 主战场 | 完成闭环 | 并行/长任务 | 扩展性 | 安全治理 | 非技术用户入口 |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | 软件工程与技术工作 | 强 | 强 | **强** | **强** | 中 |
| Codex | 软件工程、Agent 调度与自动化 | **强** | **强** | 强 | **强** | 中 |
| Kimi Code / Work | 编程、研究与知识工作 | 强 | **强** | 中—强 | 中 | 强 |
| WorkBuddy | 国内办公与企业工作台 | 强 | 强 | 强 | 强 | **强** |
| 豆包工作 | 大众办公、多模态与跨端任务 | 中—强 | 中—强 | 中 | 中 | **强** |
| Hermes Agent | 个人自治、记忆与定时任务 | 强 | 中 | **强** | 中 | 中 |
| Pi | 最小 Coding Harness | 中—强 | 按需扩展 | **强** | 需自建 | 弱 |
| DeepSeek Harness | Harness 开发与运行时实验 | 早期 | 强 | **极强** | 早期 | 中 |

几个容易被忽略的结论：

1. **Claude Code 与 Codex 的优势不是按钮更多。**它们把模型、工具、环境、隔离、验证、Git 和团队协作连成了连续路径。
2. **Kimi 是唯一同时在模型、Coding Agent 和 Work Agent 三层下注的国内代表。**这给它更强的垂直整合空间，也让产品线协同成为管理难题。
3. **WorkBuddy 与豆包并非 Claude Code 的低配替代。**它们从办公软件、中文内容、多模态和组织入口切入，竞争对象首先是传统生产力套件。
4. **开源不等于同一类开放。**Hermes 开放的是一套丰富助理，Pi 开放的是极简可编程内核，DeepSeek Harness 开放的是可重组运行时。

## 为什么 Claude Code 与 Codex 暂时领先

### Claude Code：把 Harness 变成工程组织可以塑形的系统

Claude Code 最强的部分不是某个单点功能，而是扩展机制之间的职责分工：`CLAUDE.md` 管长期项目规则，Skills 管按需工作流，MCP 管外部连接，Hooks 管必须发生的确定性动作，Subagents 管隔离上下文，Agent Teams 管协作，Sandbox 与 Permissions 管硬边界。官方的[扩展能力总览](https://code.claude.com/docs/en/features-overview)已经形成一套相对清楚的设计语言。

这使 Claude Code 特别适合“组织有自己的做事方式”这一场景。团队可以把规范、检查、连接和权限逐层编码，而不必把所有要求塞进一段超级提示词。

### Codex：把 Agent 从对话工具变成工作调度系统

Codex 的优势更像操作系统。CLI 负责本地高带宽协作，云端任务负责异步执行，App 负责多线程监督，Worktree 隔离并行改动，Review 负责回收结果，Automations 负责周期性工作。OpenAI 在[Codex App 发布文](https://openai.com/index/introducing-the-codex-app/)中把重点从“写代码”转向“管理多个长期运行的 Agent”。

同时，[Codex CLI 的 Rust 实现](https://github.com/openai/codex)公开了核心 Agent Loop 和系统级沙箱，是“商业产品体验 + 可审计本地执行层”之间很有竞争力的组合。

两者仍有明显边界：核心模型与云端服务是厂商控制的，重度并行会放大成本，企业必须处理源码与业务上下文进入云端模型的治理问题。领先不等于无条件适合所有组织。

## 选型结论：按控制对象选择，不按品牌选择

| 你的首要目标 | 优先考察 | 原因 |
| --- | --- | --- |
| 个人或团队做高质量软件工程 | Claude Code / Codex | 闭环、验证、安全与协作最完整 |
| 同时跑很多独立研发任务 | Codex；Claude Code Agent View / Worktrees | 有明确的任务隔离与监督界面 |
| 把团队规范深度编码进 Agent | Claude Code | Skills、Hooks、MCP、Plugins、权限层次清楚 |
| 中文研究与大规模资料处理 | Kimi Work | 长材料、研究产品与 Agent Swarm 形成组合 |
| 国内企业办公与系统连接 | WorkBuddy | 腾讯生态、企业身份、知识和交付形态完整 |
| 大众办公、多模态创作与跨端任务 | 豆包工作 | 用户入口与字节多模态资产更强 |
| 自建长期运行的个人 Agent | Hermes | 记忆、Skill、消息与 Cron 开箱即用 |
| 构建自己的极简 Coding Agent | Pi | 小内核、模型多样、扩展自由 |
| 研究或搭建可重组 Agent Runtime | DeepSeek Harness | 全插件架构与多种运行模式 |

如果组织准备投入真金白银，不要从“采购哪一个”开始，而应先挑选 20 个真实任务，记录完成率、人工接管次数、验证通过率、平均成本、权限例外和恢复时间。Agent 采购最怕 Demo 驱动；一次成功的炫技，无法替代连续四周的工作样本。

---

上一篇：[三条赛道](/writing/ai-agent-landscape-2026/)。

比较框架已经建立。下一篇把镜头推近工程场景，看 Claude Code、Codex 与 Kimi Code 如何用不同产品结构完成同一类工作。

下一篇：[工程产品](/writing/coding-agent-harness-showdown/)。
