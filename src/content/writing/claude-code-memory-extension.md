---
title: Claude Code 系统研究（三）：记忆、Skill 与 Hook 不应混成一层
description: 拆解 CLAUDE.md、Auto Memory、Skills、Subagents 与 Hooks 的加载时机、作用域、上下文成本和信任边界。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Claude Code
  - Agent Memory
  - Agent Skills
featured: false
readingTime: 7 min
---

> 系列：[1. 全景](/writing/claude-code-internals-overview/)｜[2. 执行循环](/writing/claude-code-agent-loop/)｜[3. 记忆与扩展](/writing/claude-code-memory-extension/)｜[4. 整体判断](/writing/claude-code-internals-synthesis/)

Claude Code 的扩展体系按加载时机分层。CLAUDE.md 保存每次会话都需要的项目规则；Auto Memory 由 Claude 根据纠正与经验维护；Skill 的描述常驻而正文按需加载；Subagent 在隔离上下文中工作；Hook 则在生命周期事件上确定性触发。[官方 Memory 文档](https://code.claude.com/docs/en/memory)明确区分人工规则与自动记忆。

| 机制 | 谁写入 | 何时生效 | 主要风险 |
| --- | --- | --- | --- |
| CLAUDE.md | 人或显式初始化 | 每次会话 | 过长、冲突、规则漂移 |
| Auto Memory | Agent | 跨会话 | 错误经验持续注入 |
| Skill | 作者或团队 | 匹配任务时 | 误触发、内容过时 |
| Subagent | 主 Agent 调度 | 独立任务期间 | 摘要丢失关键证据 |
| Hook | 配置与脚本作者 | 确定事件 | 高权限脚本副作用 |

官方把 Auto Memory 保存为可读 Markdown，并允许用户审计、编辑和删除，这是重要的可治理基础；但“可见”仍不等于“已验证”。经验进入记忆后会影响未来上下文，因此还需要来源、冲突和失效策略。

Skills 与 Hooks 的差异尤其关键：Skill 让模型决定如何执行工作流，Hook 保证事件发生时一定运行某段检查。需要推理的流程放 Skill，需要强制的边界放 Hook，才能避免用提示词冒充控制机制。[扩展总览](https://code.claude.com/docs/en/features-overview)

---

上一篇：[执行循环](/writing/claude-code-agent-loop/)。

下一篇：[整体判断](/writing/claude-code-internals-synthesis/)。

扩展层已经拆开。终篇判断 Claude Code 的学习能力和工程约束为何必须共同存在。
