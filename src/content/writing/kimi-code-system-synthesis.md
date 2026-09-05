---
title: Kimi Code 系统研究（四）：可恢复与会学习之间还有一步
description: 综合 Session、Skills、Agent Swarm 与 SDK，判断 Kimi Code 的系统优势、学习边界和生产化责任。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Kimi Code
  - Agent Harness
  - Agent Skills
featured: false
readingTime: 5 min
---

> 系列：[1. 全景](/writing/kimi-code-system-overview/)｜[2. Session 与运行](/writing/kimi-code-session-runtime/)｜[3. Skills 与 Swarm](/writing/kimi-code-skills-swarm/)｜[4. 整体判断](/writing/kimi-code-system-synthesis/)

Kimi Code 已经把三项重要能力接在一起：Session 让任务可恢复，Skill 让方法可按需加载，AgentSwarm 让独立工作单元并发执行。CLI 与 SDK 共用这些能力，又为外部产品嵌入提供了清晰入口。

但它们仍不自动构成学习闭环。历史只有经过提炼才会成为知识；Skill 只有经过验证和版本管理才会成为可靠经验；Swarm 只有拥有任务所有权和独立验收才会成为协作系统。当前更准确的定位是可恢复、可组合的 Agent Runtime，而不是自动把任务经验晋升为新能力的系统。

因此，后续最值得观察的是 Session 事实如何进入受治理的 Memory 或 Skill，以及多 Agent 结果如何形成统一证据链。

---

上一篇：[Skills 与 Swarm](/writing/kimi-code-skills-swarm/)。

本系列到此完成。回到[Kimi Code 全景](/writing/kimi-code-system-overview/)，可以把持久化、能力路由和协作分别判断。关于多 Agent 的责任划分，可继续阅读 [Harness 多 Agent](/writing/harness-operations-multi-agent/)。
