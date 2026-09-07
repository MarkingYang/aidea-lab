---
title: Haystack：RAG 流水线、分支汇合与异步执行
description: 从 Haystack 源码和真实 Pipeline 实验，分析组件契约、DAG 与循环、检索融合、过滤、工具封装和失败收尾。
publishedAt: 2026-09-07
updatedAt: 2026-09-07
type: essay
status: growing
topics:
  - Agent Harness
  - RAG
  - Haystack
  - 工作流
featured: true
readingTime: 14 min
---

<a id="haystack-pipeline-architecture"></a>

Haystack 用组件和连接表达一项任务：输入从哪个入口进入，经过哪些处理，什么时候可以执行下一步。对 RAG 来说，这意味着可以把检索、过滤、排序和提示构建分别检查；对 Agent 来说，一条检索流水线又可以被封装成可调用工具。

它最值得研究的不是“内置了多少组件”，而是组件之间的契约：**有分支不等于已经并发；汇合不一定等待所有分支；流水线失败也不代表所有副作用已经停止。**

本文固定到 [`deepset-ai/haystack@82da3ad`](https://github.com/deepset-ai/haystack/tree/82da3adc2fac4675b80ff5573b790ec07113697b)。该提交的包版本为 **3.2.0rc0**，属于发布候选版本，不代表 2.x 的接口与行为。下文实际运行这一提交安装的 Python 包，共十一组实验；没有调用 LLM、学习型 Embedding 或外部向量数据库。

## 从一条 RAG 主流程看模块分工

设用户询问公司的退款规定。一个可检查的处理过程是：读取允许访问的资料范围，检索候选片段，合并重复候选，重排与裁减，把来源和正文装入提示，最后生成并检查回答。

| 模块 | 输入 | 输出与责任 |
| --- | --- | --- |
| Document Store | 文档、向量、元数据 | 保存可检索资料；具体持久性取决于实现 |
| Retriever | 查询、过滤条件、数量上限 | 带编号与分数的候选 Document |
| Router | 查询类型或上游结果 | 选择本次需要继续的分支 |
| Joiner／Ranker | 一路或多路候选 | 去重、融合或重新排序 |
| Prompt Builder | 问题、选中的证据、模板 | 明确送给模型的文本或消息 |
| Generator | 提示与模型配置 | 模型响应，尚需业务验收 |
| Pipeline | 组件、连接、初始输入 | 驱动数据流、调度与错误收尾 |
| PipelineTool／Agent | 工具输入、对话与状态 | 将固定流程纳入模型驱动的任务循环 |

表中最后一步验收是应用的责任，不能因为 Generator 正常返回就判定答案有据。索引过程与查询过程也应分开：切分、编码、写入决定可被找到的材料；在线检索、融合和装配决定这一次模型真正看到的材料。

本篇重点分析运行与检索连接处。记忆的时间有效性和长期治理另见[记忆检索](/writing/agent-memory-retrieval/)，输入预算另见[上下文组装](/writing/harness-operations-context/)。

## 组件接口：连接时检查什么，运行时等待什么

组件用 `run` 的参数描述输入，用 `@component.output_types` 描述输出。`Pipeline.add_component` 注册实例，`connect("search.documents", "prompt.documents")` 把一个输出插口接到另一个输入插口。

`connect` 检查组件与插口是否存在、连接类型是否兼容。实验把整数输出连到字符串输入，在执行任何组件之前就收到 `PipelineConnectError`。这种校验能及早暴露接线错误，却不能证明字符串是正确答案、Document 属于当前用户，或某个组件真的遵守了业务契约。[连接实现](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/base.py#L587)

运行还需要另一道检查：组件既要收到必要输入，也要得到执行触发。触发可以来自前驱的新输出、首次传入的外部输入，或首次运行时的无前驱入口。来自前驱的输入在消费后被移除，所以一个已经算完的节点不会只因图还在运行就不断自发重算。[输入与触发检查](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/component_checks.py)

这说明图中的边不只是画线，它还决定值如何传递、什么能触发执行。组件只能沿连接取得数据，不能假设每个节点都隐式拥有整份任务历史。

## DAG、条件分支与循环不是同一个概念

DAG 是有向无环图：边表达依赖，但没有路径回到先前节点。一次并行检索再汇合可以构成 DAG；生成、校验、失败后重新生成，则形成有向循环。

Haystack 使用有向多重图表达组件连接，允许循环，所以不能把所有 Haystack Pipeline 都称为 DAG。需要区分三种结构：

| 结构 | 控制问题 | 退出依据 |
| --- | --- | --- |
| 无环流水线 | 哪些输入准备好后可以执行？ | 数据流耗尽或末端完成 |
| 条件分支 | 哪条输出在本次产生值？ | 路由选择与后续执行 |
| 反馈循环 | 什么情况下把结果送回前面？ | 业务条件与运行次数上限 |

`ConditionalRouter` 按声明顺序判断条件，选中符合条件的路由并产生对应输出。未选中的输出没有业务值；调度器用专门标记区分“前驱已经执行但没产生这个输出”和“前驱还没执行”。因此分支不发生，与分支发生但还没返回，不应混成同一种等待。[Router](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/components/routers/conditional_router.py)、[无输出标记](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/component_checks.py)

循环实验用 `BranchJoiner → Increment → ConditionalRouter`：从 0 开始，小于 3 就回流，达到 3 输出完成。第二组把目标改成 99、组件运行上限设为 2，收到 `PipelineMaxComponentRuns`。这验证上限能阻止继续执行，但“被上限终止”不等于“达到业务目标”。生产流程应分别呈现这两种结果。

## 汇合有不同语义，不能都叫 Join

如果同时运行关键词检索和向量检索，通常希望收集两路候选；如果按语言选择一个检索器，则只会有一路结果。两种场景对汇合的要求不同。

**收集式汇合。** `DocumentJoiner` 接收多组 Document；实验中的自定义 Gather 使用 `Variadic[str]` 收集两个独立前驱，结果包含 a、b，且只执行一次。这个场景验证的是两条都活跃的分支，不是承诺任何带循环、缺失输出的图都会等待固定数量结果。

**互斥分支汇合。** `BranchJoiner` 使用 GreedyVariadic 输入，适合路由和循环入口。其 `run` 明确要求本次只有一个值；若收到了多个值会报错。它不是通用的“等大家到齐后合并”组件，也不应被当成随意挑最快结果的并行竞速器。[BranchJoiner 源码](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/components/joiners/branch.py)

在本提交中，多路输出连接到列表型输入还可能触发隐式收集适配。便利的代价是必须检查最终输入语义：同步路径对相关输入有按发送组件名排序的规则，异步路径不保证同样顺序。若融合权重靠列表位置对应某个检索器，就应显式保留来源映射，不能把完成先后当成来源身份。[连接的顺序约定](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/base.py#L587)

## 同步与异步执行：调度器真正控制什么

此版本统一使用 `Pipeline`，提供 `run`、`run_async`、`run_async_generator` 等入口。同步 `run` 逐个执行组件；异步入口才会在依赖允许时并发，`concurrency_limit` 限制同时执行的组件数量。[执行入口](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/pipeline.py)

调度不是简单地对所有节点做 `gather`。它区分：

- **BLOCKED**：必要输入或触发尚不满足。
- **READY**：前驱状态已满足，可以调度。
- **DEFER**：已能运行，但可能还有输入，应让更就绪的组件先执行。
- **HIGHEST**：贪婪输入等特殊情形；异步路径先等待在途任务结束，再单独执行该组件。

这些规则解释了为什么增加并发上限未必让每一步都更快。依赖、特殊汇合和有限任务数量都可能限制实际并行。[优先级计算](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/base.py#L1403)、[隔离执行路径](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/pipeline.py#L658)

用两个带短等待的确定性组件进行实验：

| 入口 | 并发上限 | 实际活跃组件峰值 | 汇合结果 |
| --- | --- | --- | --- |
| `run` | 不适用 | 1 | a、b，一次汇合 |
| `run_async` | 2 | 2 | a、b，一次汇合 |
| `run_async` | 1 | 1 | a、b，一次汇合 |

实验记录活跃计数，不用耗时推测并发，也不宣称真实检索吞吐提升。它与 [LangGraph 的超级步](/writing/langgraph-runtime-architecture/)属于不同调度模型：不能把每次异步组件完成，直接套成一个全图同步屏障。

## 检索融合：为何不能直接比较不同来源的分数

Retriever 返回 Document 列表，Joiner 决定如何合并。该提交提供四类策略：

| 模式 | 主要动作 | 使用前需要成立的条件 |
| --- | --- | --- |
| concatenate | 按 Document ID 去重，重复项保留较高分 | 原分数可比较，或应用另行排序 |
| merge | 按权重汇总分数 | 分数量纲、权重与来源对应关系经过验证 |
| reciprocal_rank_fusion | 根据各列表中的名次融合 | 输入列表已经按本路相关性排序 |
| distribution_based_rank_fusion | 根据各路分数分布缩放后合并 | 分布与退化情况适合当前任务 |

注意 `concatenate` 并不只是原样拼接。默认还会按分数排序；重复文档按 ID 判断，同一内容如果拥有不同 ID 不会因此自动去重。[DocumentJoiner](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/components/joiners/document_joiner.py)

实验准备两路固定排名：第一路 a=100、b=90；第二路 b=0.9、c=0.8。concatenate 得到 a、b、c；RRF 得到 b、a、c。原因不是 RRF 知道 b 更正确，而是 b 在两路都排名靠前，融合使用了跨来源的一致性信号。

RRF 的核心是给较靠前名次更高贡献，再把同 ID 文档的贡献累加；本实现用零起始 rank 和常数 61，并做权重与分数归一化。它避开了直接相加 100 与 0.9 的量纲问题，但仍可能被多路共同偏差影响。[融合公式实现](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/utils/misc.py#L156)

本实验没有运行向量检索或 Rerank 模型，因而只能解释融合行为。是否提高召回率和最终答案质量，还要用真实任务集比较。

## 过滤条件的合并，不等于权限交集

`InMemoryBM25Retriever` 支持初始化与运行时过滤条件，默认 `FilterPolicy.REPLACE` 让运行时条件替换初始化条件。更容易误解的是 `MERGE`：同字段冲突时也可能以运行时值覆盖初始化值，它不等同于对两套条件无条件取逻辑 AND。[检索器](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/components/retrievers/in_memory/bm25_retriever.py)、[过滤策略](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/document_stores/types/filter_policy.py)

实验保存租户 A、B 各一条退款规定，初始化条件为 `tenant=A`，运行时传入同字段的 `tenant=B`：

| 构造方式 | 实际返回 |
| --- | --- |
| REPLACE | B 的文档 |
| MERGE，同字段冲突 | B 的文档 |
| 显式构造 `tenant=A AND tenant=B` | 空列表 |

这不是框架鉴权测试，也不能据此推断部署中的应用存在越权；它证明的是查询配置语义。若把租户范围当成不可修改的权限约束，应由可信服务端取得身份、构建最终查询，并限制调用者能修改的字段。不能仅将某个初始 filter 设为 A，就假定后续输入无法改变它。

## Pipeline 如何成为 Agent 的一项能力

本地 RAG 实验实际连接了 `InMemoryBM25Retriever → PromptBuilder`，模板保留 Document ID 和正文。查询退款规定时只送入固定允许范围中的文档。然后用 `PipelineTool` 将一个 `query` 映射到检索器与模板的查询输入，把模板输出映射为 `context`。

```text
工具输入：query
内部执行：限定范围检索 → 带来源编号的上下文
工具输出：context
```

实验检查生成的工具 Schema 仅暴露 `query`，调用后得到包含 `[allowed]` 的资料文本；没有暴露可覆盖过滤条件的工具参数，也没有让模型生成答案。这验证的是“可调用检索能力”的连接，而不是 Agent 已正确使用证据。[PipelineTool](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/tools/pipeline_tool.py)

Haystack 的 Agent 另有消息、State、工具与循环步数。源码区分正常文本退出、工具退出、输出不完整以及达到步数上限，并返回 `exit_reason`。固定检索流程可以由外层 Agent 按需调用；外层再根据结果决定继续查询、回答或交给用户处理。[Agent 源码](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/components/agents/agent.py)

这里形成两种控制权：**Pipeline 明确内部的数据路径，Agent 决定何时调用这项能力。** 适合固定的检索、解析、验证步骤可以留在流水线里，不必把每个微小步骤都交给模型重新选择。本篇未运行 Agent 的真实模型循环。

## 失败、取消与恢复要分别看

异步路径有错误收尾：组件抛错时，取消并等待其他在途 asyncio 任务，避免把仍活跃的任务留在当前运行中。但原生异步组件与在线程中执行的同步组件，停止能力不同。

第一组实验让原生异步组件等待，另一个组件报错。流水线向调用者返回错误之前，等待组件的清理函数已经完成。第二组把同步组件派发到线程，用门闩控制它何时完成；流水线已返回错误后，再放开门闩，它仍完成了本地状态写入。[取消与清理](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/pipeline.py#L633)

这解释了一个常见误判：取消的是等待线程结果的异步任务，并不能强行中断正在运行的线程。若线程中是外部写入，需要工具自己的超时、幂等与对账；丢弃输出不会撤销副作用。

恢复还需区分配置与运行状态。`Pipeline.to_dict` 保存组件、连接、元数据与运行上限；它不是某次执行的完整现场。Haystack 另有断点与 PipelineSnapshot 机制，记录运行状态并校验恢复目标。此提交默认关闭快照文件保存，也允许自定义保存回调，不能仅看到 snapshot API 就假定已经持久落盘。[配置序列化](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/base.py#L153)、[快照实现](https://github.com/deepset-ai/haystack/blob/82da3adc2fac4675b80ff5573b790ec07113697b/haystack/core/pipeline/breakpoint.py)

本篇没有做进程崩溃与快照续跑实验。跨 Worker 持久执行应与 [Temporal](/writing/temporal-durable-execution/)按相同故障场景比较，不能把“能序列化图”“能保存断点”“能自动接管任务”当成同一个能力。

## 适用条件与需要补建的部分

Haystack 适合拿来构建输入输出明确、检索与生成步骤可复用的流程，并将它们封装为 Agent 能力。组件契约和显式连接让定位遗漏更容易：资料没进入存储、检索未召回、融合丢弃、模板未注入和模型未正确使用，可以沿不同阶段调查。

采用前仍需明确四件事：融合分数与来源对应是否可靠；过滤是否保留可信权限约束；同步工具取消后怎样处理结果未知；状态如何真正保存并恢复。多一条连接、多一个并发任务或多一种融合策略，都要有对应任务证据。

[源码与实验包](/labs/haystack-source-study.zip)包含固定提交与文件哈希、依赖版本、十一组实验代码和结果。实验使用真实 Haystack Pipeline、BM25 检索器、Joiner、Router、PromptBuilder 和 PipelineTool；分支等待、计数与故障由确定性组件提供。它不证明 RAG 准确率、真实模型质量、向量库性能或跨进程恢复能力。
