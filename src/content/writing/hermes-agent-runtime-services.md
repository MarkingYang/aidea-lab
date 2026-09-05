---
title: Hermes Agent 源码研究（三）：从工具循环到常驻服务
description: 沿 Tool Schema、execute_code、子 Agent 与 Gateway，理解 Hermes 如何连接执行能力、控制流和跨渠道任务。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Hermes Agent
  - Agent Harness
  - 开发者工具
  - MCP
featured: false
readingTime: 5 min
---

> 系列：[1. 全景](/writing/hermes-agent-series-overview/)｜[2. 运行内核](/writing/hermes-agent-architecture-deep-dive/)｜[3. 工具与服务](/writing/hermes-agent-runtime-services/)｜[4. 记忆与学习](/writing/hermes-agent-memory-governance/)｜[5. 整体判断](/writing/hermes-agent-series-synthesis/)

一个 Agent Loop 只有接触文件、Shell、浏览器和外部服务之后，才开始产生真实副作用。Hermes 的工具层因此不只是能力列表，还承担模型协议、控制流和运行环境之间的边界。

## 工具运行时：Schema 才是 Agent 的 ABI

Hermes 的工具模块通过中央 Registry 自注册。Registry 保存名称、Toolset、JSON Schema、Handler、可用性检查和运行元数据；启动时再发现内置工具、MCP 工具与 Plugin 工具。只有通过 Toolset 选择和 `check_fn` 可用性检查的工具，才会进入模型看到的 Schema 列表。详见官方 [Tools Runtime](https://hermes-agent.nousresearch.com/docs/developer-guide/tools-runtime)。

这套设计看似是插件机制，实质上定义了 Agent 的 ABI：

- Tool Name 是调用符号；
- JSON Schema 是函数签名；
- Description 是模型选择工具的语义类型；
- Handler 是具体实现；
- Toolset 是能力包与权限边界；
- Hook 是调用前后的策略切面；
- Environment 是副作用真正发生的位置。

对传统程序，缺少一个依赖会在运行时报错；对 Agent，更好的做法是让不可用工具根本不出现在 Schema 中。这样模型不会围绕不存在的能力制定计划。Hermes 还会动态修补 `execute_code` 等工具的说明，只暴露本轮真正可调用的子工具，这是一种很实用的“能力诚实”。

### execute_code：把编排从自然语言移到程序

`execute_code` 并不等同于 Shell。模型先生成 Python 脚本，脚本在子进程里通过本地 RPC 调用白名单工具，只有最终 `print()` 输出回到模型上下文；中间几十次搜索、读取和过滤结果不必逐条占用 Conversation。官方 [Code Execution](https://hermes-agent.nousresearch.com/docs/user-guide/features/code-execution/)文档给出了它的资源限制和凭证过滤模型。

它的本质是**用代码做上下文压缩**：

```text
普通 Tool Loop：调用 → 结果进上下文 → 再推理 → 再调用
execute_code：一次写程序 → 程序完成多步确定性处理 → 只回传聚合结果
```

当任务是“遍历 50 个文件并提取字段”时，程序控制流比模型控制流便宜、稳定，也更容易限制。只有涉及模糊判断和策略变化时，才值得为每一步重新调用模型。

### delegate_task：为判断力购买独立上下文

`delegate_task` 解决的是另一类问题：子任务需要新的推理循环，而不是机械批处理。子 Agent 默认拥有独立对话和终端 Session，只把最终摘要带回父上下文；并发数、最大深度、模型和工具集都可限制。对于并行改代码，可选择 Git Worktree 隔离，避免多个 Agent 在同一工作目录互相覆盖，参见 [Subagent Delegation](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation/)。

一个尤其成熟的边界是：**结果投递可以持久化，不代表执行本身可恢复。** Hermes 能在进程重启后重新投递已经完成但尚未送达的子任务结果，却不会声称恢复一个崩溃时仍在运行的子 Agent；这种任务会标为 `unknown`，因为外部副作用是否发生无法被证明。真正必须跨重启的工作，应交给 Cron 或可管理的后台进程。

## Gateway：让 Agent 从工具变成常驻服务

如果说 `AIAgent` 是数据面，Gateway 就是 Hermes 的控制面。它把不同消息平台的事件标准化，完成用户授权、Session Key 路由、运行中消息 Guard、命令旁路、进度反馈、结果投递和后台维护。

这层的价值常被低估。一个可以在 Telegram 上工作数小时的 Agent，需要解决的不是“接一个 Bot API”，而是：

- 同一聊天、群组与 Thread 怎样映射到稳定 Session；
- Agent 正在运行时，新消息是排队、打断还是执行控制命令；
- 危险命令的审批如何在异步聊天界面往返；
- Cron 和后台 Agent 的完成结果应该送到哪里；
- 多个 Profile 使用同一平台凭证时如何避免双重消费；
- 进程重启后，哪些投递义务仍然存在。

因此，Hermes 的“跨平台”不是 UI 特性，而是一个持久化、并发和一致性问题。Gateway 与 SQLite Session、Delivery Ledger、Platform Adapter 一起，把一次性的 Agent Loop 包装成长期在线服务。

---

上一篇：[Hermes 内核](/writing/hermes-agent-architecture-deep-dive/)。

执行链已经闭合，但 Hermes 最有辨识度的问题发生在任务之间：什么应该被记住，什么可以晋升为 Skill，又怎样阻止错误经验持续扩散？

下一篇：[Hermes 积累](/writing/hermes-agent-memory-governance/)。
