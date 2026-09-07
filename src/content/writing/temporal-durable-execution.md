---
title: Temporal：事件历史、持久执行、任务调度与取消
description: 以 Temporal Python SDK 源码为入口，追踪 Workflow、Activity、Worker 和事件历史的协作，用更换 Worker、写入重试和历史重放实验解释长任务的恢复边界。
publishedAt: 2026-09-07
updatedAt: 2026-09-07
type: essay
status: growing
topics:
  - Agent Harness
  - 开源架构
  - Temporal
  - 持久执行
featured: false
readingTime: 11 min
---

一个 Agent 已经完成资料核验，正在等用户批准。此时关闭 Worker，明天换一个 Worker，任务应继续等待或处理批准，不能重新解释资料、重新生成一份不同的提案。

Temporal 把这类任务表达为持久 Workflow：Worker 可以更换，运行进度由服务端事件历史支持恢复。模型、HTTP 请求和业务写入放进 Activity；Workflow 组织先后、分支、等待与取消。这使它适合作为 Harness 的执行基础设施，但它本身没有替你定义上下文、工具权限和成果验收。

本文以开源仓库 `temporalio/sdk-python` 的提交 `22a9e41fd857261ee0a9bb5ce57f439d93e7f88d` 为入口，核对日期为 2026-09-07。源码与实验包版本均为 1.32.0；实验使用发布包，不是从该提交自行编译。服务端职责参照官方文档，未审计 Temporal Server 的存储与分片实现。[Workflow 官方说明](https://docs.temporal.io/workflows)

## 架构：把业务执行与运行历史分开

| 对象 | 保存或处理什么 | 在 Agent 任务中的例子 |
| --- | --- | --- |
| Client | 发起运行、发送 Signal、查询和请求取消 | 用户提交核验任务、批准提案 |
| Temporal Service | 运行历史、任务交付、定时器等服务端状态 | 保存已完成读取、批准信号与写入结果 |
| Task Queue | 连接待执行工作与有能力处理它的 Worker | 将模型请求、业务写入分给对应执行者 |
| Worker | 轮询任务并执行注册的 Workflow / Activity | 加载工作流代码，调用模型或工单接口 |
| Workflow | 确定性的控制逻辑和可重建的局部状态 | 读取资料后等待批准，再执行写入 |
| Activity | 可能耗时、失败、重试的外部工作 | 检索、模型生成、文件处理、创建工单 |

这里最容易混淆的是两种任务：**Workflow Task 推进控制逻辑；Activity Task 执行实际工作。** 等待批准不是让一个 Activity 每隔一秒查询一次用户是否回复，而是让 Workflow 在可持久恢复的等待点挂起。

Worker 可以缓存 Workflow 实例以减少重放；因此等待不等于所有内存立即清零。关键是恢复不以某个 Python 对象永久活着为前提。

## 沿 Python SDK 看一次执行如何推进

固定一个教学任务：读取证据 → 等待批准 → 写入结果。

1. Client 启动 Workflow。Worker 接收与本次运行有关的 activation，Python 层将其中的事件交给工作流实例处理。
2. Workflow 调用 `execute_activity()`。内部 `workflow_start_activity()` 构造包含参数、队列、超时和重试策略的 `StartActivityInput`，经调用拦截链转成调度命令。
3. Activity 在执行它的 Worker 中调用外部系统，结果由服务处理并进入相应运行历史。
4. Python 层收到 Activity 完成通知时，`_apply_resolve_activity()` 找到对应 handle，解码结果并完成 Future；等待该结果的 Workflow 可以继续。
5. `workflow.wait_condition()` 注册条件与 Future。批准 Signal 改变工作流状态后，自定义事件循环重新检查条件，唤醒后续控制逻辑。
6. 写入 Activity 完成，Workflow 返回结果并结束。

`_run_once()` 的核心是处理就绪回调和等待条件。它解释了为什么看上去是普通 `async/await` 的代码，能够在历史驱动下继续；它不是直接把整个 Python 进程保存成镜像。[工作流实例源码](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/temporalio/worker/_workflow_instance.py)

对于 Harness，Activity 的粒度决定恢复粒度。如果把一小时的模型—工具循环全部装进一个 Activity，服务端并不会自动获得循环内部每一步的独立恢复点。把模型调用、审核和不可逆写入拆出稳定边界，能够缩小重试范围；拆得过细则增加事件、序列化与调度成本。业务上需要单独确认的结果，通常值得成为明确边界。

## 历史重放为何不等于重做所有操作

恢复 Workflow 时，工作流逻辑可能从头重新执行。已经记录在历史中的 Activity 结果会用于重建后续控制状态；正常匹配的重放不会再次执行这些已完成 Activity 的外部函数。

这要求 Workflow **确定性地重建与历史兼容的命令序列**。如果恢复时重新调用模型，模型可能给出另一条路径；读取当前时间、随机数或网络数据也可能改变分支。因此这类外部工作应放进 Activity，时间与等待使用 Workflow 提供的机制。

Python SDK 使用自定义 asyncio 事件循环，并限制 Workflow 内部的线程、网络、子进程等操作；部分 asyncio 工具有对应的确定性版本，例如 `workflow.wait()`。[SDK 的确定性说明](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/README.md#asyncio-and-determinism)

需要分别检查三种“再次执行”：

| 情况 | 再次发生什么 | 主要保护机制 |
| --- | --- | --- |
| Worker 更换、缓存丢失 | Workflow 逻辑重放历史 | 确定性与历史兼容 |
| Activity 失败或超时 | Activity 可能重新执行外部函数 | 重试策略、幂等、结果查询 |
| 用户重新提交一次任务 | 可能启动新的业务运行 | 业务任务身份与重复请求策略 |

稳定的 Workflow ID 不会自动让业务 API 具备幂等语义。Activity 的技术身份也不一定就是业务去重键：同一业务动作可能跨运行重试，而同一个工作流里也可能合法创建多个资源。键应来自业务意图与动作版本，保持“同一动作使用同一键，不同动作不误合并”。

## 实验：更换 Worker、重复写入与离线重放

本轮使用 Python 3.12.13、Temporal SDK 1.32.0、本地 CLI 1.8.3 / Server 1.31.2，运行了下列流程。所有输入都是固定教学数据，没有调用模型和真实业务 API。

1. Worker A 执行读取 Activity，得到 `verified-A`，然后 Workflow 等待批准。
2. 退出 Worker A；服务端继续运行。启动新的 Worker 对象 B，发送批准 Signal。
3. 写入 Activity 先向 SQLite 提交结果，然后人为抛出“响应丢失”异常。
4. 配置的重试再次进入写入函数；数据库利用业务操作键的唯一约束保留一条结果。
5. Workflow 完成后，读取事件历史，交给 `Replayer` 离线重放；检查 Activity 调用计数是否改变。

| 观察项 | 实际结果 | 解释 |
| --- | --- | --- |
| 读取 Activity 调用次数 | 1 | 更换 Worker 后没有重做已完成读取 |
| 写入 Activity 调用次数 | 2 | 提交后异常仍然会触发重试 |
| 业务数据库结果行数 | 1 | 去重来自 SQLite 唯一键与写入策略 |
| 历史事件数 | 21 | 这是本次运行记录，不是固定规格 |
| 离线重放后 Activity 调用计数 | 保持不变 | 重建控制流程没有执行外部函数 |

这里 `INSERT OR IGNORE` 只适用于本例固定且不变的值。真实接口还要比较同键参数是否一致，拒绝“同一个键换了内容”的请求，并回读确认结果，见[故障恢复与对账](/writing/harness-engineering-recovery/)。

实验包保留[完整脚本、历史与结果](/labs/harness-source-study.zip)。服务端使用内存后端并始终存活；验证的是更换 Worker 对象，没有验证服务端宕机、跨主机故障转移或数据库恢复。教学模块使用 `UnsandboxedWorkflowRunner` 简化导入，不能据此宣称已验证生产工作流的确定性约束。离线重放实现见 [Replayer 源码](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/temporalio/worker/_replayer.py)。

## 调度：依赖满足、存在容量、允许执行是三件事

DAG 或 Workflow 决定某一步是否满足前置条件，Task Queue 决定由哪些 Worker 接收，Worker 的容量配置决定此刻能处理多少工作。

SDK 的 `FixedSizeSlotSupplier` 提供固定数量的槽位；`ResourceBasedSlotSupplier` 根据 CPU、内存目标等配置管理容量。Workflow、Activity 与 Local Activity 有不同的槽位类型。它们回答“执行者还能接多少工作”，不自动回答“某租户剩下多少模型费用”。[容量调节源码](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/temporalio/worker/_tuning.py)

例如同时存在 20 个待调用模型的 Activity，而供应商只允许一定请求速率：增加 Worker 可以提高本地容量，却可能更快撞上外部限流。模型速率、任务预算、租户额度仍需要相应的共享约束。审批许可则属于另一条业务检查，不能用“任务已经入队”替代。

超时也应按等待位置设置：

| 参数 | 衡量什么 | 用途 |
| --- | --- | --- |
| `schedule_to_start_timeout` | 从入队到开始执行的等待 | 识别无可用 Worker 或排队过久 |
| `start_to_close_timeout` | 单次 Activity 尝试的运行时间 | 限制一次外部调用卡住的时间 |
| `schedule_to_close_timeout` | Activity 从调度到结束的总时间，包含重试 | 限制整个操作的等待预算 |
| `heartbeat_timeout` | 两次心跳之间允许的间隔 | 检测长时间执行者失联，并传递取消 |

这是配置语义分析，未进行多租户调度或压力测试。站点已有[队列、租约与背压](/writing/harness-operations-production/)讨论应用层的资源归属；不能仅凭 SDK 参数齐全就认定系统已经实现全局公平调度。

## 取消与子任务：发出请求不等于外部世界已经停止

取消 Workflow 会向主工作流任务提出取消请求。取消 Activity、子 Workflow 或定时器有各自的策略；Python 代码也可能捕获取消异常进行清理。

长时间运行的非 Local Activity 需要配置心跳超时并持续 heartbeat，才能通过这条机制收到取消请求。心跳还能记录进度供后续重试读取，但它不自动撤销已经发生的业务写入。[心跳与取消说明](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/README.md#heartbeating-and-cancellation)

子 Workflow 有独立生命周期。父运行关闭时，`ParentClosePolicy` 可以选择终止、请求取消或放任子运行继续；它与主动取消某个子任务 handle 是不同控制入口。不能把“取消启动子任务的协程”当作“取消已经启动的子任务”。[子工作流接口](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/temporalio/workflow/_workflow_ops.py)

设计 Agent 委派时，应先定四件事：谁拥有子任务、父任务取消后它能否继续、预算由谁承担、已产生的成果如何归属。这些业务规则确定后，再选择取消和父关闭策略。子任务与取消的本节结论来自源码与官方说明，本轮未运行故障实验。

## 版本、扩展与采用成本

持久任务会跨代码版本存活。部署一段在旧 Activity 之前插入新操作的工作流代码，可能与已有历史不匹配。SDK 提供 `patched()` 等兼容机制；`continue_as_new()` 可以结束当前运行并携带所需状态进入新运行。使用前需要明确旧历史如何重放、哪些状态必须传递，不能将它们理解为任意代码都能无痛升级。[兼容标记接口](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/temporalio/workflow/_context.py)

扩展边界主要是 Activity、数据转换器和拦截器：Activity 承接模型与工具，转换器负责参数与结果编码，拦截器可插入调用观测等行为。业务载荷仍需考虑大小、敏感信息与兼容；把大型文件放进外部制品存储、历史中记录引用，是应用设计选择，需要同时保证引用可用和访问权限。

特别要区分两种沙箱：Temporal Python Workflow sandbox 用于帮助发现不确定性和状态共享问题，官方明确说明它不是安全隔离。它不能用来运行不可信 Shell；这属于[执行安全](/writing/harness-engineering-security/)与 [OpenHands 工作空间](/writing/openhands-sdk-architecture/)讨论的边界。[Sandbox 限制](https://github.com/temporalio/sdk-python/blob/22a9e41fd857261ee0a9bb5ce57f439d93e7f88d/README.md#sandbox-is-not-secure)

若任务需要跨 Worker、跨长时间等待，并且团队愿意维护服务、历史与代码兼容，Temporal 提供了明确的持久控制模型。短交互循环则未必需要这些运行成本。[LangGraph](/writing/langgraph-runtime-architecture/)更直接暴露图状态与节点更新；两者可以组合，但必须约定每层的重试范围，避免外层重试整段图、内层又重试每个工具而放大调用。具体采用条件应回到[架构选型实验](/writing/harness-architecture-selection/)。
