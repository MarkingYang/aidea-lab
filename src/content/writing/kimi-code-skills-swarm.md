---
title: Kimi Code 系统研究（三）：Skills 与 Agent Swarm 如何组合
description: 拆解多层 Skill 发现、自动调用、Agent 工具与 Swarm 并发，判断 Kimi Code 的能力路由和协作边界。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Kimi Code
  - Agent Skills
  - AI Agent
featured: false
readingTime: 7 min
---

> 系列：[1. 全景](/writing/kimi-code-system-overview/)｜[2. Session 与运行](/writing/kimi-code-session-runtime/)｜[3. Skills 与 Swarm](/writing/kimi-code-skills-swarm/)｜[4. 整体判断](/writing/kimi-code-system-synthesis/)

Kimi Code 的 Skills 采用目录化 Markdown 资产，并从项目、用户和共享位置发现。模型可以根据描述自动调用，正文与资源按需进入任务。[Skills 文档](https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/customization/skills.md)还规定了嵌套深度，避免能力调用无限递归。

Agent 与 AgentSwarm 是另一层：前者把子任务交给独立工作单元，后者允许多个任务并行运行。[工具参考](https://github.com/MoonshotAI/kimi-code/blob/main/docs/en/reference/tools.md)说明它们与 Skill 工具并列存在。这意味着“知道怎样做”和“由谁去做”是两个路由决策。

| 决策 | 选择对象 | 失败风险 |
| --- | --- | --- |
| 能力路由 | Skill | 描述误匹配、版本过时 |
| 任务路由 | Agent | 边界不清、摘要丢失 |
| 并发路由 | Swarm | 写冲突、重复工作 |

多个 Agent 不应共享模糊目标后自行碰撞。可靠协作需要明确输入、输出、文件所有权和验收者；并发提高吞吐，但不会自动提高正确率。

---

上一篇：[Session 与运行](/writing/kimi-code-session-runtime/)。

下一篇：[整体判断](/writing/kimi-code-system-synthesis/)。

终篇区分三件经常被混淆的事：保存历史、调用知识与从经验中学习。
