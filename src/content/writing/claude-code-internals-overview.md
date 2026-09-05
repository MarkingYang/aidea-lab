---
title: Claude Code 系统研究（一）：先看编码 Agent 的扩展地图
description: 从 Agent Loop、工具权限、CLAUDE.md、Auto Memory、Skills、Hooks 与 Subagents 建立 Claude Code 全景。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Claude Code
  - Coding Agent
  - Agent Harness
featured: true
readingTime: 2 min
---

> 系列：[1. 全景](/writing/claude-code-internals-overview/)｜[2. 执行循环](/writing/claude-code-agent-loop/)｜[3. 记忆与扩展](/writing/claude-code-memory-extension/)｜[4. 整体判断](/writing/claude-code-internals-synthesis/)

Claude Code 的核心实现并未完整开源，公开仓库主要承担分发、Issue、插件和部分工具，因此本系列不能假装完成逐行源码分析。可验证材料来自[官方仓库](https://github.com/anthropics/claude-code)与[官方架构文档](https://code.claude.com/docs/en/how-claude-code-works)。

```mermaid
flowchart TB
    U[用户任务] --> L[Agent Loop]
    L --> T[文件 / Shell / Web / MCP]
    P[Permission Rules] --> T
    C[CLAUDE.md / Rules] --> L
    M[Auto Memory] --> L
    S[Skills / Subagents] --> L
    H[Hooks] --> T
```

*图 1｜Claude Code 把提示上下文、按需能力与确定性自动化放在不同扩展层。*

第二篇研究模型怎样在观察、工具和验证之间循环；第三篇拆开 CLAUDE.md、Auto Memory、Skill、Subagent 与 Hook，重点判断什么是上下文建议、什么是确定性执行。终篇再回答：Claude Code 的“学习”究竟发生在哪里。

---

下一篇：[执行循环](/writing/claude-code-agent-loop/)。

下一篇先回到一次任务内部，看 Agent 如何获得证据并决定继续或停止。
