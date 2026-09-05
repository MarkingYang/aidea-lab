---
title: Addy Osmani Agent Skills 研究（二）：命令如何路由到阶段 Skills
description: 沿 Spec、Plan、Build、Test、Review 与 Ship，拆解入口命令、元 Skill、专业角色和阶段产物的编排方式。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - AI 工程
  - Context Engineering
featured: false
readingTime: 2 min
---

> 系列：[1. 全景](/writing/addy-agent-skills-overview/)｜[2. 生命周期](/writing/addy-agent-skills-lifecycle/)｜[3. 验证与分发](/writing/addy-agent-skills-verification/)｜[4. 整体判断](/writing/addy-agent-skills-synthesis/)

仓库使用少量命令作为用户入口，再由元 Skill 判断当前阶段需要哪些能力。`/spec`负责把模糊需求变成边界，`/plan`拆成可验收任务，`/build`按切片实现，`/test`与`/review`提供反馈，`/ship`处理发布证据。入口稳定，内部 Skill 可以独立演进。

这种结构解决万级能力路由中的一个实际问题：用户不应该记住所有 Skill 名称，而应表达当前工作阶段。路由依据不是词面相似度，而是任务状态与所需产物。

| 阶段 | 主要产物 | 退出条件 |
| --- | --- | --- |
| Define | 问题与约束 | 目标可复述 |
| Plan | 原子任务 | 每项可验证 |
| Build | 小批变更 | 局部检查通过 |
| Verify | 测试证据 | 失败已解释 |
| Review | 风险清单 | 关键问题关闭 |
| Ship | 发布与回滚计划 | 结果可观察 |

流程仍需允许跳转和回退。真正的工程工作不是瀑布线，失败会把任务送回计划或实现；Skill 编排的价值，是让回退带着证据，而不是重新开始一段无状态对话。

---

上一篇：[全景](/writing/addy-agent-skills-overview/)。

下一篇：[验证与分发](/writing/addy-agent-skills-verification/)。

流程能够运行后，下一篇检查模型为什么会跳过步骤，以及仓库怎样减少这种倾向。
