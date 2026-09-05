---
title: Claude Code 系统研究（四）：学习发生在可审计的外部资产中
description: 综合执行、权限、Auto Memory、Skills 与 Hooks，判断 Claude Code 的学习形态、优势和治理边界。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Claude Code
  - Agent Memory
  - Agent Harness
featured: false
readingTime: 1 min
---

> 系列：[1. 全景](/writing/claude-code-internals-overview/)｜[2. 执行循环](/writing/claude-code-agent-loop/)｜[3. 记忆与扩展](/writing/claude-code-memory-extension/)｜[4. 整体判断](/writing/claude-code-internals-synthesis/)

Claude Code 的“学习”不是运行时悄悄修改模型，而是把经验外化为可读资产：纠正和项目规律进入 Auto Memory，稳定约束进入 CLAUDE.md，可复用流程进入 Skill，事件检查进入相应 Hook 配置。这种分层让上下文成本和信任等级不必挤在一个文件里。

它的优势是人可以检查和修订；局限是自动记忆仍会把一次错误带到未来，而且闭源核心让外部研究更多依赖官方行为契约，而不是完整源码。真正成熟的团队用法应把 Memory 视为低信任经验，把规则纳入版本控制，把关键约束放在权限或 Hook，并用测试结果决定 Skill 是否继续生效。

因此，Claude Code 比单纯的规则文件更有学习倾向，但它仍需要经验晋升治理。记住不是终点，能解释某条记忆为何存在、何时过期、怎样撤销才是长期可靠性的开始。

---

上一篇：[记忆与扩展](/writing/claude-code-memory-extension/)。

本系列到此完成。回到[Claude Code 全景](/writing/claude-code-internals-overview/)，可以把模型判断、上下文资产和确定性控制重新分开。更偏产品体验的分析可继续阅读 [Claude Code 产品设计](/writing/claude-code-product-design/)。
