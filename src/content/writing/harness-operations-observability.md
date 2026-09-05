---
title: Harness 运行与演进（三）：沿着一条失败任务，把故障定位到边界
description: 用任务、操作与 Trace 的关联关系诊断模型、工具、队列和验收故障，明确异步链路、采样偏差与敏感内容的记录边界。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Harness
  - AI 工程
  - LLMOps
featured: false
readingTime: 8 min
---

> Harness 运行与演进系列：[1. 全景与上下文](/writing/harness-operations-context/)｜[2. 规划与验证](/writing/harness-operations-planning/)｜[3. 观测与诊断](/writing/harness-operations-observability/)｜[4. 多 Agent 协作](/writing/harness-operations-multi-agent/)｜[5. 模型网关](/writing/harness-operations-model-gateway/)｜[6. 生产调度](/writing/harness-operations-production/)｜[7. 发布与演化](/writing/harness-operations-release/)

用户说“资料核验卡住了”，运维看见模型接口正常，开发看见工具没有报错。这两项信息都可能真实：任务也许还在队列里，也许等待审批，也许已经完成写入却迟迟没进入验收。

可观测性的首要目标，是让这些情况可以区分。安装一个漂亮的 Trace 平台只是开始，还要让同一任务经过的模块保留可以连接的标识与状态。

## 三类标识承担不同职责

| 标识 | 生命周期 | 用途 |
| --- | --- | --- |
| task / run ID | 一个业务任务或执行实例 | 串起多轮处理和恢复 |
| operation ID | 一次逻辑副作用及其重试 | 去重、对账与资源追溯 |
| trace / span ID | 一次被观测的调用链及步骤 | 诊断时延、错误与因果关联 |

同一 Run 可以跨多个 Trace，同一 Operation 可以跨多个网络尝试。Trace 被采样丢弃时，操作键仍然必须保留在持久记录中。反过来，拥有操作键也不意味着能看清这次请求为什么慢。

不要把所有标识塞进指标标签。任务编号、资料 URL 和用户编号通常具有高基数，更适合受控日志或 Span 属性；指标可以按模型路由、工具类型、错误类别和发布版本等有界维度聚合。

## 从用户等待时间拆出真实时间线

一条任务的耗时可以包含排队、上下文准备、模型请求、工具执行、人工等待和验收。应分别记录，让“模型响应慢”不再成为所有延迟的默认解释。

下面是一份虚构时间线，仅用于说明计量口径：

| 阶段 | 时间区间 | 耗时 |
| --- | --- | --- |
| 排队 | 0—2 秒 | 2 秒 |
| 准备上下文 | 2—3 秒 | 1 秒 |
| 并行核验 A | 3—6 秒 | 3 秒 |
| 并行核验 B | 3—8 秒 | 5 秒 |
| 汇总与验收 | 8—10 秒 | 2 秒 |

端到端时间是 10 秒，不是各段相加的 13 秒。并行阶段应看关键路径和汇总等待；费用则需要统计两条分支实际消耗。用户等待时间与算力消耗不能共用一个总时长。

任务需要人工补充时，可以同时报告“用户经历的总时长”和“系统活跃处理时长”，但必须固定各自分母和暂停规则，不能通过把慢步骤标成等待来美化指标。

## 异步任务需要显式关联

同步调用通常通过父子 Span 表达。经过消息队列、跨天恢复或异步子任务时，可以依据实际因果关系选择继续上下文或建立关联，而不是强行维持一个无限长的父 Span。

OpenTelemetry 的 Span Links 可以关联不同调用链中的相关工作，适合表达某些异步关系。需要同时保留业务 Run ID，才能从用户任务找到不同执行片段。[OTel Traces 文档](https://opentelemetry.io/docs/concepts/signals/traces/)

```mermaid
flowchart LR
  A[提交任务 Trace] --> B[队列与持久任务编号]
  B --> C[Worker 执行 Trace]
  C --> D[外部操作编号]
  D --> E[恢复与验收 Trace]
```

*图 1｜业务标识连接跨时间的运行片段。箭头表示关联关系，不代表所有节点必须共享同一个 Trace。*

埋点 SDK 和 GenAI 语义字段也需要版本管理。不要假设某个示例里的字段会永久稳定；升级时核对所用约定的版本、稳定性和后端映射。[OTel GenAI 字段注册表](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)

## 用分层问题定位失败

先查询可信任务状态：尚未领取、等待输入、派发中、验收中还是终态。再沿发生问题的阶段检查证据。

| 观察到的问题 | 优先核对 |
| --- | --- |
| 一直没开始 | 入队是否成功、租户配额、Worker 领取记录 |
| 检索后答错 | 来源版本、上下文装配清单、冲突是否被省略 |
| 工具超时 | 操作键、下游状态、是否需要对账 |
| 每步都成功，任务却失败 | 目标版本、跨步骤依赖、独立验收结果 |
| 恢复后重复创建 | 操作键是否变化、去重留存是否过期 |

模型生成的解释可以作为调查线索，但不是内部原因的可靠证明。显式计划、实际工具参数和可读取的资源终态通常比一段自述更容易核查。

## 采样决定了你能看到什么

头部采样在请求早期决定是否保留，无法预知后续所有错误。尾部采样可依据更完整的链路选择错误或慢请求，但需要缓存和处理资源；它也无法找回上游已经丢弃的数据。[OTel Sampling 文档](https://opentelemetry.io/docs/concepts/sampling/)

如果优先保存失败 Trace，直接用这批 Trace 计算任务成功率就会产生偏差。业务指标应来自定义清楚的完整任务账本或适当设计的统计样本；诊断样本负责解释，不负责假装代表全部流量。

记录模型输入也要控制范围。可默认保留来源引用、摘要和配置标识，将必要原文放在受控存储；是否保存敏感正文应由具体业务与授权要求决定。日志、制品和缓存都需要自己的访问与留存规则。

## 本篇交付物：十分钟诊断路径

选择上一组[故障实验](/writing/harness-engineering-lab/)的“写入后中断”场景，画出从 Run 到 Operation，再到实际工单的查询路径。接入真实观测平台时，补上 Trace 和故障分类，但保留独立账本。

在[工作簿](/labs/harness-operations-workbook.md)中写清三件事：一线人员先看哪里，什么证据允许安全重试，什么情况下应交给对账负责人。诊断完成后，把最小失败条件加入[回归系统](/writing/agent-evaluation-engineering/)。


---

上一篇：[规划与验证](/writing/harness-operations-planning/)。

下一篇：[多 Agent 协作](/writing/harness-operations-multi-agent/)。
