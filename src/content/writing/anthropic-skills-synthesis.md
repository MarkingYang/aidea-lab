---
title: Anthropic Agent Skills 研究（四）：可移植能力不等于可复制文本
description: 综合规范、渐进披露、资源组织与复杂产物，提炼 Agent Skill 的最小契约和宿主责任。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - Anthropic
  - Agent Harness
featured: false
readingTime: 1 min
---

> 系列：[1. 全景](/writing/anthropic-skills-overview/)｜[2. 渐进加载](/writing/anthropic-skills-progressive-disclosure/)｜[3. 复杂产物](/writing/anthropic-skills-document-pipelines/)｜[4. 整体判断](/writing/anthropic-skills-synthesis/)

Anthropic Skills 仓库展示了一个重要方向：能力应以自包含目录存在，元数据负责发现，正文负责决策，脚本和资源负责执行，验证负责证明产物。Markdown 只是入口，目录内的完整依赖关系才是能力。

标准化能够降低迁移成本，却不会统一宿主的权限、脚本环境、上下文预算和调用策略。生产使用仍需检查依赖、许可证、版本、触发冲突和结果验证。

因此，Skill 的最小契约不只包含 `name` 与 `description`，还应在工程上回答输入、输出、副作用、依赖、验证和失败恢复。只有这些信息可被宿主理解，Skill 才从可复制文本变成可治理能力。

---

上一篇：[复杂产物](/writing/anthropic-skills-document-pipelines/)。

本系列到此完成。回到[标准与示例全景](/writing/anthropic-skills-overview/)，可以分层理解每个目录。关于大规模注册与选择，可继续阅读 [能力路由执行](/writing/capability-routing-execution/)。
