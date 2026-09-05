---
title: Addy Osmani Agent Skills 研究（三）：验证门槛如何抵抗走捷径
description: 研究 Process、Checkpoint、Anti-rationalization、Evidence 与 Progressive Disclosure，并检查跨工具安装的可移植边界。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - AI 工程
  - 基准测试
featured: false
readingTime: 7 min
---

> 系列：[1. 全景](/writing/addy-agent-skills-overview/)｜[2. 生命周期](/writing/addy-agent-skills-lifecycle/)｜[3. 验证与分发](/writing/addy-agent-skills-verification/)｜[4. 整体判断](/writing/addy-agent-skills-synthesis/)

这个仓库最鲜明的 Skill 结构不是长篇知识，而是流程、检查点、常见借口与证据要求。它预先写下模型可能用来跳过测试或审查的理由，再给出停止条件，把“应该严谨”变成更具体的决策路径。

但 Markdown 无法强制测试真的运行。可靠门槛需要工具输出、CI、Hook 或人工审查配合：Skill 负责提醒何时验证，运行环境负责产生不可伪造的结果。仓库中的 Evals 方向因此很重要，Skill 的质量最终应由触发准确率、任务成功率和回归表现判断。

跨 Agent 分发也存在语义差异。Claude Code Plugin、Codex Plugin、OpenCode 目录和通用 `skills` 安装器的发现、命令、Hook 与资源路径并不相同。官方 README 甚至记录了单 Skill 安装时共享 references 可能缺失的可移植问题。安装成功不等于能力完整。

---

上一篇：[生命周期](/writing/addy-agent-skills-lifecycle/)。

下一篇：[整体判断](/writing/addy-agent-skills-synthesis/)。

终篇判断这套方法最适合被复用的结构，以及不能只靠 Skill 承担的责任。
