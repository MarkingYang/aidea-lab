# 文章边界与目录

每行是一篇文章。目录分组只提供浏览入口，不是合并单位。截至 2026-09-07，本地共 63 篇，含 LiteLLM、OPA 及本轮新增的 Prompt Engineering、RAG、Agent Runtime。篇数记录当前内容，不是最终配额；当前仍按 8 个目录方向展示，三类归属评审待迁移。

## Harness

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [Harness：Agent 架构](../../src/content/writing/prompt-context-harness-engineering.md) | 知识问题 | Harness 把模型提案接到真实执行与验收上。用一次购物车修复区分 Prompt、Context 与运行时，再确定模块交换的任务、动作、结果与证据。 |
| [Loop Engineering 与 Graph Engineering：循环与图编排](../../src/content/writing/harness-engineering-loop.md) | 知识问题 | 循环管理下一次行动，执行图管理任务之间的依赖。用状态、进展、停止条件和汇合规则判断何时需要增加编排，避免把模型的计划文本直接当作执行状态。 |
| [Prompt Engineering：提示词工程](../../src/content/writing/prompt-engineering.md) | 知识问题 | 任务契约、示例、输出校验、提示链与版本评测；设计案例未运行真实模型对照。 |
| [RAG：检索增强生成](../../src/content/writing/rag.md) | 知识问题 | 入库、切分、召回、融合、重排、装配与答案核验；区分权限、时效与相关性。 |
| [Agent Runtime：Agent 运行时](../../src/content/writing/agent-runtime.md) | 知识问题 | 任务与动作身份、模块协作、状态迁移、事件视图、执行恢复与取消收尾。 |
| [Claude Code：执行循环、记忆与扩展机制](../../src/content/writing/claude-code-internals-overview.md) | 项目研究 | 沿执行循环、工具证据、项目规则、自动记忆和扩展机制，理解 Claude Code 的职责与公开可验证边界。 |
| [Codex：运行时、沙箱与持续任务](../../src/content/writing/codex-system-overview.md) | 项目研究 | 连接 Codex 本地运行时、执行沙箱、任务证据、Skills 和自动化，区分开源内核与应用协作层。 |
| [Kimi Code：上下文投影、压缩边界与工具执行](../../src/content/writing/kimi-code-system-overview.md) | 项目研究 | 固定 TypeScript 内核提交，分析消息配对、压缩切点、批次执行与委派；六组模块实验验证关键边界。 |
| [OpenCode：会话运行、上下文压缩与工具状态](../../src/content/writing/opencode-system-overview.md) | 项目研究 | 沿会话路径分析两级压缩、工具终态与扩展；单独验证 core 协调器的合流、唤醒与中断。 |
| [DeepSeek Harness：插件生命周期、事件日志与执行契约](../../src/content/writing/deepseek-harness-composition.md) | 项目研究 | DeepSeek Harness 把运行能力拆成可组合插件，把模型输入与执行事实记录为事件。沿一次“修复登录超时、不部署”的任务，依次分析组件如何出现和退出、状态怎样恢复、动作如何受约束，以及这些设计把复杂度放到了哪里。 |
| [Hermes：运行内核、常驻服务与跨会话学习](../../src/content/writing/hermes-agent-architecture-deep-dive.md) | 项目研究 | Hermes 的设计中心是持续工作：任务从不同入口进入，执行结果需要交付，经验又会影响未来任务。本文把 Loop、Gateway、Session、Memory 与 Skills 放在同一条运行链上，分析各自的状态所有权和失败边界。 |
| [Pi：最小内核、Session 事件树与扩展边界](../../src/content/writing/pi-architecture-deep-dive.md) | 项目研究 | Pi 以模型协议、通用循环、AgentSession 和展示入口分离职责。本文从一次输入走到工具执行和历史恢复，解释最小内核为何仍需要严格事件语义，并单独检查实验性 durable 路径。 |
| [LangChain：模型、工具、中间件与 Agent 装配](../../src/content/writing/langchain-agent-architecture.md) | 项目研究 | LangChain 的分析对象是高层 Agent 构建接口：模型、工具、消息和行为扩展如何接成一条循环。以下沿用 2026-09-05 核对的官方 Python 文档，以查错码的知识库助手说明装配方式和应用仍需承担的责任。 |
| [LangGraph：DAG、超级步、状态合并与持久恢复](../../src/content/writing/langgraph-runtime-architecture.md) | 项目研究 | 固定源码提交，追踪编译、通道、超级步和检查点；用不等长分支、Send 与新进程恢复实验验证语义。 |
| [Temporal：事件历史、持久执行、任务调度与取消](../../src/content/writing/temporal-durable-execution.md) | 项目研究 | 以 Python SDK 为入口，分析 Workflow、Activity、Worker、调度与取消；验证更换 Worker、写入重试与历史重放。 |
| [Haystack：RAG 流水线、分支汇合与异步执行](../../src/content/writing/haystack-pipeline-architecture.md) | 项目研究 | 固定 3.2.0rc0 提交，以十一组真实 Pipeline 实验分析连接、调度、检索融合、过滤与取消。 |
| [OpenHands SDK：执行循环、事件状态、并行工具与工作空间](../../src/content/writing/openhands-sdk-architecture.md) | 项目研究 | 固定 Software Agent SDK 源码，研究运行、事件与视图、资源锁、终端和环境生命周期；未运行完整 SDK 或容器实验。 |
| [Anthropic Skills：规范、渐进加载与文档管线](../../src/content/writing/anthropic-skills-overview.md) | 项目研究 | 从 Skill 规范和资源组织进入渐进加载与文档管线，说明触发、执行和资产分发各自的约束。 |
| [Addy Skills：工程生命周期与验证门槛](../../src/content/writing/addy-agent-skills-overview.md) | 项目研究 | 沿研发生命周期组织可触发的 Skills，把需求、实现、验证与反馈接成具有证据门槛的工程流程。 |
| [Matt Pocock Skills：需求对齐与反馈循环](../../src/content/writing/mattpocock-skills-overview.md) | 项目研究 | 从需求和共享语言的对齐进入测试与反馈循环，理解小型 Skills 怎样减少误解和修改风险。 |
| [ECC：跨 Harness 资产、安装器、Hooks 与经验治理](../../src/content/writing/ecc-architecture-deep-dive.md) | 项目研究 | ECC 管理 Skills、Rules、Hooks 与安装策略，模型和工具主循环由宿主执行。顺着“共享资产—安装计划—平台适配—事件检查—经验更新”分析它的工程内核，最后区分已实现能力与 ECC 2.0 Alpha。 |
| [Mini Harness：模块装配与可恢复执行](../../src/content/writing/harness-integration-map.md) | 实现实战 | 用本地工单任务装配模型适配器、MCP 工具、SQLite 状态和独立验收器。各模块按同一个任务契约接线；固定响应实验验证控制与恢复，不代表已经验证真实模型的任务能力。 |

## 模型

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [模型能力边界：从公开评测到任务责任](../../src/content/writing/llm-agent-capability-landscape-2026.md) | 知识问题 | 从任务责任、交付验收与模型差异出发，建立一张不依赖总榜单的 AI 能力地图。 |
| [LLM Gateway：模型网关](../../src/content/writing/harness-operations-model-gateway.md) | 知识问题 | 用能力、协议、数据范围和预算约束模型路由，区分重试、降级与业务恢复，并按成功任务核算真实成本。 |
| [LiteLLM：模型路由、故障转移与预算边界](../../src/content/writing/litellm-gateway-architecture.md) | 项目研究 | 固定 v1.100.0，沿别名与部署、选择与权重、重试与备用组、流式输出、冷却及跨实例预算，解释网关边界；八组受控 Router／缓存实验与源码分析分别标明。 |

## 技术架构

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [工具契约：输入、结果与错误语义](../../src/content/writing/harness-engineering-tools.md) | 知识问题 | 在能力路由之后补齐工具接口工程，用输入、结果、错误、权限和幂等契约，让执行层保留真实业务语义。 |
| [MCP 生命周期：握手、目录、断线与取消](../../src/content/writing/harness-foundations-mcp-lifecycle.md) | 知识问题 | 固定 MCP 2025-11-25 版本，梳理初始化、能力协商、请求关联与工具目录失效，并区分协议错误和工具执行错误。 |
| [执行安全：身份、授权、审批与沙箱](../../src/content/writing/harness-engineering-security.md) | 知识问题 | 沿资料、候选动作、审批、凭证和沙箱划分信任边界，说明身份与权限如何贯穿工具执行，以及本地策略实验的验证限制。 |
| [OPA：策略求值、执行边界与授权更新](../../src/content/writing/opa-policy-architecture.md) | 项目研究 | 固定 v1.20.2，研究 Rego、输入事实、决策结果、审批绑定、Bundle 与日志；十二组真实 CLI／REST 实验区分策略决定、执行责任和更新边界。 |
| [能力路由：从目录检索到可执行方案](../../src/content/writing/capability-routing-at-scale.md) | 知识问题 | 能力路由要把用户意图变成满足输入、身份和执行条件的方案。沿“能力描述—召回—正文精排—执行规划—结果反馈”分析整条链路，分别处理误召回、不可执行和执行失败。 |
| [并发控制：版本冲突、锁与背压](../../src/content/writing/harness-foundations-concurrency.md) | 知识问题 | 从异步、并行、共享状态和背压出发，为 Harness 建立工程基础地图，区分调度效率与数据正确性。 |
| [故障恢复：事务边界、幂等、对账与补偿](../../src/content/writing/harness-engineering-recovery.md) | 知识问题 | 恢复要同时回答“运行到了哪里”和“外部动作是否已发生”。从一次写入的提交边界进入幂等、对账与补偿，再用受控故障实验检查重复、结果未知和恢复证据。 |
| [Context Engineering：上下文工程](../../src/content/writing/harness-operations-context.md) | 知识问题 | 按任务、状态、来源、权限与预算组装单次模型请求，说明压缩、缓存和装配清单怎样影响判断。 |
| [Memory：记忆写入](../../src/content/writing/agent-memory-writing.md) | 知识问题 | 比较追加、合并和分层提炼的写入策略，建立有效时间、来源和纠错契约。 |
| [Memory：记忆检索](../../src/content/writing/agent-memory-retrieval.md) | 知识问题 | 比较混合检索、目录导航与上下文装配，说明授权过滤、时间有效性和预算的不同责任。 |
| [Memory：记忆治理](../../src/content/writing/agent-memory-governance.md) | 知识问题 | 从团队资产、Loadout 与 ACL 到删除传播和评测，检验长期记忆的治理边界。 |
| [Mem0：事实写入、混合检索与部署边界](../../src/content/writing/mem0-series-overview.md) | 项目研究 | Mem0 封装从对话抽取事实、按身份存储并检索的路径。沿 add/search 分析 ADD-only、实体信号、当前性与删除，再检查库和自托管服务分别把什么责任留给应用。 |
| [OpenViking：上下文文件系统、层级检索与一致性](../../src/content/writing/openviking-series-overview.md) | 项目研究 | OpenViking 用 URI 和目录结构组织 Resource、Memory 与 Skill。沿摄取、摘要、检索和 Session 提交分析内容与索引如何协作，以及分层读取增加的刷新、权限和一致性成本。 |
| [TencentDB Agent Memory：协议代理、分层记忆与团队资产](../../src/content/writing/tencentdb-agent-memory-overview.md) | 项目研究 | TencentDB Agent Memory 把记忆接入放在模型协议代理处，再通过分层认识和团队资产进行共享。本文从一次请求的注入与回写走到权限和 Loadout，区分已有 Beta 实现与采用时需要补齐的治理。 |
| [可观测性：任务关联、时间线与故障定位](../../src/content/writing/harness-operations-observability.md) | 知识问题 | 用任务、操作与 Trace 的关联关系诊断模型、工具、队列和验收故障，明确异步链路、采样偏差与敏感内容的记录边界。 |
| [任务服务：队列、租约、隔离令牌与背压](../../src/content/writing/harness-operations-production.md) | 知识问题 | 将队列、租约、陈旧执行者、幂等、背压和多租户配额接到任务生命周期，说明扩容为何必须同时维护执行权与数据边界。 |
| [版本发布：评测门槛、灰度与在途任务回退](../../src/content/writing/harness-operations-release.md) | 知识问题 | 将模型、上下文、工具、策略与状态版本纳入同一发布单元，通过离线回归、隔离回放、灰度和消融决定扩量、回滚或简化。 |

## 产品

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [市场判断：环境、竞争、规模与定位](../../src/content/writing/product-frameworks-market.md) | 产品方法 | 串联 PEST、五力、TAM/SAM/SOM、SWOT 和价值曲线，形成可验证的进入策略。 |
| [需求取舍：用户旅程、优先级与发布范围](../../src/content/writing/product-frameworks-prioritization.md) | 产品方法 | 用 KANO、用户旅程、RICE 和 MoSCoW，把用户证据变成可解释的版本选择。 |
| [增长分析：漏斗诊断与单位经济性](../../src/content/writing/product-frameworks-growth.md) | 产品方法 | 用漏斗与根因假设定位价值断点，再用商业模式与成本口径检验持续性。 |
| [产品复盘：目标、证据与经验复用](../../src/content/writing/product-frameworks-delivery.md) | 产品方法 | 用 OKR、复盘和决策记录，把版本投入转化为可检查的结果与下一轮学习。 |
| [Agent 产品设计：结果契约、自治范围与反馈迭代](../../src/content/writing/product-work-methodology.md) | 产品研究 | Agent 产品需要说明用户委托了什么、系统可以影响什么，以及交付依据是什么。把结果契约、上下文和自治边界接到同一套任务评测中，运行结果才能改变下一轮产品决定。 |
| [Claude Code 产品设计：委托、信任与协作](../../src/content/writing/claude-code-product-design.md) | 产品研究 | 以 Claude Code 为例，沿目标输入、执行反馈、变更验收到并行接管研究完整任务体验。权限、验证界面与 Session/Worktree 各自支持不同决定，产品可用性需要连同状态语义检查。 |
| [AI 交付价值：指标口径、失败成本与人工基线](../../src/content/writing/ai-capability-product-metrics.md) | 产品方法 | 统一成功、失败、人工时间与交付成本口径，通过反例解释模型调用更便宜为何不等于业务交付更便宜。 |
| [编程交付：测试、变更范围与可复验证据](../../src/content/writing/ai-value-coding.md) | 产品方法 | 以登录超时修复为例，定义独立验收、缺陷检出与人工审查成本。 |
| [语音交付：意图消歧、执行状态与结果验收](../../src/content/writing/ai-value-voice.md) | 产品方法 | 从语音链路到设备终态，定义关键实体、时延、打断与重复执行的验收。 |
| [办公交付：数据口径、可编辑文件与来源核验](../../src/content/writing/ai-value-office.md) | 产品方法 | 用月报案例建立范围、数字、来源、编辑性和权限的独立验收链。 |

## 竞品分析

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../../src/content/writing/coding-agent-harness-showdown.md) | 竞品比较 | 从循环、上下文、工具、验证、安全与协作出发，比较三种产品化 Coding Agent 的系统分歧。 |
| [办公 Agent 比较：Kimi Work、WorkBuddy 与豆包工作](../../src/content/writing/china-work-agent-showdown.md) | 竞品比较 | 三款产品的办公入口、工作对象和交付边界不同。先比较公开定位，再用同一份资料与同一个交付契约设计核验，检查文件成果、系统写回和人工接管，避免把演示能力直接写成采用结论。 |
| [记忆系统比较：核心对象与生命周期取舍](../../src/content/writing/agent-memory-design-competitive-analysis.md) | 竞品比较 | 从证据、提炼、演化、检索和治理理解三类开源记忆方案，建立系统骨架。 |

## 技术选型

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [Agent Harness 架构选型：轻量循环、图式编排与持久工作流](../../src/content/writing/harness-architecture-selection.md) | 选型分析 | 用同一资料核验任务比较三种可运行架构，明确模块组合、状态归属、恢复语义、优缺点及迁移条件。 |
| [Multi-Agent 选型：任务拆分、协作拓扑与部署成本](../../src/content/writing/multi-agent-architecture-selection.md) | 选型分析 | 先证明任务需要独立上下文或并行判断，再选择协作拓扑、框架和部署方式。把委派契约、汇合、共享写入、取消与成本放进同一次 PoC，避免把多个 Agent 当成默认升级。 |
| [模型选型：任务样本、重复运行与完整成本](../../src/content/writing/ai-capability-evidence-action.md) | 选型分析 | 沿能力趋势、真实任务与评测证据，判断模型升级是否真正降低交付成本，并形成可重复的选择方法。 |
| [Agent 选型：比较维度、任务契约与 PoC](../../src/content/writing/agent-landscape-comparison-methods.md) | 选型分析 | 按研究对象和任务证据比较 Agent，用明确契约、分项指标和分轮 PoC 形成可复核的采用决定。 |

## 评测与验证

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [可靠性边界：验收、风险与自治范围](../../src/content/writing/ai-agent-reliability-boundaries.md) | 知识问题 | 先搭可靠性地图，分清 Skills、RAG、长任务反馈与权限控制能够解决的问题，以及它们共同留下的验收缺口。 |
| [Agent 评测系统：任务、指标、裁判与持续回归](../../src/content/writing/agent-system-evaluation-research.md) | 知识问题 | 一套评测系统需要稳定的任务契约、样本、裁判和运行记录。沿一次任务从验收到发布的路径，明确成功率、成本和过程诊断各自能支持什么决定，并把失败变成下一次可执行检查。 |
| [TRACE：轨迹评测、代理指标与复现边界](../../src/content/writing/trace-framework-deep-dive.md) | 论文研究 | TRACE 在结果门槛之外研究过程效率、证据支持与恢复。以下保留公式、实验口径及其限制，再讨论哪些思想能转成业务可观测量；TRACE-Lite 是文中提出的改造方案，不是官方生产实现。 |

## 研究与认知

| 文章 | 类型 | 主要论述边界 |
| --- | --- | --- |
| [陆奇谈研究型创业者：研究、创新与组织学习](../../src/content/writing/lu-qi-researcher-founder.md) | 阅读分析 | 陆奇的 Researcher Founder 公开课讨论研究、工程和市场怎样形成反馈。本文先还原演讲观点，再分析研究、创新与斜率如何变成行动，以及组织学习主张的适用边界。 |
