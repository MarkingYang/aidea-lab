---
title: Pi：最小内核如何维持正确性
description: 从 Provider、Agent Loop 与事件协议出发，理解 Pi 的极简为什么不等于简单。
publishedAt: 2026-09-04
updatedAt: 2026-09-06
type: essay
status: growing
topics:
  - Pi
  - Coding Agent
  - Agent Harness
  - 架构设计
featured: true
readingTime: 7 min
---

Pi 的经典路径提供 Agent Loop、`read`、`write`、`edit`、`bash` 四个默认工具和终端入口；计划、审批及子 Agent 等策略由扩展实现。本文检查 Provider、消息投影和工具事件如何让多个入口复用同一内核。

本文基于 Pi 仓库的 [`e44d75c`](https://github.com/earendil-works/pi/tree/e44d75c20a51142abc056c243b13c1d7bb4be687) 提交与 `0.84.4` 代码线分析。这个时间点的仓库同时包含稳定运行的经典架构，以及仍标注为 experimental 的下一代 durable `AgentHarness`。两者必须分开看，否则很容易把未来设计当成当前默认实现。

## 先看全景：Pi 不是一个 CLI，而是一组逐层收窄的抽象

Pi 的 Monorepo 把完整系统拆成多个包。最核心的四层是：

| 层 | 包 | 负责什么 | 不负责什么 |
| --- | --- | --- | --- |
| 模型协议层 | `pi-ai` | Provider、模型目录、认证、流式事件、不同厂商协议适配 | 工具执行、Session、UI |
| Agent 运行层 | `pi-agent-core` | Agent Loop、消息状态、工具调用、队列与生命周期事件 | Coding 场景、磁盘会话、终端 |
| Coding 编排层 | `pi-coding-agent` | 系统提示词、项目上下文、Session、压缩、重试、扩展、内置工具 | 具体模型协议实现 |
| 展示与接入层 | `pi-tui` + Modes | 终端渲染、交互输入、Print/JSON、RPC、SDK | Agent 决策逻辑 |

除此之外，仓库还出现了 `chord`、`pi-protocol`、`pi-client` 与 `pi-server`。它们不是经典 CLI 主链的简单拆包，而是在为“一个持久 Session 被多个前端、进程或远端客户端同时连接”准备新的基础设施。Pi 的根 README 也已经把自己定义为完整的 [Agent Harness 项目](https://github.com/earendil-works/pi)，而不只是 coding-agent 命令行工具。

```mermaid
flowchart TB
  U[用户 / 外部程序] --> M{运行模式}
  M --> TUI[Interactive TUI]
  M --> PRINT[Print / JSON]
  M --> RPC[RPC]
  M --> SDK[SDK]

TUI --> S[AgentSession<br/>Coding 场景编排]
  PRINT --> S
  RPC --> S
  SDK --> S

S --> A[Agent<br/>状态与队列]
  A --> L[Agent Loop<br/>模型 ↔ 工具循环]
  L --> AI[pi-ai<br/>Provider / API / Auth]
  L --> TOOL[read / write / edit / bash<br/>及扩展工具]
  S --> STORE[JSONL Session Tree]
  S --> EXT[Extensions / Skills / Prompts]
```

*图 1｜Pi 以模型协议、Agent 运行、Coding 编排和展示接入四层逐级收窄职责。*

这张图有一个重要含义：**Interactive TUI 不是 Pi 的“大脑”，`AgentSession` 也不是最底层循环。** UI 只是订阅事件并发送命令；Coding 语义集中在 Session 层；真正可复用的 Agent 循环则下沉到了 `pi-agent-core`。

## 第一处关键解耦：Provider 不等于 API

多模型产品最常见的架构债，是把“模型厂商”和“HTTP 协议”绑在一起。Pi 在 `pi-ai` 中把它们拆开：

- **Provider** 是运行时所有者，负责模型目录、认证方式、可用性与请求路由；
- **API** 是线协议，例如 `anthropic-messages`、`openai-responses`、`openai-completions`；
- **Model** 是数据对象，声明自己属于哪个 Provider、使用哪种 API、上下文窗口、价格、推理能力和兼容参数；
- **Models** 是注册表，完成 Provider 查找、认证合并、动态目录刷新与请求分发。

因此，一个 Provider 可以混用多种 API；多个 Provider 也可以共享同一种 OpenAI-compatible API 实现。源码中的 [`Provider`](https://github.com/earendil-works/pi/blob/e44d75c20a51142abc056c243b13c1d7bb4be687/packages/ai/src/models.ts#L97) 接口同时拥有模型目录、认证和 `stream` 能力，而 [`createProvider`](https://github.com/earendil-works/pi/blob/e44d75c20a51142abc056c243b13c1d7bb4be687/packages/ai/src/models.ts#L757) 会根据 `model.api` 选择真正的流实现。

```mermaid
flowchart LR
  MODEL[Model<br/>provider + api + capabilities] --> REG[Models Registry]
  REG --> AUTH[Provider Auth]
  REG --> P{Provider}
  P -->|anthropic-messages| A1[Anthropic Adapter]
  P -->|openai-responses| A2[Responses Adapter]
  P -->|openai-completions| A3[Compatible Adapter]
  A1 --> E[统一 AssistantMessageEvent]
  A2 --> E
  A3 --> E
```

*图 2｜Provider 适配保留厂商差异，再投影为统一而不失真的内部事件。*

不同厂商返回的 SSE、WebSocket、thinking block、tool call delta、usage 和停止原因，最终都被压成同一组事件：`start`、`text_delta`、`thinking_delta`、`toolcall_delta`、`done`、`error`。上层不需要知道事件来自 Anthropic 还是 OpenAI，只需要消费 [`AssistantMessageEventStream`](https://github.com/earendil-works/pi/blob/e44d75c20a51142abc056c243b13c1d7bb4be687/packages/ai/src/utils/event-stream.ts#L56)。

这层设计的价值不只是“支持很多模型”。它把模型切换从一次架构变化降成一次数据与适配变化：Agent Loop 只依赖统一消息和流事件，不依赖任何厂商 SDK。

不过，统一协议并不意味着抹平差异。`Model` 仍保存 thinking level 映射、prompt caching、兼容选项和价格等能力元数据。Pi 的做法更像“统一控制面，保留数据面差异”，而不是强迫所有模型表现成最低公分母。

## Agent Loop：小循环里藏着最多的正确性约束

经典主路径的核心循环位于 [`agent-loop.ts`](https://github.com/earendil-works/pi/blob/e44d75c20a51142abc056c243b13c1d7bb4be687/packages/agent/src/agent-loop.ts)。抽象之后，它只有五步：

```text
装配上下文 → 请求模型 → 流式发布事件 → 执行工具 → 把结果放回上下文
```

只要模型继续返回 tool call，这个循环就继续；没有工具调用时结束。真正值得注意的是循环周围的语义。

### 1. AgentMessage 与 LLM Message 分离

Pi 内部允许存在 `custom`、`bashExecution`、`compactionSummary`、`branchSummary` 等消息，但模型只理解 `user`、`assistant`、`toolResult`。因此每轮调用前会先执行可选的 `transformContext()`，再通过 `convertToLlm()` 投影成模型协议消息。

```text
AgentMessage[]
  └─ transformContext：裁剪、RAG、长期记忆、扩展注入
       └─ convertToLlm：过滤 UI/Session 专用消息
            └─ Message[]：发送给 Provider
```

这个边界非常重要。**持久化格式不应该被某个模型 API 定义，UI 消息也不应该被迫伪装成用户消息。** Pi 允许应用拥有更丰富的内部事件语言，只在最后一刻投影到模型能理解的三种角色。

### 2. 工具默认并行，但结果顺序确定

当一个 assistant message 同时产生多个 tool call 时，Pi 默认并行执行。为了避免并发破坏可重放性，它采用了一个细致的策略：

1. 按模型给出的顺序做参数解析与 `beforeToolCall` 预检；
2. 允许的工具并行运行，完成事件按真实完成顺序发出；
3. 最终写入上下文的 `toolResult` 仍按原始 tool call 顺序排列。

实现可见 [`executeToolCallsParallel()`](https://github.com/earendil-works/pi/blob/e44d75c20a51142abc056c243b13c1d7bb4be687/packages/agent/src/agent-loop.ts#L487)。这样可以及时展示进度，并稳定模型上下文中的结果顺序；并行是否更快取决于工具依赖与资源容量，也不保证外部副作用可重放。如果某个工具声明 `executionMode: "sequential"`，整批调用会退回串行，避免对有顺序副作用的工具做危险并发。

### 3. 把运行过程定义成事件，而不是回调拼图

Agent 会发布 `agent_start`、`turn_start`、`message_update`、`tool_execution_start`、`tool_execution_end`、`turn_end`、`agent_end` 等事件。TUI、JSON 模式、Session 持久化和扩展都消费同一条事件流。

这让 Pi 天然具备多种呈现方式。终端可以逐 token 更新，自动化程序可以读取 JSON，SDK 使用者可以订阅生命周期，而核心循环不需要为每个消费者写一套分支。

### 4. Steering 和 Follow-up 是两个不同的队列

用户在 Agent 工作时追加一句话，可能有两种意图：

- **Steering**：当前工具批次结束后尽快注入，改变正在进行的任务；
- **Follow-up**：等 Agent 原本准备结束时再开启新一轮。

Pi 在 [`Agent`](https://github.com/earendil-works/pi/blob/e44d75c20a51142abc056c243b13c1d7bb4be687/packages/agent/src/agent.ts#L173) 内维护两条队列，并允许一次取一条或全部取出。它没有通过“中断当前 token 流”伪造实时控制，而是在稳定的 turn 边界合并新输入。这是一个小设计，却直接决定长任务能否被自然地纠偏。
