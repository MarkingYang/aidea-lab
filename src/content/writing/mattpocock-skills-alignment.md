---
title: Matt Pocock Skills 研究（二）：追问与共享语言如何降低误解
description: 沿 Grill、CONTEXT.md 与 ADR，研究 Agent 如何在实现前澄清需求，并用项目语言压缩后续沟通成本。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - Context Engineering
  - 用户研究
featured: false
readingTime: 1 min
---

> 系列：[1. 全景](/writing/mattpocock-skills-overview/)｜[2. 对齐与语言](/writing/mattpocock-skills-alignment/)｜[3. 反馈与设计](/writing/mattpocock-skills-feedback-loops/)｜[4. 整体判断](/writing/mattpocock-skills-synthesis/)

`grill-me`与`grill-with-docs`不急于给方案，而是通过连续问题暴露目标、边界和未知。它们把“需求不清”当作需要处理的工作状态，而不是让模型用默认假设填满空白。

追问的产物不应只留在会话。仓库进一步把领域术语写进 CONTEXT.md，把难以解释的选择写进 ADR。共享语言减少 Agent 每次重新推断概念的成本，也让文件、函数和讨论使用相同词汇。

这套方法的边界是不能无限访谈。好的 Skill 需要明确退出条件：关键用户、成功标准、不可接受结果和验证方式已经足够清楚，就进入小步实现；仍有高影响分歧，则把问题交还给人决定。

---

上一篇：[全景](/writing/mattpocock-skills-overview/)。

下一篇：[反馈与设计](/writing/mattpocock-skills-feedback-loops/)。

对齐只保证方向，不能保证实现。下一篇看 Agent 怎样通过快速反馈避免把错误和复杂度一起放大。
