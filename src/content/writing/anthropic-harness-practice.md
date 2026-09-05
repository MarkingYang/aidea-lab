---
title: 可信 Agent 工程（四）：从案例到一条可落地的 Harness 建设路径
description: 通过评估器循环、并行编译器与 Managed Agents，提炼从单 Agent 闭环到评估驱动扩展的实施顺序。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Anthropic
  - Agent Harness
  - Claude Code
  - AI 工程
featured: false
readingTime: 7 min
---

> 系列：[1. 可靠性地图](/writing/ai-agent-reliability-boundaries/)｜[2. 自治落地](/writing/agent-reliability-adoption/)｜[3. Harness 原理](/writing/anthropic-harness/)｜[4. Harness 实践](/writing/anthropic-harness-practice/)｜[5. TRACE 模型](/writing/trace-framework-deep-dive/)｜[6. TRACE 落地](/writing/trace-lite-production/)｜[7. 整体思考](/writing/trustworthy-agent-engineering-synthesis/)

原则是否有效，要看它能否解释真实系统，并转化为分阶段建设顺序。本篇保留三个案例和四阶段路径，重点观察 Harness 怎样改变同一模型的有效能力。

## 三个案例：Harness 如何改变模型的有效能力

### 案例一：从“一次生成”到 Planner—Generator—Evaluator

Anthropic 在长时间应用开发实验中，最初使用初始化 Agent 拆解任务，再让编码 Agent 每次完成一个功能，并通过文件为下一次会话留下交接物。它解决了跨上下文持续推进，却仍容易生成缺乏原创性或存在真实交互缺陷的应用。

后续 Harness 引入了三个角色：

1. **Planner**：把简短需求扩展为产品规格，但避免过早限定实现；
2. **Generator**：按功能推进实现并做自检；
3. **Evaluator**：通过 Playwright MCP 操作真实页面，检查 UI、API 和数据库状态。

Generator 与 Evaluator 会在开发前协商 Sprint Contract，先明确“完成是什么、如何验证”，再进入编码。设计实验通常循环 5—15 次，完整运行可持续数小时。

这个案例说明，Harness 的增益并不来自“再叫一个模型评审”，而来自四个结构化机制：任务拆解、完成契约、真实环境验证和可持续反馈。模型没有改变，工作制度改变后，有效能力边界被推远了。

### 案例二：16 个 Claude 并行构建 C 编译器

Anthropic 使用 16 个并行 Claude Agent，从零开始编写 Rust 实现的 C 编译器。近 2,000 个 Claude Code 会话、约 2 万美元 API 成本后，系统产生约 10 万行代码，并能够在 x86、ARM 与 RISC-V 上编译 Linux 6.9。参见 [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler)。

真正支撑规模的不是“16 倍智能”，而是测试 Harness：任务必须能够拆分，不同 Agent 的修改要被隔离，失败需要被可重复地定位，测试结果要能自动形成下一轮工作。实验后期还通过随机选择文件分别交给 GCC 和 Claude 的编译器编译，逐步缩小失败范围。

它同时暴露了多 Agent 的成本：并行会引入重复工作、冲突和协调开销。如果没有强测试、共享任务状态与隔离工作区，增加 Agent 数量只会更快地产生混乱。

### 案例三：Managed Agents 将“脑”与“手”解耦

Managed Agents 的早期实现把 Session、Harness 和 Sandbox 放进同一个容器。结构简单，却导致容器故障等同于会话丢失，连接客户 VPC 困难，而且每个会话都必须等待容器、仓库和进程完成初始化。

Anthropic 后来把 Harness 移出容器，把执行环境抽象成统一工具接口，只有任务需要行动时才创建或连接 Sandbox。Session 则成为独立、持久的事件流，Harness 可以按需读取、切片和转换历史。

根据 Anthropic 公布的数据，解耦后 p50 首 Token 延迟下降约 60%，p95 下降超过 90%。更重要的是，模型、上下文策略与执行环境可以分别扩展和失败，系统不再依赖一台不可替换的“宠物服务器”。

这是一条超越 Claude Code 的通用架构原则：**不要让 Agent 的记忆依附于执行容器，也不要让 Harness 假设工具一定与自己运行在同一台机器。**

## 一套可落地的 Anthropic Harness 建设路径

### 第一阶段：单 Agent 的可靠闭环

先选一个边界明确、结果可验证的任务，建立最小 Harness：

- 一个 Gather—Act—Verify 循环；
- 少量高质量工具，而不是完整 API 镜像；
- 明确的结束条件、超时与 Token 预算；
- 可独立检查的环境结果；
- 全量会话和工具轨迹；
- Git 或等价 Checkpoint 恢复机制。

此时不急于引入记忆和多 Agent。先回答最基础的问题：一次失败发生在哪里，系统能否解释、重现和恢复？

### 第二阶段：把项目变成 Agent 可理解的环境

参照 Claude Code 的方式组织上下文：

- 用短小的入口文档提供架构地图与常用命令；
- 用路径规则限定局部规范；
- 用 Skill 封装按需知识和高频工作流；
- 用 MCP 暴露外部能力，但延迟加载详细工具定义；
- 用结构化计划、进度文件和决策日志跨会话交接；
- 定期删除已经过期或模型已不再需要的指令。

衡量标准不是文档覆盖率，而是新会话能否在较少上下文下正确找到事实并继续工作。

### 第三阶段：用硬边界换取有界自治

建立分层控制面：

1. 默认只读；
2. 对低风险工具设置窄范围 Allow；
3. 对外部写入、生产操作和凭证访问设置 Ask 或 Deny；
4. 用 Hook 执行不可省略的格式化、测试、策略与审计；
5. 同时启用文件系统和网络隔离；
6. 将凭证留在 Sandbox 外，通过代理签发短期、限域凭证；
7. 为长任务提供暂停、接管、恢复和紧急终止。

自治程度应由“错误影响范围 × 可检测性 × 可恢复性”决定，而不是由模型基准分数决定。

### 第四阶段：评估驱动扩展

评估集应来自真实失败，并同时观察：

- 最终环境是否达到目标；
- Agent 走过怎样的轨迹；
- 是否违反权限和业务策略；
- 需要多少模型调用、时间与人工介入；
- 重复运行的成功率和方差；
- 模型或 Harness 更新后是否回归。

只有当单 Agent 出现明确瓶颈时，再增加 Planner、Evaluator、Subagent 或 Agent Team。每引入一个组件，都做一次消融测试：没有它是否明显变差？若答案是否定的，就让 Harness 回到更简单的状态。

## 结论：Harness 建设是一门环境工程

Anthropic 对 Agent 的长期判断可以浓缩成一句话：**模型能力只有通过合适的环境才能转化为可靠工作。**

Claude Code 展示了这套环境应如何构成：Agent Loop 让 Claude 持续行动，`CLAUDE.md` 与 Skills 组织上下文，工具与 MCP 连接世界，Subagents 扩展并行能力，Hooks 和 Evals 提供反馈，Permissions 与 Sandbox 控制影响范围，Session、Compaction、Checkpoints 和 Git 保证任务可以延续与恢复。

其中最关键的建设顺序是：

```text
简单循环
  → 高质量上下文与工具
  → 可验证反馈
  → 权限、隔离与恢复
  → 长任务与多 Agent
  → 持续删除已经过时的脚手架
```

未来 Claude 模型会更聪明，今天某些必要的提示、角色和补偿机制会逐渐失去价值。但 Session、工具边界、环境状态、验证证据与安全隔离不会因此消失。一个好的 Harness 不应把当前模型的缺陷永久固化，而应让模型、上下文策略和执行环境能够独立升级。

模型决定系统在某一步可能想到什么；Harness 决定它能否把正确的想法，安全、持续、可验证地变成结果。

## 参考资料

本文主要参考以下 Anthropic 官方资料，产品能力以 2026 年 9 月可访问文档为准：

1. [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
2. [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
3. [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
4. [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
5. [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
6. [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
7. [Scaling Managed Agents: Decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents)
8. [Beyond permission prompts: making Claude Code more secure and autonomous](https://www.anthropic.com/engineering/claude-code-sandboxing)
9. [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler)
10. [Claude Code overview](https://code.claude.com/docs/en/overview)
11. [How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
12. [Extend Claude Code](https://code.claude.com/docs/en/features-overview)
13. [Claude Code permissions](https://code.claude.com/docs/en/permissions)
14. [Claude Code sandboxing](https://code.claude.com/docs/en/sandboxing)
15. [Claude Code checkpointing](https://code.claude.com/docs/en/checkpointing)

---

上一篇：[Harness 原理](/writing/anthropic-harness/)。

Harness 能把验证写进循环，但“任务通过”仍不足以解释过程是否可信、稳定和经济。下一篇进入 TRACE 的轨迹评测模型。

下一篇：[TRACE 模型](/writing/trace-framework-deep-dive/)。
