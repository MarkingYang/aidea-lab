# 60 篇文章的三类归属评审

这是迁移建议，尚未修改站点目录、文章 URL 或正文。分类按现有正文的主问题判断；重点审阅不代表完成了所有外部事实复核。

三类是主归属；文章类型与知识标签是筛选维度，不是额外顶层。

## GitHub（技术框架）（43 篇现有内容）

| 文章 | 文章类型 | 调整建议 |
| --- | --- | --- |
| [Harness 架构：职责分层、模块接口与任务闭环](../../src/content/writing/prompt-context-harness-engineering.md) | 知识点深度剖析 | 保留为 Harness 主问题；Prompt／Context 定义用作边界，不把它们视为各自已有完整深析。 |
| [Agent 控制流：循环、规划、分支与汇合](../../src/content/writing/harness-engineering-loop.md) | 知识点深度剖析 | Loop 与 Graph 已有独立章节、状态与汇合反例；保留完整文章，通过知识入口直达章节，优先去重和同步版本。 |
| [Codex：运行时、沙箱与持续任务](../../src/content/writing/codex-system-overview.md) | 项目研究 | 现有正文主动声明公开机制概述；补固定源码、入口到工具调用链、状态和失败路径，App 产品行为单独限定证据。 |
| [Kimi Code：上下文投影、压缩边界与工具执行](../../src/content/writing/kimi-code-system-overview.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [OpenCode：会话运行、上下文压缩与工具状态](../../src/content/writing/opencode-system-overview.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [DeepSeek Harness：插件生命周期、事件日志与执行契约](../../src/content/writing/deepseek-harness-composition.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [Hermes：运行内核、常驻服务与跨会话学习](../../src/content/writing/hermes-agent-architecture-deep-dive.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [Pi：最小内核、Session 事件树与扩展边界](../../src/content/writing/pi-architecture-deep-dive.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [OpenHands SDK：执行循环、事件状态、并行工具与工作空间](../../src/content/writing/openhands-sdk-architecture.md) | 项目研究 | 保留真实 SDK 对象与源码范围；未运行完整 SDK／容器的边界不能降格成脚注。 |
| [LangChain：模型、工具、中间件与 Agent 装配](../../src/content/writing/langchain-agent-architecture.md) | 项目研究 | 明确目前主要是官方文档分析；补固定版本源码与一次完整 Agent 装配路径。 |
| [LangGraph：DAG、超级步、状态合并与持久恢复](../../src/content/writing/langgraph-runtime-architecture.md) | 项目研究 | 保留单项目整篇；Graph 入口引用超级步、Reducer、检查点等章节，不重复抄出项目正文。 |
| [Temporal：事件历史、持久执行、任务调度与取消](../../src/content/writing/temporal-durable-execution.md) | 项目研究 | 保留 SDK／服务边界；持久工作流补充 Runtime 恢复机制，不直接等同完整 Agent Runtime。 |
| [Haystack：RAG 流水线、分支汇合与异步执行](../../src/content/writing/haystack-pipeline-architecture.md) | 项目研究 | 保留单项目整篇；Pipeline 与检索局部实验支持 RAG 机制，不能当作生成答案质量实验。 |
| [Anthropic Skills：规范、渐进加载与文档管线](../../src/content/writing/anthropic-skills-overview.md) | 项目研究 | 仓库资产与宿主执行分开；当前未固定提交，需补代表 Skill 的资源加载／脚本运行证据与许可边界。 |
| [Addy Skills：工程生命周期与验证门槛](../../src/content/writing/addy-agent-skills-overview.md) | 项目研究 | 已有工程阶段思想；补固定提交及一条实际触发—加载—验证链，不以流程表替代源码证据。 |
| [Matt Pocock Skills：需求对齐与反馈循环](../../src/content/writing/mattpocock-skills-overview.md) | 项目研究 | 已有局部反馈思想；补固定提交与一项完整 Skill 的输入、输出和宿主依赖。 |
| [ECC：跨 Harness 资产、安装器、Hooks 与经验治理](../../src/content/writing/ecc-architecture-deep-dive.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [Mini Harness：模块装配与可恢复执行](../../src/content/writing/harness-integration-map.md) | 设计与实现 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [模型网关：能力约束、协议适配与降级语义](../../src/content/writing/harness-operations-model-gateway.md) | 知识点深度剖析 | 从模型栏目迁入技术框架的知识剖析；模型接入基础设施不等于模型本身。 |
| [LiteLLM：模型路由、故障转移与预算边界](../../src/content/writing/litellm-gateway-architecture.md) | 项目研究 | 从模型栏目迁入技术框架项目；保留八组局部实验与未测流式／Proxy 边界。 |
| [工具契约：输入、结果与错误语义](../../src/content/writing/harness-engineering-tools.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [MCP 生命周期：握手、目录、断线与取消](../../src/content/writing/harness-foundations-mcp-lifecycle.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [执行安全：身份、授权、审批与沙箱](../../src/content/writing/harness-engineering-security.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [OPA：策略求值、执行边界与授权更新](../../src/content/writing/opa-policy-architecture.md) | 项目研究 | 纳入技术框架项目；十二组本地实验不能替代真实认证、工具执行或分布式更新验证。 |
| [能力路由：从目录检索到可执行方案](../../src/content/writing/capability-routing-at-scale.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [并发控制：版本冲突、锁与背压](../../src/content/writing/harness-foundations-concurrency.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [故障恢复：事务边界、幂等、对账与补偿](../../src/content/writing/harness-engineering-recovery.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [上下文组装：证据、状态与输入预算](../../src/content/writing/harness-operations-context.md) | 知识点深度剖析 | 已有输入装配与源码反例；补请求级 tokenizer、实际序列化清单、压缩前后信息保留的同题实验。 |
| [记忆写入：历史、当前事实与纠错](../../src/content/writing/agent-memory-writing.md) | 知识点深度剖析 | 保留有效时间与纠错分析；与读取、治理共同评估整合为一个 Memory 主问题，项目细节用引用。 |
| [记忆检索：候选证据、时效与上下文装配](../../src/content/writing/agent-memory-retrieval.md) | 知识点深度剖析 | 已有时间／权限／融合反例；Memory 与 RAG 不互相替代，避免同时承担全部上下文装配问题。 |
| [记忆治理：共享、撤权、删除与验证](../../src/content/writing/agent-memory-governance.md) | 知识点深度剖析 | 保留撤权与派生物删除链；与写入／读取统一对象和案例，避免反复介绍相同三个项目。 |
| [Mem0：事实写入、混合检索与部署边界](../../src/content/writing/mem0-series-overview.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [OpenViking：上下文文件系统、层级检索与一致性](../../src/content/writing/openviking-series-overview.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [TencentDB Agent Memory：协议代理、分层记忆与团队资产](../../src/content/writing/tencentdb-agent-memory-overview.md) | 项目研究 | 保留独立研究对象；核对关键结论是否有固定版本、代码位置和反例支持，不以链接数量判断完成。 |
| [可观测性：任务关联、时间线与故障定位](../../src/content/writing/harness-operations-observability.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [任务服务：队列、租约、隔离令牌与背压](../../src/content/writing/harness-operations-production.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [版本发布：评测门槛、灰度与在途任务回退](../../src/content/writing/harness-operations-release.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [记忆系统比较：核心对象与生命周期取舍](../../src/content/writing/agent-memory-design-competitive-analysis.md) | 技术架构比对 | 归技术架构比对；补同任务、写入／读取／纠错路径与条件性决策，不能仅重复单项目摘要。 |
| [Agent Harness 架构选型：轻量循环、图式编排与持久工作流](../../src/content/writing/harness-architecture-selection.md) | 技术架构比对 | 作为技术架构比对的较好样本；保留固定任务与真实控制引擎实验，不能外推生产性能。 |
| [Multi-Agent 选型：任务拆分、协作拓扑与部署成本](../../src/content/writing/multi-agent-architecture-selection.md) | 技术架构比对 | 归技术比对与选型；协作拓扑、框架、部署已经分开，补已固定版本的实际候选结果。 |
| [可靠性边界：验收、风险与自治范围](../../src/content/writing/ai-agent-reliability-boundaries.md) | 知识点深度剖析 | 保留本问题的论述；按定义、机制、取舍、反例、验证检查深度，减少跨文章重复。 |
| [Agent 评测系统：任务、指标、裁判与持续回归](../../src/content/writing/agent-system-evaluation-research.md) | 知识点深度剖析 | 归技术框架的评测机制；模型、产品按对象引用对应方法，不再作为第四个顶层。 |
| [TRACE：轨迹评测、代理指标与复现边界](../../src/content/writing/trace-framework-deep-dive.md) | 论文研究 | 归技术框架的评测论文研究；保留论文结果与 TRACE-Lite 自拟实现的区分。 |

## 模型（2 篇现有内容）

| 文章 | 文章类型 | 调整建议 |
| --- | --- | --- |
| [模型能力边界：从公开评测到任务责任](../../src/content/writing/llm-agent-capability-landscape-2026.md) | 模型能力综述 | 归模型能力综述；有多模型画像，不是单模型深析；与选型篇消除重复并逐项更新时效证据。 |
| [模型选型：任务样本、重复运行与完整成本](../../src/content/writing/ai-capability-evidence-action.md) | 模型比较与选型 | 归模型比较与选型方法；评测说明被插入章节打断，“三条边界”列了四种对象，需重排与校正。 |

## 产品（15 篇现有内容）

| 文章 | 文章类型 | 调整建议 |
| --- | --- | --- |
| [Claude Code：执行循环、记忆与扩展机制](../../src/content/writing/claude-code-internals-overview.md) | 单产品分析 | 按现有正文的公开产品机制归产品；与 Claude Code 产品主文协调边界，不能标为开源内核审计。 |
| [市场判断：环境、竞争、规模与定位](../../src/content/writing/product-frameworks-market.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [需求取舍：用户旅程、优先级与发布范围](../../src/content/writing/product-frameworks-prioritization.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [增长分析：漏斗诊断与单位经济性](../../src/content/writing/product-frameworks-growth.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [产品复盘：目标、证据与经验复用](../../src/content/writing/product-frameworks-delivery.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [Agent 产品设计：结果契约、自治范围与反馈迭代](../../src/content/writing/product-work-methodology.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [Claude Code 产品设计：委托、信任与协作](../../src/content/writing/claude-code-product-design.md) | 单产品分析 | 已有单产品完整论述；保留分析原型与官方能力的区分，补版本化用户任务记录。 |
| [AI 交付价值：指标口径、失败成本与人工基线](../../src/content/writing/ai-capability-product-metrics.md) | 产品方法与采用 | 作为产品交付方法；清理“一张图先看清”等图片移除后遗留措辞，保留指标口径。 |
| [编程交付：测试、变更范围与可复验证据](../../src/content/writing/ai-value-coding.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [语音交付：意图消歧、执行状态与结果验收](../../src/content/writing/ai-value-voice.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [办公交付：数据口径、可编辑文件与来源核验](../../src/content/writing/ai-value-office.md) | 产品方法与采用 | 保留为产品方法支持；后续以真实产品任务与交付记录验证，避免方法框架替代具体产品研究。 |
| [Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../../src/content/writing/coding-agent-harness-showdown.md) | 产品竞品分析 | 当前实质为公开产品结构比较；归产品竞品，先对齐标题和对象，再决定是否有证据另做源码架构比较。 |
| [办公 Agent 比较：Kimi Work、WorkBuddy 与豆包工作](../../src/content/writing/china-work-agent-showdown.md) | 产品竞品分析 | 归产品竞品；已有任务契约与核验方案，尚无同题租户实测；清理月报流程附近的重复说明。 |
| [Agent 选型：比较维度、任务契约与 PoC](../../src/content/writing/agent-landscape-comparison-methods.md) | 产品方法与采用 | 归产品采用与竞品方法；其框架选型部分通过链接回到技术架构比对。 |
| [陆奇谈研究型创业者：研究、创新与组织学习](../../src/content/writing/lu-qi-researcher-founder.md) | 阅读补充 | 保留原文、日期与历史图片例外；建议放产品方法的阅读补充，不冒充具体产品分析。 |
