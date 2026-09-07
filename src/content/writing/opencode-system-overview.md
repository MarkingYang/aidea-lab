---
title: OpenCode：会话运行、上下文压缩与工具状态
description: 沿 OpenCode 源码追踪会话循环、消息投影、两级压缩与工具收尾，解释开放扩展和运行控制的取舍。
publishedAt: 2026-09-05
updatedAt: 2026-09-07
type: essay
status: growing
topics:
  - OpenCode
  - Coding Agent
  - Agent Harness
featured: true
readingTime: 12 min
---

<a id="opencode-system-overview"></a>

OpenCode 把一次代码任务组织成持续更新的 Session：用户输入成为消息，模型生成的文本和工具调用成为消息片段，工具结果再次进入模型，直到循环满足退出条件。客户端展示过程，运行时持有状态，Provider 适配器负责把内部消息转换为模型接口需要的格式。

真正值得追踪的是：历史越来越长时，模型还看见什么；工具被中断时，系统留下什么；不同客户端和扩展怎样围绕同一份运行状态工作。

本文固定到 [`anomalyco/opencode@e207624`](https://github.com/anomalyco/opencode/tree/e207624c48159b03dbe17dbc8e51bbcf23e72df5)，该提交的 `packages/opencode` 版本为 1.18.29。主要分析这个包中的 `SessionPrompt → SessionProcessor → SessionTools` 路径。仓库同时存在 `packages/core` 的运行模块，后文对其协调器单独做实验；不能将两套模块的默认参数和调用链拼成一套已验证的系统。

## 模块怎样分工

| 模块 | 持有或处理的对象 | 对下一环节交付什么 |
| --- | --- | --- |
| 客户端与服务接口 | 用户输入、展示与事件订阅 | Session 操作请求 |
| SessionPrompt | 当前消息、待处理子任务、压缩任务、循环步数 | 本轮模型、Agent 与工具集合 |
| SessionProcessor | 模型流、文本片段、工具片段、文件快照 | 持久消息变化与继续／压缩／停止信号 |
| SessionTools | 本地工具、MCP 工具、执行上下文 | 参数、权限询问、结果与附件 |
| MessageV2 | 持久消息到模型消息的转换 | 满足 Provider 输入要求的当前历史 |
| SessionCompaction | 旧工具输出清理、历史摘要和近期尾部 | 下一轮使用的较短上下文 |

这些是源码中的职责边界，并不意味着每个模块都独立部署。尤其要区分三个对象：**保存的历史、送给模型的历史、用户正在看到的历史**。它们可以来自同一个 Session，却不必包含相同细节。[循环入口](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/prompt.ts)、[消息转换](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/message-v2.ts)

## 一次任务如何运行

以“修改函数并运行测试”为例，`runLoop` 每轮重新读取经过压缩过滤的 Session 历史，定位最新用户消息、最新助手消息、已完成消息与待处理任务。

1. **先判断是否结束。** 检查助手的结束原因、实际工具调用，以及助手消息是否回应了最新用户输入。
2. **处理已有工作。** 待处理子任务进入子任务路径；压缩任务先完成压缩。上一轮输入已接近窗口上限时，创建压缩任务再进入下一轮。
3. **装配本轮。** 根据当前 Agent 和模型解析工具，把消息转成 Provider 可接受的输入，交给处理器执行。
4. **记录过程。** 流式文本、工具调用、结果和文件变化转为消息片段。
5. **继续判断。** 根据处理结果继续循环、进入压缩或停止。

一个细节解释了为什么 Harness 需要掌握控制权：有些 Provider 会在包含工具调用的消息上返回 `stop`。此路径还检查消息中是否有需要处理的工具调用，避免工具刚执行完、结果尚未送回模型就结束；标记为中断孤立项的调用另行处理。**模型的结束标签只是退出条件的一部分。**[runLoop 源码](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/prompt.ts#L1081)

这是一种围绕 Session 的动态循环。任务的下一步可以由模型和当前反馈决定；如果业务要求固定依赖、并行汇合与显式状态合并，需要进一步比较 [LangGraph 的图执行语义](/writing/langgraph-runtime-architecture/)，不能因为循环也能完成多步任务，就把它等同于 DAG 调度器。

## 上下文压缩有两种不同动作

### 旧工具输出清理：保留调用，降低旧结果的输入成本

`prune` 从最近消息向前扫描，保护最近两轮用户交互，跳过未完成工具和 `skill` 工具输出，并在已有摘要或已清理边界停止。对可清理工具结果，源码设置了两道规模门槛：先保护约 40,000 个估计 Token，能够回收的部分超过 20,000 才执行清理。

清理动作是在工具结果的时间字段中写入 `compacted` 标记。该函数没有直接删除原来的 `output` 字段；后续 `toModelMessages` 在构建模型输入时，以“旧工具结果内容已清理”的占位信息替换输出，并不再附带该结果的附件。因此，**模型失去某段输出，不等于这段记录已从持久数据中物理删除**。数据保留与删除政策仍需检查存储层。[清理逻辑](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/compaction.ts)、[输入投影](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/message-v2.ts)

例如一次测试输出了上千行日志，后续数轮已经定位到某个失败断言。清理旧日志能节省重复输入，但如果模型后来需要另一个错误的完整堆栈，必须重新读取或回查。这个策略接受的是“近期结果更可能有用”的假设，并没有证明被省略的细节永远无用。

### 历史摘要：旧段落进入摘要，近期尾部继续保留

完整压缩会选择历史前段作为摘要输入，并按预算保留近期尾部。此路径的默认近期预算是可用输入空间的四分之一，再限制到 2,000～15,000 个估计 Token；配置可以覆盖它。选择先按用户轮次推进，单轮过大时也可能在轮内寻找可容纳的消息尾部，因此“保留最近一轮”不是无条件完整保留。

摘要自身成为带 `summary` 标记的助手消息，与压缩请求关联。只有已完成且无错误的摘要才被识别为完成的压缩。摘要请求使用空工具集合，插件可在消息变换和压缩提示阶段介入；摘要输入中的单项工具输出也会被截短。生成失败与压缩输入仍然溢出都有停止路径，不能把“已开始摘要”当成“已成功切换上下文”。[摘要选择与执行](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/compaction.ts)

这里有两次信息损失的机会：摘要前的材料裁减，以及模型概括本身。保留目标、约束、已完成工作、阻塞项和下一步，能提高续接概率；要证明正确率仍需要长任务实测。压缩比不是任务保持率。

### 触发预算：窗口上限也需要解释

`overflow.ts` 会考虑模型的输入上限、上下文上限、输出空间和配置预留，并检查最近调用的 Token 用量。关闭自动压缩或模型窗口未定义时，这条自动触发路径不生效。历史选段另外使用字符估计，不能把它与 Provider 返回的实际计量混为一谈。[预算计算](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/overflow.ts)

对自己的 Harness，可以直接借鉴三个独立接口：`需要压缩吗`、`压缩哪些材料`、`如何应用压缩结果`。拆开后，才可以分别评估触发时机、信息损失与切换正确性。

## 工具运行是一段有状态的过程

`SessionTools` 为工具提供 `sessionID`、`messageID`、`callID`、Agent、消息及取消信号。模型给出的参数与宿主注入的执行上下文由不同入口传递。工具通过 `ask` 发起权限询问时，使用合并后的 Agent 与 Session 权限规则；这不是让模型自己填写授权结论。[工具装配](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/tools.ts)

本地工具执行顺序包括执行前插件、工具本体、结果与附件整理、执行后插件。因而插件可能改变参数或结果，它属于运行代码的信任边界。MCP 工具另有适配路径；统一入口减少上层差异，不会替外部服务提供业务事务。

处理器把工具调用记录为 `pending → running → completed/error`。`completeToolCall` 只接受仍处于 `running` 的匹配调用，失败路径保留运行过程中收集的元数据。这让“开始执行”“已有进度”“最终结果”能够分别表达。[工具状态处理](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/opencode/src/session/processor.ts)

取消时尤其容易产生误读。此提交的本地工具适配器在取消信号已发出、工具却仍返回结果时，会尝试主动记录完成结果；处理器清理阶段给尚未结束的调用最多 250 毫秒等待，随后将残余调用记为中断错误。因此不能简单写成“取消后的所有结果都会被丢弃”，也不能承诺“取消后工具绝无副作用”。结果是否赶在清理前记录，是需要面对的竞争边界。

处理器还会记录文件快照与差异，用于保留本地工作变化。这不等于外部系统事务：如果创建工单成功、响应丢失，消息中的中断错误仍不能证明工单不存在。此时应沿操作编号查询，相关契约见[工具输入、结果与错误语义](/writing/harness-engineering-tools/)。

## 新内核的运行协调器提供了什么保证

同一提交的 `packages/core/src/session/run-coordinator.ts` 用内存 Map 为每个 key 保存正在运行的 Fiber、完成信号、待唤醒标志和停止状态。它解决的是同一进程作用域内的运行归属：

| 操作 | 模块行为 | 能减少的问题 |
| --- | --- | --- |
| 对活跃 key 再次 `run` | 等待已有运行完成 | 同一 key 被同时启动多次 |
| 活跃期间多次 `wake` | 合并为待续跑标志 | 每个通知都产生一个重复运行 |
| `interrupt` | 标记停止、清除待续跑并等待 Fiber 中断 | 清理尚未完成就当作已停止 |

本文直接加载该提交的协调器源码，用 Effect 4.0.0-beta.83 执行了三组实验：两个同 key 的 `run` 只调用一次 `drain`；运行期间两次 `wake` 只增加一次后续 `drain`；`interrupt` 返回前本地清理函数已经完成。[协调器源码](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/core/src/session/run-coordinator.ts)

这个结果只证明所测模块的局部行为。Map 和 Fiber 不是跨进程锁，也不是持久队列；实验没有证明所有客户端入口都经过该协调器，更没有模拟进程崩溃。如果需要跨 Worker 恢复，应继续比较 [Temporal 的事件历史与任务重试](/writing/temporal-durable-execution/)。

## 扩展体系的取舍

OpenCode 的扩展不是一个层级：Agent 配置决定执行角色及可用能力，Skill 提供按需加载的方法，项目说明提供持续上下文，Plugin 接入可执行生命周期代码。提示资产和运行代码需要不同的管理方式。[Agent 文档](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/web/src/content/docs/agents.mdx)、[Skill 文档](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/web/src/content/docs/skills.mdx)、[Plugin 文档](https://github.com/anomalyco/opencode/blob/e207624c48159b03dbe17dbc8e51bbcf23e72df5/packages/web/src/content/docs/plugins.mdx)

开放 Provider、工具与插件使同一运行系统能适配更多工作方式，代价是消息变换、权限规则和结果处理存在更多组合。排查失败时，需要保存具体模型、配置、扩展版本及输入变换记录；只知道“使用了 OpenCode”无法重现行为。

对 Mini Harness，本文支持三项设计判断：以持久消息区分事实与输入视图；把旧输出清理和历史摘要分开；为工具终态及运行归属建立显式规则。是否采用整套 OpenCode，则还取决于客户端需求、扩展成本和需要的恢复范围。本文未启动完整应用、未调用真实模型，压缩质量、跨客户端恢复和外部副作用仍未实测。

[源码模块实验包](/labs/context-tool-study.zip)包含固定提交、逐文件哈希、执行脚本与九组实验结果；其中三组对应本篇，另外六组对应 [Kimi Code](/writing/kimi-code-system-overview/)。
