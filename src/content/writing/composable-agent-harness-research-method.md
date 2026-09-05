---
title: Harness 源码研究：对象分层、证据卡与实现路线
description: 固定源码快照、系统边界、状态主线、扩展面与失败证据，建立可以重复执行的独立项目研究方法。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Harness
  - 开源架构
  - AI 工程
featured: false
readingTime: 4 min
---

不同项目的名字可以放在一张表里，承担的职责却未必可比。研究 Harness 时，先确定对象层次，再沿一条实际任务追踪状态与控制流，最后比较相同责任的实现。

## 先按职责区分研究对象

| 对象 | 研究问题 | 可进入的案例 |
| --- | --- | --- |
| 完整 Agent 或 Coding Harness | 谁拥有循环、状态、工具和执行边界？ | [Claude Code](/writing/claude-code-internals-overview/)、[Codex](/writing/codex-system-overview/)、[Kimi Code](/writing/kimi-code-system-overview/)、[OpenCode](/writing/opencode-system-overview/) |
| 可塑运行内核与长期助理 | 哪些机制进入内核，哪些策略留给扩展？ | [Pi](/writing/pi-architecture-deep-dive/)、[DeepSeek Harness](/writing/deepseek-harness-composition/)、[Hermes](/writing/hermes-agent-architecture-deep-dive/) |
| 技能与工程资产 | 方法在何时加载，怎样验证和发布？ | [Anthropic Skills](/writing/anthropic-skills-overview/)、[Addy Skills](/writing/addy-agent-skills-overview/)、[Matt Pocock Skills](/writing/mattpocock-skills-overview/)、[ECC](/writing/ecc-architecture-deep-dive/) |
| 记忆基础设施 | 谁提炼事实，怎样检索、更新与删除？ | [Mem0](/writing/mem0-series-overview/)、[OpenViking](/writing/openviking-series-overview/)、[TencentDB Agent Memory](/writing/tencentdb-agent-memory-overview/) |

Skill 资产库不负责模型循环，因此缺少 Session 调度不构成缺陷；极简内核主动外置策略，也不能由功能数量直接判定落后。比较应落在同一职责，例如不同系统如何恢复会话、控制写入或发布技能。

## 固定版本，再追踪一条任务

先记录官方仓库、提交或版本、文档日期以及部署形态。闭源产品只根据公开文档讨论可观察行为，不把产品说明写成逐行源码结论。

选一个具体任务，例如修改文件并运行检查，记录输入如何成为消息、模型响应如何成为工具调用、权限在哪里检查、结果写到什么状态、下一轮怎样继续。每个环节留下文件或配置入口，以及对应的输入输出样本。

## 一张可复用的证据卡

| 维度 | 必须留下的答案 |
| --- | --- |
| 系统边界 | 拥有完整循环、只提供扩展，还是只管理资产？ |
| 状态主线 | Session、消息、工具结果和记忆分别存在哪里？ |
| 控制边界 | 谁决定继续、停止、审批、重试和恢复？ |
| 扩展机制 | Skill、Hook、Plugin 与 MCP 在何时加载？ |
| 信任模型 | 哪些只是提示建议，哪些由执行层强制？ |
| 演进成本 | 格式、安装、兼容、迁移和退出由谁负责？ |
| 证据类型 | 是源码事实、官方声明、实际观察还是分析推断？ |

链接只是入口。判断“能够恢复”还需要指出恢复读取了什么、在哪个故障点验证，以及重启后是否重复产生副作用。未运行过的路径标为待验证，不能用一张架构图替代实验。

## 用失败验证设计取舍

对状态机制测试响应丢失或重启；对扩展机制测试卸载、升级和冲突；对记忆机制测试事实变更与删除传播；对安全机制测试权限失效和不同执行入口。失败样本能说明边界，正常路径往往只能说明接口连通。

不要为了比较而改掉项目的核心约束。例如给 Pi 添加大量自建治理后，比较结果应包含这些额外维护成本；使用开发者预览版 DeepSeek Harness 时，版本兼容成本也属于采用结果。

## 何时可以做跨项目结论

同名概念需要先按生命周期重新定义。比较“Memory”时核对写入对象、读取时机与纠错方式；比较“Hook”时核对事件覆盖、是否阻断及失败处理；比较“Session”时核对保存内容与外部副作用。

这些口径一致后，再拿同一任务和验收标准比较完成率、人工修正时间、恢复行为与维护成本。结论应能说明“在什么任务和配置下更合适”，并允许新版本或新证据推翻它。
