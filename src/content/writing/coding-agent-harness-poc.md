---
title: Agent 工作系统全景（五）：两周 PoC 应该怎样比较 Coding Agent
description: 用任务契约、失败样本和统一证据设计两周 PoC，比较可验收结果而不是演示效果。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Coding Agent
  - Agent Harness
  - Agent 评测
  - 产品方法论
featured: false
readingTime: 6 min
---

> 系列：[1. 三条赛道](/writing/ai-agent-landscape-2026/)｜[2. 比较方法](/writing/agent-landscape-comparison-methods/)｜[3. 工程产品](/writing/coding-agent-harness-showdown/)｜[4. 开源路线](/writing/open-source-agent-harness-routes/)｜[5. 工程验证](/writing/coding-agent-harness-poc/)｜[6. 办公产品](/writing/china-work-agent-showdown/)｜[7. 组织落地](/writing/china-work-agent-adoption/)｜[8. 整体思考](/writing/agent-work-system-synthesis/)

一款 Agent 在演示中完成任务，只能证明它曾经成功。选型需要回答另一组问题：成功能否重复、失败能否定位、权限能否约束，以及人类最终花了多少时间审查。

## 先定义 PoC 要决定什么

PoC 不是把公开资料里的价值曲线再画一遍，而是回答一个具体决定：**哪套系统能在我们的任务、权限和成本边界内稳定交付？** 因此，开始前要冻结四项内容：候选产品、任务范围、允许动作和通过门槛。

同一产品可以有多种配置。Claude Code 的权限模式、Codex 的执行环境、Kimi Code 的模型与并发设置都要记录；不能让一个候选使用团队精心准备的项目说明，另一个只拿到一句临时提示。公平不是配置完全相同，而是每个候选都获得完成任务所需、且能在生产中持续维护的配置。

## 两周只做三轮，不追求覆盖所有功能

| 时间 | 目标 | 产物 |
| --- | --- | --- |
| 第 1—2 天 | 固定仓库快照、任务契约与基线 | 任务清单、权限表、人工基线 |
| 第 3—6 天 | 每个候选完成同一批任务，多次独立运行 | 产物、Trace、费用、接管与失败记录 |
| 第 7—8 天 | 将代表性失败变成回归样本 | 失败分类、复现步骤、恢复测试 |
| 第 9—10 天 | 复测改进并做选型复盘 | 决策记录、适用范围、退出条件 |

第一轮不要调到“终于通过”为止。先记录默认状态的真实摩擦，再允许一次有边界的配置改进；否则测到的是评测人员的调参能力，而不是团队未来可以复用的系统能力。

## 任务契约必须先于评分表

每项任务至少写清输入快照、目标状态、禁止动作、预算和验收证据。例如“修复登录超时”不能只写成一句需求，而要说明允许修改的目录、必须通过的测试、是否允许联网、交付 Diff 由谁审查，以及超时后怎样停止。

```yaml
task: fix-login-timeout
snapshot: repo@known-commit
allowed: [read_repo, edit_workspace, run_tests]
forbidden: [push_remote, read_secrets, deploy]
budget: { minutes: 30, retries: 1 }
evidence: [targeted_test, regression_suite, diff_review]
```

这份 YAML 是教学格式，不属于任何候选产品。它的意义是让评测运行器与人类审查者使用同一份完成定义。

## 真正公平的 PoC：不要让六个 Agent 做同一道玩具题

一个有效的两周 PoC，至少应包含四类任务：

1. **定位型任务**：理解陌生代码、追踪跨模块调用、解释故障；
2. **修改型任务**：实现中型功能，必须通过已有测试和静态检查；
3. **长程任务**：需要多轮探索、重启、压缩或交接的迁移；
4. **高风险任务**：包含外部网络、密钥边界、数据库或发布步骤，但设置明确禁止线。

每个任务记录六个数字：一次完成率、测试通过率、人工接管次数、权限例外数、总模型成本、从失败到恢复的时间。并保留完整 Trace，抽样判断“通过”是否来自正确过程，而不是偶然绕过测试。

这里的任务契约、样本分层和回归方法，可以直接复用 [Agent 评测系列](/writing/agent-system-evaluation-research/)；PoC 不应建立另一套只服务于采购演示的评分语言。

对于并行能力，再单独测量：任务是否真正独立、冲突率、重复工作率、汇总遗漏率和人类最终审查时间。Agent 数量不是产出指标；**单位人类审查分钟换来的合格变更量**才是。

## 最后的判断：最好的 Harness 会逐渐隐形

Claude Code 与 Codex 提供的工程机制可转成 PoC 检查项：项目知识有位置，危险动作有边界，并行修改有隔离，结果有 Diff 和测试，完成后有人类审查入口。

开源三强提出的反问同样重要：

- Hermes 问，Agent 能否积累长期关系和程序性记忆；
- Pi 问，多少“高级功能”其实只是可以删除的产品意见；
- DeepSeek Harness 问，为什么连 Agent Loop 本身都不能被热插拔。

下一阶段不会由某一种哲学通吃。成熟产品会吸收开源 Harness 的可塑性，开源项目也会补齐产品的安全与治理。但无论路线如何，评价标准都应回到同一点：**不是 Agent 做了多少动作，而是它以多低的监督成本交付了多少可验证结果。**

---

资料截至 2026-09-04。本文优先使用各厂商官方文档和开源仓库；涉及 experimental、research preview 或 developer preview 的能力均按官方状态标注，不把路线图当成已成熟能力。

---

上一篇：[开源路线](/writing/open-source-agent-harness-routes/)。

工程场景的真相通常留在 Git、测试与 CI 中。办公任务的交付物和责任链不同，下一篇进入 Kimi Work、WorkBuddy 与豆包工作的产品分工。

下一篇：[办公产品](/writing/china-work-agent-showdown/)。
