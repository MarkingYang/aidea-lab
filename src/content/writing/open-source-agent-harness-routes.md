---
title: Agent 工作系统全景（四）：Hermes、Pi 与 DeepSeek Harness 的三种路线
description: 对照 Hermes、Pi 与 DeepSeek Harness，理解丰富自治、极简内核与全插件运行时的不同代价。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Harness
  - 开源架构
  - Hermes Agent
  - Pi
featured: false
readingTime: 7 min
---

> 系列：[1. 三条赛道](/writing/ai-agent-landscape-2026/)｜[2. 比较方法](/writing/agent-landscape-comparison-methods/)｜[3. 工程产品](/writing/coding-agent-harness-showdown/)｜[4. 开源路线](/writing/open-source-agent-harness-routes/)｜[5. 工程验证](/writing/coding-agent-harness-poc/)｜[6. 办公产品](/writing/china-work-agent-showdown/)｜[7. 组织落地](/writing/china-work-agent-adoption/)｜[8. 整体思考](/writing/agent-work-system-synthesis/)

开源 Harness 的价值不是免费复制商业产品，而是允许开发者重新决定哪些机制进入内核、哪些策略留给扩展，以及由谁承担安全和运维责任。

## 开源三强代表三种完全不同的未来

### Hermes：Agent 会不会越用越像你的同事

Hermes 把持久记忆、Skill、消息渠道、浏览器、定时任务和子 Agent 放在同一套系统里。官方文档明确把 Agent 创建和修改 Skill 视为“程序性记忆”，同时提供 Skill 与 Memory 写入审批，参见[Hermes Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/)和[安全模型](https://hermes-agent.nousresearch.com/docs/user-guide/security)。

它押注的不是最小工具，而是长期关系：Agent 通过任务历史逐步积累用户事实和做事方法。代价是更大的权限面、更多运行服务，以及更高的部署维护责任。

### Pi：最少的内置意见，最大的可塑空间

Pi 刻意不内置 Plan Mode、Subagents、MCP 和权限弹窗，而是鼓励通过 TypeScript Extensions、Skills、Prompt Templates 与 Packages 构建自己的工作方式。它适合认为“通用产品的默认流程就是限制”的开发者，也意味着权限、并行、审批和企业治理不会凭空出现。

Pi 的价值不是“功能少”，而是让每个高级机制都必须证明自己值得进入系统。

### DeepSeek Harness：把 Agent 的每一层都变成插件

DeepSeek Harness 基于 Cordis，模型、工具、Skill、Session、Sandbox、Storage、Loop、Scheduling 和 UI 都可以组合替换。它甚至提供 Standard、Code、Minimal 与 Creator 等运行模式，见[官方开发者预览](https://www.deepseek.com/harness/)。

这让它非常适合 Harness 研究、内部平台原型和运行时实验。但官方 README 同样明确提示仍处于 developer preview，存在兼容性破坏。把架构潜力等同于生产成熟度，是评估它时最大的风险。

## Hermes、Pi、DeepSeek Harness：三种开源哲学

### Hermes：Batteries included 的长期自治 Agent

Hermes 默认提供的不是最小编码循环，而是一套可长期运行的个人 Agent：持久记忆、Skills、浏览器、消息平台、子 Agent、Checkpoint、Cron 和多模型 Provider。

它最有辨识度的机制是把 Memory 与 Skills 分开：Memory 保存短小、常驻的事实，Skill 保存按需加载的程序性知识。Agent 可以从非平凡任务、错误修正和用户反馈中创建 Skill；用户也可以开启写入审批。参见[Hermes 功能总览](https://hermes-agent.nousresearch.com/docs/user-guide/features/overview)与[Skills 文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/)。

这条路线特别适合个人自动化、跨渠道助理和重复工作积累，不应只用 Coding Agent 标尺评价。

它的问题也来自“电池齐全”：能力越多，攻击面越大。官方安全文档提供危险命令审批、文件写入限制、容器隔离、MCP 凭证过滤、上下文扫描和跨 Session 隔离，但默认本地运行仍可能拥有当前用户的文件权限。部署者不能把“开源”误读为“默认安全”。

### Pi：刻意保持空白的最小 Harness

[Pi 官方文档](https://pi.dev/docs/latest)将自己定义为 minimal terminal coding harness。项目现由 Earendil Works 维护，原 `badlogic/pi-mono` 地址会重定向到 `earendil-works/pi`。默认只有少量文件与 Shell 工具；计划、待办、Subagents、MCP 和权限弹窗都不是强制内置，而由 Extensions、Skills、Packages、tmux 或外部隔离方案决定。

这不是功能落后，而是一种架构立场：

```text
核心只保留普遍机制；工作流偏好、团队制度和安全策略由使用者显式添加。
```

Pi 适合 Harness 开发者、模型评测者和讨厌重型默认设置的高级用户。它也提供 RPC 与 SDK，便于嵌入自定义 UI 或流水线，参见[Pi SDK](https://pi.dev/docs/latest/sdk)。

但“没有权限弹窗”不是安全特性。Pi 官方建议在容器中运行或自行构建确认流。对缺少平台工程能力的团队，极简会把产品复杂度转化为自建复杂度。

### DeepSeek Harness：把运行时本身做成插件图

DeepSeek Harness 的 Cordis 架构把模型、工具、文件访问、Agent Loop、Session、Sandbox、Storage、Scheduling 与 UI 都视为插件。Standard Mode 提供完整 Agent，Code Mode 让模型用代码编排多轮工具，Minimal Mode 用极少工具做基准，Creator Mode 用于检查和重组运行时。

与 Pi 相比，Pi 是“稳定的小核心 + 外围扩展”，DeepSeek Harness 更接近“核心能力也可以被重新组合”。它对研究不同 Loop、工具暴露方式和运行时拓扑很有吸引力。

但官方[README](https://github.com/deepseek-ai/deepseek-harness)明确写着 developer preview 和 compatibility-breaking changes。对生产采购而言，架构领先与运维成熟是两张不同的答卷。

## 六款产品的相对优势，不用总分表达

| 如果你最在意 | 首选 | 第二选择 | 需要接受的代价 |
| --- | --- | --- | --- |
| 成熟的可定制工程 Harness | Claude Code | Codex | 厂商模型与订阅绑定 |
| 多任务监督与云地协同 | Codex | Claude Code | 配额、审查队列与任务切分成本 |
| 国产模型—产品一体化 | Kimi Code | 自建 Pi + 国产模型 | 产品快速迭代与企业治理仍需实测 |
| 长期个人 Agent 与跨渠道自动化 | Hermes | 自建 DeepSeek Harness | 权限面与持续运维责任 |
| 极简、透明、可塑的 Coding 内核 | Pi | Codex CLI | 高级能力与安全治理需自行装配 |
| 自研 Agent 平台或 Harness 实验 | DeepSeek Harness | Pi SDK | 版本兼容与生产化成本 |
| 企业默认安全基线 | Claude Code / Codex | WorkBuddy Code | 仍需组织配置与人工审查 |

“首选”也不意味着单一采购。很常见的一种组合是：用 Claude Code 或 Codex 作为工程师默认产品，用 Pi 或 DeepSeek Harness 做模型与运行时实验，用 Hermes 承担个人或团队的非代码自动化。

如果要继续进入架构内部，可以沿 [可塑 Agent Harness 系列](/writing/composable-agent-harness-architecture/)对照 Hermes、Pi 与 ECC，再进入 [DeepSeek Harness 架构系列](/writing/deepseek-harness-architecture/)理解全插件运行时。它们不是新的产品排名，而是对不同 Harness 取舍的纵向补充。

---

上一篇：[工程产品](/writing/coding-agent-harness-showdown/)。

路线差异已经清楚，但架构偏好不能直接变成采购结论。下一篇把比较落到真实任务、失败样本和人工审查成本。

下一篇：[工程验证](/writing/coding-agent-harness-poc/)。
