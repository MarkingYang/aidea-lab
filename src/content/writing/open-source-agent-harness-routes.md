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
readingTime: 4 min
---

> 系列：[1. 三条赛道](/writing/ai-agent-landscape-2026/)｜[2. 比较方法](/writing/agent-landscape-comparison-methods/)｜[3. 工程产品](/writing/coding-agent-harness-showdown/)｜[4. 开源路线](/writing/open-source-agent-harness-routes/)｜[5. 工程验证](/writing/coding-agent-harness-poc/)｜[6. 办公产品](/writing/china-work-agent-showdown/)｜[7. 组织落地](/writing/china-work-agent-adoption/)｜[8. 整体思考](/writing/agent-work-system-synthesis/)

开源 Harness 的价值不是免费复制商业产品，而是允许开发者重新决定哪些机制进入内核、哪些策略留给扩展，以及由谁承担安全和运维责任。


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

## 按要控制的机制选择实验对象

| 你想控制什么 | 可研究的项目 | 先验证的代价 |
| --- | --- | --- |
| 长期个人助理的记忆、技能与消息入口 | Hermes | 权限面、后台服务与持续维护 |
| 小型 Coding Loop 与 TypeScript 扩展 | Pi | 高级能力、安全策略需要自行装配 |
| 可替换的 Loop、服务与插件拓扑 | DeepSeek Harness | 版本兼容、插件组合与生产化成本 |

这里选的是研究入口，没有跨项目统一基准，不给出第一、第二名。研究完成后，再拿业务任务比较自建成本与商业产品的默认能力。

如果要继续进入架构内部，可以先从 [可塑 Agent Harness 研究地图](/writing/composable-agent-harness-architecture/)选择一个独立项目系列，再进入 [DeepSeek Harness 架构系列](/writing/deepseek-harness-architecture/)理解全插件运行时。当前阶段先逐个建立事实，不把不同层次的项目提前做成产品排名。

---

上一篇：[工程产品](/writing/coding-agent-harness-showdown/)。

路线差异已经清楚，但架构偏好不能直接变成采购结论。下一篇把比较落到真实任务、失败样本和人工审查成本。

下一篇：[工程验证](/writing/coding-agent-harness-poc/)。
