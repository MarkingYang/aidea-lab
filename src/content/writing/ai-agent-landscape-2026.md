---
title: AI Agent 八强竞品全景：谁在卖模型，谁在造 Harness，谁在争夺工作入口
description: Claude Code、Codex、Kimi、WorkBuddy、豆包工作与 Hermes、Pi、DeepSeek Harness 并不处在同一条赛道。本文用三层市场、九个维度和一套选型方法重新理解 2026 年 Agent 竞争。
publishedAt: 2026-09-04
type: essay
status: growing
topics:
  - AI Agent
  - 竞品分析
  - Agent Harness
  - 产品战略
featured: true
readingTime: 23 min
---

把 Claude Code、Codex、Kimi、WorkBuddy、豆包、Hermes Agent、Pi 和 DeepSeek Harness 放进一张表里打分，看起来很完整，实际上很容易得出错误结论。

原因是：它们交付的不是同一种产品。

- Claude Code、Codex 首先在争夺“软件工程工作系统”；
- Kimi Work、WorkBuddy、豆包工作首先在争夺“知识工作入口”；
- Hermes、Pi、DeepSeek Harness 首先在争夺“谁来定义 Agent 的运行时”。

Kimi Code 又跨进了开发者战场，Claude Code 与 Codex 也正从代码仓库向研究、数据、文档和自动化外溢。真正发生的不是八款产品排成一列，而是三条战线逐渐互相吞并。

> [!IMPORTANT]
> **本文的核心判断：**截至 2026 年 9 月，Claude Code 与 Codex 是综合完成度最高的两套 Agent 工作系统。前者胜在可组合、可定制的工程 Harness，后者胜在本地—云端—多任务—审查—自动化的一体化操作系统。国内代表的优势不主要是“模型追平”，而是中文工作流、办公套件、组织连接和本地分发；开源代表的价值则是控制权、可研究性和新架构试验。

本文是系列第一篇。第二篇聚焦[开发者与开源 Harness 的正面对决](/writing/coding-agent-harness-showdown/)，第三篇聚焦[Kimi Work、WorkBuddy 与豆包工作的办公 Agent 战场](/writing/china-work-agent-showdown/)。

## 一、先把八款产品放回正确的赛道

### 第一层：工程 Agent——把需求变成可验证的代码变更

Claude Code、Codex 和 Kimi Code 的核心工作对象是代码仓库。它们要完成的不是“写一段代码”，而是读取项目、修改多个文件、运行命令和测试、解释差异，并把结果交到人类可审查的位置。

[Claude Code 官方产品页](https://claude.com/product/claude-code)已经把入口扩展到终端、IDE、桌面、Web、GitHub、Slack 和移动端；[Codex App](https://openai.com/index/introducing-the-codex-app/)则明确把产品定义成并行管理多个 Agent 的 command center。两者都已超越单一 CLI。

[Kimi Code](https://www.kimi.com/resources/kimi-code-introduction)走的是模型与产品垂直整合路线：月之暗面既提供 Agentic 模型，也提供终端和 IDE Agent。它不再只是“国产模型接进第三方 CLI”，而是在补齐自己的执行层。

### 第二层：工作 Agent——把自然语言目标变成办公制品

Kimi Work、WorkBuddy 和豆包工作的用户通常不从 Git 仓库开始，而从本地文件、浏览器、企业知识库、聊天记录、表格、PPT 或一项模糊业务目标开始。

[Kimi Work](https://www.kimi.com/zh-hans/resources/kimi-work-introduction)强调本地桌面、开放网络、专业数据集与 Agent Swarm；[WorkBuddy](https://cloud.tencent.com/product/workbuddy)强调“办公、代码、设计”统一工作台、腾讯生态和 SkillHub；字节 Seed 团队则把豆包“办公任务”描述为面向真实生产力场景的通用 Agent，突出项目规划、文件处理、工具调用和多模态交付，参见[Seed2.1 发布说明](https://seed.bytedance.com/zh/blog/seed2-1-officially-released-advancing-ai-productivity)。

它们真正争夺的是：**用户愿不愿意把一项完整工作交出去，而不只是把一个问题问出去。**

### 第三层：开源 Harness——把 Agent 本身变成可改造的基础设施

Hermes、Pi 与 DeepSeek Harness 都开源，但哲学差异极大：

| 产品 | 核心主张 | 更像什么 | 默认取舍 |
| --- | --- | --- | --- |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | “会记住、会沉淀技能的个人 Agent” | 电池齐全的自治助理 | 能力面广，部署与安全责任也更重 |
| [Pi](https://pi.dev/docs/latest) | “最小终端 Coding Harness” | 可编程的 Agent 内核 | 核心克制，把工作流和治理交给扩展 |
| [DeepSeek Harness](https://www.deepseek.com/harness/) | “Everything is a plugin” | Agent 运行时与插件实验场 | 组合自由度高，但仍是 developer preview |

它们不以“开箱即用的企业席位”取胜，而以源码可见、模型可换、运行时可改、部署可控取胜。

## 二、方法升级：三个框架回答三种不同问题

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

## 三、不要问谁功能最多，要问九个问题

一套 Agent 的实际价值，可以写成一个并不严谨但非常实用的乘法：

```text
有效产出 = 模型能力 × Harness 完成率 × 环境可达性 × 验证强度 × 可治理性
```

任何一项接近零，漂亮的模型基准都无法变成可靠交付。因此，本报告用九个问题取代“参数、上下文、功能数量”的罗列。

| 维度 | 真正要问的问题 | 常见误区 |
| --- | --- | --- |
| 任务地形 | 它最擅长代码、研究、办公还是跨应用操作？ | 把“能做”当成“稳定擅长” |
| Agent Loop | 遇到失败会不会继续观察、修正和验证？ | 只看第一次回答质量 |
| 上下文系统 | 项目规则、历史、文件和工具结果如何进入注意力？ | 把超长窗口等同于长期记忆 |
| 工具与环境 | 能触达哪些文件、命令、浏览器、SaaS 和设备？ | 用工具数量代替工具质量 |
| 结果验证 | 它如何证明工作真的完成？ | 接受“已完成”的文字声明 |
| 并行与长任务 | 如何隔离任务、协调依赖和恢复中断？ | 认为 Agent 越多必然越快 |
| 扩展性 | Skill、Hook、MCP、插件与 SDK 能改到哪一层？ | 把兼容协议当成完整生态 |
| 安全治理 | 权限、沙箱、凭证、审计、回滚如何组合？ | 只看是否弹确认框 |
| 所有权与成本 | 数据、模型、运行时、配额与迁移权归谁？ | 只比订阅月费 |

这九个维度也解释了为什么本文不提供一个“8.7 分胜过 8.5 分”的总榜。不同用户的权重完全不同：个人开发者看重速度和可塑性，研发负责人看重隔离、审查与吞吐，国内企业看重身份、数据边界和办公系统连接。

## 四、全景矩阵：谁在什么位置领先

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

## 五、为什么 Claude Code 与 Codex 暂时领先

### Claude Code：把 Harness 变成工程组织可以塑形的系统

Claude Code 最强的部分不是某个单点功能，而是扩展机制之间的职责分工：`CLAUDE.md` 管长期项目规则，Skills 管按需工作流，MCP 管外部连接，Hooks 管必须发生的确定性动作，Subagents 管隔离上下文，Agent Teams 管协作，Sandbox 与 Permissions 管硬边界。官方的[扩展能力总览](https://code.claude.com/docs/en/features-overview)已经形成一套相对清楚的设计语言。

这使 Claude Code 特别适合“组织有自己的做事方式”这一场景。团队可以把规范、检查、连接和权限逐层编码，而不必把所有要求塞进一段超级提示词。

### Codex：把 Agent 从对话工具变成工作调度系统

Codex 的优势更像操作系统。CLI 负责本地高带宽协作，云端任务负责异步执行，App 负责多线程监督，Worktree 隔离并行改动，Review 负责回收结果，Automations 负责周期性工作。OpenAI 在[Codex App 发布文](https://openai.com/index/introducing-the-codex-app/)中把重点从“写代码”转向“管理多个长期运行的 Agent”。

同时，[Codex CLI 的 Rust 实现](https://github.com/openai/codex)公开了核心 Agent Loop 和系统级沙箱，是“商业产品体验 + 可审计本地执行层”之间很有竞争力的组合。

两者仍有明显边界：核心模型与云端服务是厂商控制的，重度并行会放大成本，企业必须处理源码与业务上下文进入云端模型的治理问题。领先不等于无条件适合所有组织。

## 六、国内三强的真正机会不是复制 Coding Agent

国内办公 Agent 的机会来自四个更接近业务的摩擦面：

- 中文材料、复杂表格和本土内容平台的理解与生成；
- 企业微信、QQ、飞书、腾讯文档等协作入口；
- 本地文件、桌面软件、浏览器和手机之间的连续任务；
- 国内账号体系、采购、部署、合规与服务交付。

Kimi Work 的差异点是研究与大规模并行，WorkBuddy 的差异点是腾讯办公生态和企业交付，豆包工作的差异点是大众入口、多模态内容与跨端操作。它们若只在 SWE-bench 或“能不能改代码”上追赶 Claude Code，会错过自己的主场。

更关键的产品问题是：能否把一次令人惊艳的 Demo，变成每周都能复用、能审计、能恢复、能明确计费的工作流。

## 七、开源三强代表三种完全不同的未来

### Hermes：Agent 会不会越用越像你的同事

Hermes 把持久记忆、Skill、消息渠道、浏览器、定时任务和子 Agent 放在同一套系统里。官方文档明确把 Agent 创建和修改 Skill 视为“程序性记忆”，同时提供 Skill 与 Memory 写入审批，参见[Hermes Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/)和[安全模型](https://hermes-agent.nousresearch.com/docs/user-guide/security)。

它押注的不是最小工具，而是长期关系：Agent 通过任务历史逐步积累用户事实和做事方法。代价是更大的权限面、更多运行服务，以及更高的部署维护责任。

### Pi：最少的内置意见，最大的可塑空间

Pi 刻意不内置 Plan Mode、Subagents、MCP 和权限弹窗，而是鼓励通过 TypeScript Extensions、Skills、Prompt Templates 与 Packages 构建自己的工作方式。它适合认为“通用产品的默认流程就是限制”的开发者，也意味着权限、并行、审批和企业治理不会凭空出现。

Pi 的价值不是“功能少”，而是让每个高级机制都必须证明自己值得进入系统。

### DeepSeek Harness：把 Agent 的每一层都变成插件

DeepSeek Harness 基于 Cordis，模型、工具、Skill、Session、Sandbox、Storage、Loop、Scheduling 和 UI 都可以组合替换。它甚至提供 Standard、Code、Minimal 与 Creator 等运行模式，见[官方开发者预览](https://www.deepseek.com/harness/)。

这让它非常适合 Harness 研究、内部平台原型和运行时实验。但官方 README 同样明确提示仍处于 developer preview，存在兼容性破坏。把架构潜力等同于生产成熟度，是评估它时最大的风险。

## 八、选型结论：按控制对象选择，不按品牌选择

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

## 九、最后的判断：竞争终局是工作系统，而不是聊天框

这八款产品正在从三个方向靠近同一个终点：

- Coding Agent 向文档、研究、数据和自动化扩展；
- Work Agent 向本地环境、代码执行与企业系统深入；
- Open-source Harness 向可用产品、托管服务与生态市场生长。

最终壁垒不会只是一颗更强模型，而是四种资产的叠加：可持续的 Agent Loop、可读可操作的工作环境、可信的验证与治理、不断积累的组织工作法。

Claude Code 与 Codex 当前领先，是因为它们最早把这四层连成了产品闭环。Kimi、WorkBuddy 和豆包的挑战，是把国内入口与模型优势转化为可重复的完成率；Hermes、Pi 和 DeepSeek Harness 的挑战，则是证明开放与可塑性可以在不牺牲安全、稳定和维护成本的前提下规模化。

真正值得追踪的指标，也因此不是下一次发布会增加多少功能，而是：**人类把一项工作交出去之后，需要回来救场几次。**

---

本文基于截至 2026-09-04 可访问的官方产品页、文档与开源仓库整理。产品变化很快；涉及厂商公布的并发规模、用户量或效率数据时，应视为产品口径，而非跨产品统一基准。本文延续了原四产品报告的“架构—产品—商业—安全”框架，但删除了无法由一手来源稳定支持的精确评分、推测性收入与绝对化结论。
