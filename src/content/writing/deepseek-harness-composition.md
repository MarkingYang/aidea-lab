---
title: DeepSeek Harness：插件生命周期、事件日志与执行契约
description: DeepSeek Harness 把运行能力拆成可组合插件，把模型输入与执行事实记录为事件。沿一次“修复登录超时、不部署”的任务，依次分析组件如何出现和退出、状态怎样恢复、动作如何受约束，以及这些设计把复杂度放到了哪里。
publishedAt: 2026-09-05
type: essay
status: growing
topics:
  - DeepSeek
  - Agent Harness
  - Coding Agent
  - AI 架构
featured: false
readingTime: 24 min
updatedAt: 2026-09-07
---

DeepSeek Harness 把运行能力拆成可组合插件，把模型输入与执行事实记录为事件。沿一次“修复登录超时、不部署”的任务，依次分析组件如何出现和退出、状态怎样恢复、动作如何受约束，以及这些设计把复杂度放到了哪里。

<a id="deepseek-harness-composition"></a>

> 版本边界：本文采用官方源码快照 [`76fda72`](https://github.com/deepseek-ai/deepseek-harness/tree/76fda729799fe9b3848dbe2c211d4b231032b81e)。它是 developer preview；以下解读不是稳定接口或生产安全承诺。

## 每个模块负责什么

| 模块 | 责任 | 不应承担的责任 |
|---|---|---|
| 宿主层 | 存储、执行环境、模型与审批等基础能力 | 让每个任务自行放宽基础边界 |
| Agent 配方 | 当前任务的人设、工具、Skill 和上下文策略 | 替代操作系统隔离 |
| 执行循环 | 调用模型、执行工具、响应反馈、判断继续 | 把所有可选策略写死 |
| 事件日志 | 保存输入、调用、结果与控制事件 | 只保存最终聊天文本 |
| 上下文投影 | 从完整历史组织模型当前需要的信息 | 为压缩而销毁审计事实 |
| 验证与治理 | 核对产物、限制影响面、管理版本 | 用一条“允许”解释全部风险 |

官方把这些责任拆进 session、system-prompt、tools、agent、agent-loop 与 scope 等包。这里的关键区分是：公共 Agent 契约与默认循环实现是分开的，使用方不必依赖某一个固定 Loop。[架构基线](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/architecture.md)

## 用一次修复任务串起来

用户要求“修复登录超时，只改仓库，不部署”。宿主先提供文件系统、模型和受限执行环境；Agent 配方暴露读取、编辑与测试能力；循环读取报错、提出修改、检查结果；事件日志保存输入和工具结果；上下文较长时，模型看到压缩视图，但原始证据仍可追溯。

如果专项检查交给子 Agent，增加的是一个执行主体，不是自动增加权限。主任务仍需验收子方产物，工作区冲突和重复副作用也不会因为“多 Agent”自动消失。

## Cordis：把依赖注入升级成“时空可组合性”

DeepSeek Harness 底层使用 Cordis。配套论文 [A Programming Paradigm for Spatiotemporal Composability](https://arxiv.org/abs/2608.25512)把动态组合拆成两个正交问题：

- **时间可组合性**：组件移除时，能否清理其生命周期内注册的监听器、服务和受管理资源；这不等于撤销已经提交的文件或远端业务写入；
- **空间可组合性**：组件能否声明自己需要什么，并随依赖的出现和消失自动激活或停用。

这两个词听起来抽象，但对应的是插件系统里最常见的两类事故。

第一类是“卸载了，但没卸干净”：Event Listener、Timer、Watcher、Socket 或工具注册仍然存活，下一版插件加载后出现重复回调和幽灵状态。Cordis 把注册行为视为 **Effect**；插件卸载时，框架反向执行 Disposer。`ctx.on()`、子插件、Service 和 Harness 注册表本身已经是受管 Effect，外部资源则必须放进 `ctx.effect()`。

第二类是“加载顺序决定命运”：消费方比 Provider 先启动就报错，Provider 热更新又让引用失效。Cordis 让插件通过 `inject` 声明依赖；缺少 Service 时 Fiber 进入 `PENDING`，依赖出现后再激活，依赖消失时则卸载相关 Effect。它不是在启动时做一次依赖注入，而是在整个运行期持续维护依赖关系。

一次依赖就绪、激活与退出的简化路径。
Cordis 的 Fiber 状态机和自动清理机制见官方[生命周期教程](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/cordis-tutorial/02-lifecycle-and-effects.md)。它带来一个很深的架构变化：**扩展不再只是调用 Host API，而是在一个受生命周期管理的 Context 中声明能力。**

### Waterfall：插件怎样共同决定一次行动

普通事件广播只能通知，Agent Runtime 还需要拦截、改写和否决。Cordis 为此提供 `waterfall`：每个 Listener 接收 `next()`，可以把决定交给下游、包装下游结果，也可以不调用 `next()` 而直接短路。

DeepSeek Harness 用 Waterfall 处理 `agent/pre-step`、`agent/request`、`llm/stream`、`tools/pre-execute`、`tools/execute`、`tools/post-execute` 和 `approval/request`。它很像 Koa 中间件，但被纳入类型系统、作用域和插件生命周期。

代价也很明确：一个本想“只记录日志”的 Listener 如果忘记调用 `next()`，就会吞掉整个下游行为。官方[事件教程](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/cordis-tutorial/04-events.md)把这条纪律写成了常驻规则。可组合性没有消灭复杂度，只是把复杂度从隐式调用顺序变成显式协议。

## Profile、Bundle 与 Preset：应用配置和 Agent 配方是两回事

DeepSeek Harness 没有把所有配置塞进一个巨大 YAML，而是分成三个层级：

- **Profile**：一个可启动的应用形态，例如 `web`、`headless`、`sdk`、`sdk-minimal`、`acp`；
- **Bundle**：可复用的一组 Cordis 配置行，Profile 按顺序叠加多个 Bundle；
- **Preset**：单个 Agent Session 使用的 Persona、工具、Skills 和上下文策略组合。

Profile 的覆盖顺序是：Profile 声明的 Bundles → Profile 自己的 `cordis.patch.yml` → Harness Home 全局 Patch → 命令行 `--patch`。Patch 通过稳定 `id` 替换整行配置，而不是对字段做深合并。这牺牲了一点简洁，换来了更明确的最终状态和更少的“继承后到底是什么”问题。

更值得注意的是 **Host Plane / Agent Plane** 的边界：

- Host Plane 放跨 Session 共享或必须由宿主控制的能力，如注册表、持久化、Sandbox、Approval、模型路由和 Subagent Provider；
- Agent Plane 放某个 Session 才应该拥有的 Persona、Prompt Section、Tools、Skills、Plan、Compaction 和委派入口。

Preset 在独立 Scope 中挂载，作用域内的注册会覆盖同名全局注册。需要私有 Service 的插件组必须声明 `isolate` Realm，否则 Service 会泄露到 Root Context，与其他 Preset 冲突。这个限制并非代码风格偏好，而是避免服务名称和生命周期互相干扰的组合规则。这里的逻辑作用域隔离不等于多租户安全隔离。

官方目前附带四种 Preset：

| Preset | 核心定位 | 模型可见能力 |
| --- | --- | --- |
| `standard` | 完整 Coding Agent | 文件、Shell、Web、Skills、Plan、Goal、Subagent、Workflow 等 |
| `ptc` | 用代码组合工具 | 能力接近 Standard，但用 `run_code` + TypeScript SDK 聚合工具调用 |
| `minimal` | 最小基准与简单编码 | 持久 Shell + `str_replace_editor`，无 Compaction 和动态运行时上下文 |
| `cordis` | 创造与修改 Agent | Standard 能力 + 运行时检查、临时插件和 Preset 创作能力 |

Preset 的组合在 Session 产生任何消息或工具调用之后就不能再切换，因为旧日志里可能包含新工具集无法解释的调用。这个细节很重要：**能力配置可以动态化，但一次对话的语义世界必须稳定。** 具体机制见 [`dsh-agent-presets`](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/packages/preset/agent-presets/README.md)。

## Capability Seam：为什么更换 Sandbox 不该修改 Bash

“Everything is a Plugin”很容易退化成一堆互相引用的 NPM 包。DeepSeek Harness 用 Capability Seam 约束插件之间的结构。一个完整 Seam 通常包含三种角色：

1. **Service Definition**：稳定、依赖较少的能力接口；
2. **Service Provider**：本地、远程或第三方实现；
3. **Consumer**：把能力暴露给模型、UI 或其他系统。

以文件系统为例，模型工具是 Consumer，`ctx.fs` 是抽象 Service，本地目录或 E2B 是 Provider。Shell、PTY 和 LSP 又共享同一个 Subprocess 执行世界。将 Provider 换成远程 Sandbox 时，消费者不需要各自增加一套“remote mode”。

同样的模式贯穿：

- LLM：统一流式词汇 + DeepSeek / pi-ai 等 Adapter；
- Persistence：Session 写入契约 + JSONL / SQLite Provider；
- Web：统一搜索与抓取 Service + 不同 Provider + 模型工具；
- Subagent：统一委派契约 + Spawn / Fork / ACP / Codex / Claude Code / dsh SDK Provider；
- Code Runtime：程序执行契约 + Worker Thread / 未来容器 Provider + PTC Consumer。

这是一种运行时层面的依赖倒置。它比“接口 + 实现”多了生命周期、Scope、事件和配置组合，也比为每个工具写 `if (remote)` 更能控制复杂度。官方为此维护了完整的 [Capability Seams 图谱](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/capability-seams.md)。

## 实践：先写卸载与替换的验收表

| 操作 | 应观察到的结果 | 暴露的问题 |
|---|---|---|
| 工单 Provider 尚未加载 | Consumer 等待，不绕过依赖直接调用 | 隐式加载顺序 |
| Provider 更新 | 旧监听与资源完成清理，新实例接管 | 幽灵回调或重复注册 |
| 两个任务使用不同配方 | 工具与私有 Service 不相互覆盖 | Scope 与 Service 隔离混淆 |
| 日志监听继续下游 | 正常工具调用仍然完成 | Waterfall 被意外短路 |
| 卸载插件后检查远端 | 已发生的工单变更仍需独立处理 | 把资源释放误当业务回滚 |

在隔离测试环境中逐项验证；不要在生产任务中测试热卸载。若要查看锁定版本的启动组合，官方架构文档给出的只读入口是 `dsh --profile web --dump-config`，需要先按该版本说明安装和配置。本文不声称已经在本机部署该运行时。

可组合性的单位不是“一个函数”，而是包含依赖、生命周期与资源所有权的契约。外部业务副作用则需要幂等、对账或补偿机制另行处理。

<a id="deepseek-harness-state"></a>

## Agent Loop：Turn 管输入工作段，Step 管一次模型调用

很多 Agent 框架把循环写成一个看似简单的 `while (toolCalls.length)`。DeepSeek Harness 的循环更像一个事件溯源状态机。

它明确区分：

- **Step**：一次模型请求，以及该响应触发的一组工具执行；
- **Turn**：从一条用户输入被认领，到所有工具债务和中途追加输入都被处理完，包含零个或多个 Step。

Turn 结束表示该输入工作段已收尾，不证明业务目标已经验收。一个 Turn 的主流程如下：

运行时记录 `turn/start`，在 Step 边界认领输入，记录 `step/start` 与用户消息，装配 Prompt 和历史后请求模型。模型响应形成工具调用，经策略检查后执行并记录结果，再写 `step/end`。仍欠工具反馈或 Steering 时进入下一 Step，否则经停止检查写 `turn/end`。

一个 Turn 内的模型请求、工具结果与继续条件。
这套定义解决了几个容易被忽略的边界问题：

- 用户在 Agent 工作时追加的 Steering，可以在最近的 Step 边界进入，而不必粗暴终止整个任务；
- 仅注入 Context 不会唤醒空闲 Agent，它等待下一条真正输入；
- 被策略拒绝的第一步仍会写入 `turn/start` / `turn/end`，所以“尝试过但没有调用模型”也是可审计事实；
- 取消会携带 `user`、`parent`、`hook` 或 `disposed` 原因，并最终进入 Turn 的结束记录；
- 并行安全工具进入有界并发池，Exclusive 工具则形成顺序屏障。

默认 `agent-loop` 只负责“调用模型、执行工具、继续循环”。重试、Compaction、目标推进和停止规则都通过事件或 Capability 插件挂上去。官方[`agent-loop` 文档](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/packages/core/agent-loop/README.md)甚至把自己称为系统中唯一的具体 Loop 实现——“唯一”并不表示不可替换，而是其他包不应偷偷再实现第二套循环语义。

## Session：不是聊天记录，而是运行时的事实账本

DeepSeek Harness 最值得借鉴的设计之一，是把 Session 定义为追加写入的 `SessionEvent` 日志。模型历史不是另一份可变数组，而是从日志投影得到：

```text
Durable Session Events
        │
        ├── deriveMessages() ──> Model History
        ├── projection fold ───> UI / Task / Permission / Token State
        ├── replay ────────────> Resume / Fork
        └── export ────────────> Transcript / Telemetry / Audit
```

它遵循一条很强的约束：**Model-visible means logged。** 任何进入模型请求的信息，都必须能由持久日志重建；运行时 Invariant 会检查请求是否可重构。原始 `assistant/chunk` 也被保留，因此 UI 可以重放流式输出，而不是只得到最终文本。

事件大致分三类：

- `turn/*`、`step/*`、`user/message`、`assistant/*`、`tool/*`：模型交互事实；
- `approval/*`、`compaction/*`、`agent/inbox/*` 等：运行时控制与审计事实；
- `request/header`、`request/context`：模型路由、上下文容量和请求系列的可重构快照。

这比“保存 messages 数组”复杂得多，却带来四个关键收益：

1. **恢复**：进程崩溃后可以识别未闭合 Turn，并在恢复层补写中断语义；
2. **Fork**：子 Session 可以从确定的事件边界继承历史；
3. **多视图一致性**：模型上下文、UI、遥测和审计来自同一事实源；
4. **插件扩展**：新能力通过 Declaration Merging 增加 Event 类型，而不必篡改一份中心状态对象。

它也意味着存储不再只是 I/O 细节。事件顺序、身份、提交边界、Log-only 事件与 Model Surface 的区分，全部成为公共架构。详见官方 [Session 子系统说明](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/subsystems/session.md)。

## 上下文工程：日志保持完整，Surface 可以被替换

事件溯源系统会遇到一个现实冲突：审计要求历史完整，模型上下文要求历史变短。DeepSeek Harness 用“完整 Log + 可变 Surface Projection”解决。

Compaction 不删除旧事件，而是：

1. 写入 `compaction/start`，形成可检测的事务锁；
2. 选取工具调用/结果配对完整的一段 Surface；
3. 生成摘要并写入 `compaction/summary`；
4. 追加一个带 `replace` 操作的 `user/message`，在模型视图中替换旧区间；
5. 最后写入 `compaction/end`。

如果进程在中间崩溃，存在 Start 而没有 End，恢复逻辑就知道这不是一次成功完成的压缩。旧内容仍然存在于 Canonical Log，只是在当前模型 Surface 中被摘要遮蔽。

在生成摘要前，系统还可以对超长 Tool Result 做确定性的头/尾保留与中段裁剪；随后重新测量 Token 压力，只有必要时才进行模型摘要。完整机制见 [Compaction 子系统](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/subsystems/compaction.md)。

Prompt 装配也服务于缓存稳定性。固定 Identity、Persona、Prompt Sections 和工具 Schema 按确定顺序形成前缀；运行时状态则作为有来源的 User-role Snapshot 进入历史。Preset 在 Session 生命周期内保持不变，同一 Preset 的 Agent 共享稳定组合，这有利于 KV Cache 复用。官方 System Prompt 文档也明确记录每项贡献对 Token 和 Cache 的影响，见 [`dsh-system-prompt`](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/packages/core/system-prompt/README.md)。

这套策略的核心不是“尽量压缩”，而是把三种需要分开：

- 审计需要无损事实；
- 模型需要有限、高信号的当前视图；
- Provider Cache 需要稳定前缀。

## 实践：用中断点检验恢复语义

| 中断点 | 恢复时必须回答 |
|---|---|
| 有 tool/call，没有 tool/result | 是否已产生外部效果？先对账还是可安全重试？ |
| 有 compaction/start，没有 end | 摘要事务是否完成？旧证据是否仍可恢复？ |
| 工具被拒绝，模型未运行 | 是否仍能解释本次 Turn 为什么结束？ |
| 摘要成功，但当前模型换了 | 采用的模型、上下文与配置版本能否追溯？ |

这些是设计验收项，不意味着日志本身提供 exactly-once 执行。对“请求已成功但回包丢失”的外部操作，恢复层仍需幂等键或独立状态查询；不能仅因为日志缺 result 就重新执行。

## 从三份历史回到一个事实源

把这次修复的原始事件、模型上下文与 UI 展示放在一起，检查同一个工具调用的参数和结果是否一致。允许 UI 只显示摘要，但摘要必须能指回同一个事件。

完整日志也不是无限保留的许可：生产系统应按数据类别配置访问、保留与删除策略，并处理备份和派生视图。这里的 append-only 是运行时记录语义，不是对所有业务数据永久不可删除的要求。

压缩验收因此要同时检查两份产物：原始日志可追溯，当前投影保留未完成事项与不确定性。

<a id="deepseek-harness-execution"></a>

## 工具系统：先冻结事实，再允许策略介入

工具调用是 Agent 最危险也最容易失真的边界：模型看到的参数、UI 展示的参数、审批时判断的参数和实际执行的参数，必须是同一个事实。

DeepSeek Harness 的做法是先把参数解析成无损 JSON、物化并冻结，再进入策略流水线。参数不能被中途改写，因为一旦改写，历史、审计、UI 和执行就会出现四个版本。

一次调用经过：

```text
model tool call
  → materialize & freeze arguments
  → tools/pre-execute     // allow / deny / ask
  → monotonic guards      // 只能新增 deny，不能重新 allow
  → tools/execute         // 超时、追踪等 around wrapper
  → tool body
  → tools/post-execute    // 接受、替换投影或反馈阻断
  → finalizeContent
  → tools/result          // 冻结后的权威结果
  → durable tool/result
```

这里有三个成熟的设计信号。

### Tool Definition 同时约束输入、规范输出和展示

一个工具不只声明名字、描述和参数，还必须声明 Canonical Output Schema，以及如何把规范值渲染成模型可见的 `ContentBlock`。运行时回调、超时、并发安全分类和 UI Presenter 永远不会泄漏给模型，模型只看到白名单生成的 Schema。

这样一来，“工具返回了对象，但模型只该看到摘要”成为显式投影；原始结构可以在执行链中保持类型化，展示也可以在 Replay 时纯函数重建。

### Guard 只能单调收紧权限

`tools/pre-execute` 是可排序的插件策略，适合 Allow / Deny / Ask。随后执行的 `ToolGuard` 刻意没有 Allow 返回值：它只能不表态或给出拒绝原因。于是无论 Listener 顺序如何，一个安全 Guard 的拒绝都不能被后加载插件翻回允许。

这是“万物插件”架构不可缺少的补丁：扩展性允许多方参与决策，**单调策略**保证安全边界不会因为组合顺序意外变宽。

### 并行安全先由工具声明，再用冲突测试验证

只有工具的 `isConcurrencySafe(args)` 明确返回 `true`，调用才能和兄弟调用重叠；省略、异常或任何非 `true` 结果都按 Exclusive 处理。并行因此不是模型一句“请并行”就能获得的权力，而是工具作者对共享状态和副作用作出的声明。

这些细节都记录在官方 [Tools 子系统](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/subsystems/tools.md)中。它们反映出 DeepSeek Harness 的设计重心：模型协议要短，Host 侧契约要严格。

## PTC：把确定性工具编排移入程序

PTC，即 Programmatic Tool Calling，是 DeepSeek Harness 区别于普通 Native Function Calling 的另一条路线。

在 Native 模式里，模型每调用一组工具，就要等待结果进入上下文，再发起下一次推理。如果任务是“搜索十个文件、读取命中项、过滤内容、汇总结构化结果”，大量中间数据和模型往返并不产生新的推理价值。

PTC 模式只向模型暴露 `run_code` 和自动生成的工具 SDK。模型写一段 TypeScript，把控制流、循环、并发和中间变量留在代码运行时，只有外层结果进入对话上下文：

**以下是表达控制流的伪代码，工具名称不构成可直接运行的 SDK 示例。**

```ts
const hits = await tools.fs_search({ pattern: "AgentLoop" })
const files = await Promise.all(
  hits.slice(0, 8).map((hit) => tools.fs_read({ path: hit.path }))
)

return files
  .filter((file) => file.content.includes("turn/start"))
  .map((file) => ({ path: file.path, relevant: true }))
```

它的潜在收益是：减少模型往返、避免大量中间结果污染上下文，并让确定性控制流回到代码。PTC Preset 因此关闭了通用 `workflow` 工具，避免同时给模型两个重叠的编排表面。

但不要把 Worker Thread 误读成安全沙箱。官方[`code-runtime-worker-thread` 文档](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/packages/code-runtime/code-runtime-worker-thread/README.md)明确把它定义为 **containment, not a security boundary**：每次运行使用新 Worker、空环境、堆限制、计算时间和墙钟时间限制，也能硬终止死循环；但模型代码仍可访问 Node API，信任等级接近 Bash，派生的 OS 进程甚至可能在 Worker 终止后继续存在。

因此 PTC 的本质是**性能与上下文工程机制**，不是权限机制。它是否真的提高任务成功率，还需要针对具体模型和任务做评测。官方仓库当前只提供[运行 Benchmark 的说明](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/BENCHMARK.md)，没有公布足以支持横向性能结论的结果，所以不能仅从架构推导收益数字。

## 多 Agent：先统一委派语义，再叠加团队协作

DeepSeek Harness 把 Subagent 和 Agent Team 分成两层。

### Subagent 是能力接口

`ctx.subagents` 可以同时挂载多个 Provider：

- `spawn`：创建全新上下文的进程内子 Agent；
- `fork`：从父 Agent 已完成历史复制上下文；
- `acp`：通过 Agent Client Protocol 委派给外部 Agent；
- `codex` / `claude-code`：调用真实的 Codex 或 Claude Code；
- `dsh-sdk`：启动另一个完整 Harness Runtime。

Provider 可以是一轮即结束，也可以是可继续的 Child。父 Agent 通过同一接口发现、发送后续消息、中断和读取状态，而不需要知道子方运行在当前进程、另一个进程还是另一个产品中。详见官方 [Subagent 包总览](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/packages/subagent/README.md)。

### Agent Team 是有状态协作域

实验性的 Agent Team 在 Subagent 之上增加：

- 持久 Roster；
- 可恢复 Mailbox；
- 共享 Task DAG；
- 基于 Revision 的 Compare-and-set 更新；
- 对写入路径重叠的提示。

消息先完整写进 Lead Session，只有目标 Session 记录后才确认送达；“已排队但未送达”因此可以在 Replay 时恢复。任务的 `writeScopes` 目前只是建议性路径前缀，不是锁，这一点避免了把提示误当隔离。

它和普通“并行调用多个 Agent”最大的不同是：团队状态也进入可重放日志。代价则是协调协议、恢复语义和共享工作区冲突都变成平台责任。官方仍将它标为 Experimental，见 [Agent Teams 文档](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/subsystems/agent-team.md)。

## 安全架构：插件策略与外层隔离分别验证

DeepSeek Harness 的工具流水线已经体现了 Fail-closed 思想：没有审批通道、审批者异常、返回非法结果或请求被取消，都不能放行动作；只有 `allowed-once` 是授权。

默认权限 Preset 把两个独立旋钮组合起来：

| 权限层 | 可选值 | 控制什么 |
| --- | --- | --- |
| Sandbox Mode | `read-only` / `workspace-write` / `danger-full-access` | 子进程的文件写入范围 |
| Approval Policy | `ask` / `never` | 风险动作是否询问；`never` 表示请求直接拒绝，不是自动允许 |

本地 Sandbox 在 Linux 使用 bwrap / Landlock，在 macOS 使用 Seatbelt，在 Windows 使用 ACL Restricted Token。Provider 必须返回实际受限的命令行，失败时关闭执行；不允许在受限模式下悄悄退回裸命令。

但边界必须准确表达。官方 [Sandbox 文档](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/docs/subsystems/sandbox.md)明确说明，当前 `SandboxMode` **只治理文件副作用，不覆盖网络和进程可见性**；部分旧 Landlock ABI 和 Windows ACL 场景只能报告 `partial` enforcement。公开 Web Fetch 默认不逐次审批，虽然 Provider 会阻止访问非公开目标，但模型仍可能向公开 URL 发送数据。

更高风险的两个模式是：

- PTC 的 Worker Thread 只是资源隔离，不是安全边界；
- `cordis` 创造模式允许模型检查和修改自己运行的插件组合，信任等级等同 Shell Access。

官方 [Safety Notice](https://github.com/deepseek-ai/deepseek-harness/blob/76fda729799fe9b3848dbe2c211d4b231032b81e/SAFETY.md)明确写着：项目尚未经过安全审计，不应被视为安全或生产就绪；对于不可信工作负载，应使用一次性 VM、容器或专用环境，并遵循最小权限。

对于不可信执行内容，可采用下面的外层隔离方案；具体强度取决于挂载、网络和凭证配置：

业务策略、外层隔离和结果验证的分工。
Harness 内策略用于表达业务意图，操作系统或云基础设施负责硬隔离，Git / 测试 / 外部状态读取负责验证结果。三者缺一不可。

## 一组必须分别验证的反例

- 审批后参数被替换：执行应基于同一冻结事实，不能“批 A 做 B”。
- 查询工具共享一个可变游标却标为可并行：用交错请求检查漏读与重复，分类函数不是自动证明器。
- Worker 超时后派生进程仍在：资源限制与系统级清理需分别检查。
- 两个子 Agent 写同一路径：写范围提示不等于文件锁，必须有隔离或协调。
- 任务禁止外发，但 URL 可访问：文件沙箱不替代网络与凭证策略。

“单调收紧”也有信任前提：Guard 约束的是经过该工具流水线的调用。拥有宿主同进程执行权的恶意插件不能仅靠另一段插件代码来隔离，应通过可信供应链和外层环境限制。

本篇不是部署安全保证；上面的验收表应该进入隔离环境中的测试，并与真实数据流、凭证和出站策略一起审查。

## 如果要用它建设自己的 Agent，应该怎样分阶段

### 阶段一：固定组合，先证明单 Agent 闭环

先选择应用 Profile，例如 `sdk-minimal`；再按任务选择 Preset，例如 `standard`，并确认该组合实际包含所需组件。Profile 与 Preset 属于两个层次，不能作为同级模式二选一。起步阶段不启用运行时自修改。只保留少量高质量工具，建立明确的任务完成条件、测试和 Diff 审查。Session Persistence、取消、超时和失败恢复必须先于多 Agent。

成功标准不是 Demo 能调用工具，而是：任务中断后可以恢复，模型可见输入能够重构，所有外部修改都有验证证据。

### 阶段二：建立自己的 Capability Seams

把企业能力拆成 Definition / Provider / Consumer：例如“读工单”是稳定接口，Jira 或 Linear 是 Provider，模型 Tool 与后台 Workflow 是不同 Consumer。不要让模型工具直接绑死底层 SaaS SDK。

同时为每个 Tool 定义：输入 Schema、Canonical Output、模型投影、超时、并发属性、审批理由和最终 Guard。

### 阶段三：按风险划分 Preset

不要做一个拥有所有权限的万能 Agent。至少拆成：

- 只读分析 Preset；
- Workspace Write 编码 Preset；
- 可访问生产 API、必须审批的运维 Preset；
- 仅供平台开发者使用的 Creator Preset。

Preset 决定模型看到的能力，外层 Sandbox、网络和凭证策略决定它实际上能影响什么。

### 阶段四：用评测决定是否启用 PTC 与 Multi-Agent

PTC 适合工具调用链长、中间结果大、控制流容易用代码表达的任务；Native Calling 更适合每一步都需要模型重新判断的任务。Subagent 适合上下文隔离和独立探索，Agent Team 只在共享任务图与持续通信确有价值时启用。

对照实验至少记录：任务完成率、测试通过率、模型请求次数、总 Token、墙钟时间、人工接管次数、越权请求和恢复成功率。架构允许替换只是起点，评测才能决定哪种组合值得保留。

### 阶段五：把插件发布当作供应链发布

插件拥有与宿主同进程的能力，Preset 甚至可能等同 Shell 权限。企业需要锁定版本、审查来源、生成 SBOM、签名发布，并为配置变更保留可回滚记录。不要把“插件市场”当成低风险 Prompt 分享站。

## 真正的复杂度预算，是允许多少种组合进入生产

假设三个模型、三种工具集、两种存储、两种执行环境都可以独立替换，理论组合已有 36 种。这个数字只是乘法示例，不是该项目的部署统计；重要的是每个组合还带着取消、恢复、升级和权限例外。

不需要测试所有想象中的组合。更实用的办法是区分“框架允许的组合”和“组织支持的组合”：后者是少量锁定版本、拥有负责人、通过契约测试、可回滚的配置。

把可表达组合收敛成组织支持的有限配置。
如果没有这层收敛，灵活性会变成配置漂移；如果收敛过早，又会把平台重新做成不可替换的固定产品。合理的边界由实际任务变化和维护能力决定。
