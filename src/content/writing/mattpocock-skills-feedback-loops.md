---
title: Matt Pocock Skills 研究（三）：反馈速度为什么决定 Agent 速度
description: 从 TDD、Bug 诊断、架构调查和小步变化，研究 Skills 如何让 Agent 接触运行证据并控制代码熵。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - AI 工程
  - 架构设计
featured: false
readingTime: 6 min
---

> 系列：[1. 全景](/writing/mattpocock-skills-overview/)｜[2. 对齐与语言](/writing/mattpocock-skills-alignment/)｜[3. 反馈与设计](/writing/mattpocock-skills-feedback-loops/)｜[4. 整体判断](/writing/mattpocock-skills-synthesis/)

代码生成变快后，系统真正的速度上限转移到反馈。TDD Skill 用失败测试建立目标，再用最小实现获得下一轮信号；Bug 诊断 Skill 分阶段复现、定位和验证，避免模型在多个假设之间同时修改。

架构 Skill 则不承诺自动重构整个旧系统，而是调查深模块机会，把候选和理由交给人选择。这种克制很重要：Agent 能快速制造大范围变化，但结构判断需要业务语言、历史约束和迁移成本。

```mermaid
flowchart LR
    H[假设] --> X[最小变化]
    X --> E[测试 / 类型 / 运行证据]
    E --> D{是否支持假设}
    D -->|否| H
    D -->|是| N[保留并进入下一步]
```

*图 1｜小步循环让错误尽早暴露，速度来自反馈频率而非单次变更规模。*

Skill 可以规定循环，但证据仍必须来自真实工具。没有测试环境、浏览器或可观察系统，流程写得再好也只能得到语言上的“验证”。

---

上一篇：[对齐与语言](/writing/mattpocock-skills-alignment/)。

下一篇：[整体判断](/writing/mattpocock-skills-synthesis/)。

终篇把对齐、语言和反馈连起来，判断小型 Skills 为什么比完整流程接管更适合某些团队。
