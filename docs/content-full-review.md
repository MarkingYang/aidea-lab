# 全量内容审阅与归并记录

2026-09-06。已逐篇阅读当前 88 篇全文，检查主问题、前提、论据、反例、工程影响和文章边界。每篇八项编辑卡及最终文件摘要见 [JSON 记录](content-full-review.json)。

本次修订 76 篇正文、1 篇仅校准元数据，其余全文复核后保留。正文字符合计由 326,758 降为 314,401，净减少 12,357；该统计包含 Markdown、链接与代码，不以删字比例衡量质量。

## 文章分工与归并

继续保留知识域 → 专题 → 文章三级目录：4 个知识域、17 个专题。当前 88 篇主问题可区分，因此这轮没有为压缩数量而删除整篇；重复内容在段落和章节层合并，保留 URL，正文改为引用唯一主文。此前已退休的文章仍通过 81 条重定向访问。

| 原有重叠或错位 | 调整后唯一职责 | 处理 |
| --- | --- | --- |
| 恢复篇中的条件更新、冲突合并和事务隔离 | 并发控制主文 | 三节移入并发篇；恢复篇只保留副作用对账 |
| 工程评测中的零事故统计推导 | 评测指标主文 | 统计解释移动，工程篇引用 |
| 多篇重复 pass@k、单位交付成本 | 指标与成本主文 | 删除重复算例和公式，保留场景增量 |
| Loop/Graph 中重复生命周期和完整恢复介绍 | 循环主文、框架中断实验、架构选型 | Loop/Graph 聚焦进展、分支身份与汇合 |
| 记忆治理中的 Tencent 项目组件说明 | Tencent 实现研究 | 通用治理保留资产生命周期与失败案例 |
| 竞品方法中的逐产品介绍与重复分类 | Coding 与办公比较 | 方法主文只保留比较契约与 PoC |
| Coding 三产品标题下并列六个系统 | 产品化 Coding Agent 比较 | 表格收敛到 Claude Code、Codex、Kimi Code；自建系统链接项目篇 |
| 办公采用重复研究、生态、多模态定位 | 办公产品比较 | 采用篇重写为月报交付、写回与接管 |
| ECC、Pi、Hermes 多次罗列优势、原则与宏观结语 | 各篇自己的实现问题 | 删除重复总结，补具体故障验收 |
| 首页专题简介与学习结果相同 | 简介说明内容；结果说明读者产物 | 逐专题改写 outcome，保持目录归属唯一 |

## 影响结论的修正

- 两处产品流程图将审批放在执行之后，改为参数与授权检查 → 必要批准 → 执行 → 验收。
- OpenViking 图改为同步归档 → 返回任务 ID → 异步提炼；提交状态由任务 API 查询，不由向量索引返回。
- DeepSeek 插件生命周期图的“副作用已回滚”改为“受管资源已释放”，避免把卸载当业务回滚。
- Hermes 的 Cron 再触发不再被写成原执行点恢复；Pi 的确定性结果排列也不再被当作并行副作用可重放。
- 记忆写入例子的事件时间、记录时间与生效时间对齐；Memory 不再承担发布授权；Tencent 尚在路线图的编辑能力明确标注。
- 删除无统一评分依据的雷达图；增长漏斗补齐 cohort 与观察窗口，RICE 补齐用户、周期和工作量单位。
- 研究、市场和产品优点改写为有条件、可推翻的判断；区分官方机制、源码观察、实验和建议。

## 架构交付

八职责接口、A/B/C 部署图、共同正常时序与写后丢响应故障时序、逐模块默认组合、服务化选择和迁移条件集中在 [架构选型](../src/content/writing/harness-architecture-selection.md)。Mini 五篇保持代码、图与实现范围对应。

A 是显式 Python 循环，B 是真实 LangGraph，C 是真实 Temporal Worker / Workflow / Activity。72 次共同场景、8 项资源与进程恢复测试、C 更换 Worker 检查通过；使用固定模型替身，不测真实模型质量和生产吞吐。Temporal 本地服务为内存后端，不声称服务端容灾通过。

## 全文索引

“正文修订”包括精简、例子、论证、图表和引用调整，不表示整篇重写。详细八项卡在 JSON 中逐篇维护。

### 架构与运行循环

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [从 Prompt 到 Context，再到 Harness：Agent 工程如何走向任务闭环](../src/content/writing/prompt-context-harness-engineering.md) | 指令、材料与运行系统分别解决什么失败 | 正文修订 |
| [Harness 架构：任务契约、模块职责与建设顺序](../src/content/writing/harness-engineering-map.md) | Harness 的模块接口与责任怎样拆 | 全文复核后保留 |
| [运行循环与规划：状态、进展和停止条件](../src/content/writing/harness-engineering-loop.md) | 任务何时继续、等待、重规划或结束 | 全文复核后保留 |
| [Loop Engineering 与 Graph Engineering：Agent 如何持续推进，又怎样组织复杂任务](../src/content/writing/loop-graph-engineering.md) | 局部反馈如何与全局依赖组合 | 正文修订 |
| [LangChain 与 LangGraph：从模型调用到可恢复的 Agent，协议处在哪一层？](../src/content/writing/langchain-langgraph-frameworks-and-protocols.md) | 框架、运行时与协议如何接线 | 正文修订 |
| [Multi-Agent 技术架构选型：从任务拆分到框架与部署决策](../src/content/writing/multi-agent-architecture-selection.md) | 何时值得拆 Agent 及如何选择拓扑 | 正文修订 |
| [Agent Harness 架构选型：轻量循环、图式编排与持久工作流](../src/content/writing/harness-architecture-selection.md) | A B C 如何按需求组合和迁移 | 正文修订 |

### 工具、协议与执行边界

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [工具契约：输入、结果与错误语义](../src/content/writing/harness-engineering-tools.md) | 工具契约如何约束真实业务动作 | 正文修订 |
| [MCP 生命周期：握手、目录、断线与取消](../src/content/writing/harness-foundations-mcp-lifecycle.md) | 重连之后何时可以再次调用工具 | 全文复核后保留 |
| [执行安全：身份、授权、审批与沙箱](../src/content/writing/harness-engineering-security.md) | 不可信资料如何避免扩大执行权限 | 正文修订 |
| [先看清 MCP、Skill 与 Agent 的系统全景](../src/content/writing/capability-routing-at-scale.md) | 异类能力如何组成完整路由链 | 正文修订 |
| [从能力描述到检索与正文精排](../src/content/writing/capability-routing-discovery.md) | 怎样召回并区分相似能力 | 正文修订 |
| [从候选列表到可执行方案](../src/content/writing/capability-routing-execution.md) | 如何从候选转成满足约束的方案 | 正文修订 |
| [用评测与治理建立生产信心](../src/content/writing/capability-routing-evaluation.md) | 如何定位路由失败并决定增加哪层 | 正文修订 |

### 状态、并发与恢复

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [并发控制：版本冲突、锁与背压](../src/content/writing/harness-foundations-concurrency.md) | 并发写入怎样保护依据与提交 | 正文修订 |
| [持久化与恢复：事务、幂等、对账和补偿](../src/content/writing/harness-engineering-recovery.md) | 写入已发生但本地未知时怎么恢复 | 正文修订 |
| [故障实验：并发冲突、业务恢复与协议状态](../src/content/writing/harness-foundations-lab.md) | 如何用故障实验验证并发与业务恢复 | 正文修订 |

### 上下文与记忆机制

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [上下文组装：材料、状态与输入预算](../src/content/writing/harness-operations-context.md) | 一次模型请求应装入哪些信息 | 仅元数据校准 |
| [先把记忆放回完整生命周期](../src/content/writing/agent-memory-design-competitive-analysis.md) | 记忆选型如何覆盖完整生命周期 | 正文修订 |
| [保留历史，还是维护当前事实](../src/content/writing/agent-memory-writing.md) | 追加合并与分层如何处理新旧事实 | 正文修订 |
| [找到相关记忆，只完成了一半](../src/content/writing/agent-memory-retrieval.md) | 相关记忆如何变成可用证据 | 正文修订 |
| [一条记忆开始跨团队流动之后](../src/content/writing/agent-memory-governance.md) | 跨团队经验如何共享纠错与撤回 | 正文修订 |

### 运行治理与发布

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [换一个模型，为什么不是改一个名字](../src/content/writing/harness-operations-model-gateway.md) | 故障转移怎样保持原任务可完成 | 全文复核后保留 |
| [增加一个 Agent，需要增加哪些责任](../src/content/writing/harness-operations-multi-agent.md) | 委派后谁负责结果预算与取消 | 全文复核后保留 |
| [沿着一条失败任务，把故障定位到边界](../src/content/writing/harness-operations-observability.md) | 如何从用户失败定位跨模块证据 | 正文修订 |
| [从一个 Worker 到可恢复的任务服务](../src/content/writing/harness-operations-production.md) | 多 Worker 接管如何阻止陈旧写入 | 全文复核后保留 |
| [让每一次变化都有进入生产和退出生产的证据](../src/content/writing/harness-operations-release.md) | 如何发布并回退整套 Agent 组合 | 正文修订 |

### Mini Harness 实战

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Mini Harness 的模块、接口与默认选型](../src/content/writing/harness-integration-map.md) | 最小 Harness 怎样按模块组装 | 正文修订 |
| [模型、上下文与有界循环怎样组合](../src/content/writing/harness-integration-model.md) | 模型提案与循环控制怎样解耦 | 正文修订 |
| [工具、执行策略与 MCP 怎样接线](../src/content/writing/harness-integration-mcp.md) | 工具契约怎样映射 MCP 接线 | 全文复核后保留 |
| [状态、幂等与验收怎样闭环](../src/content/writing/harness-integration-recovery.md) | 退出后三份运行事实怎样核对 | 全文复核后保留 |
| [从模块组装到运行：完成你的第一版 Mini Harness](../src/content/writing/harness-integration-lab.md) | 如何运行并替换最小系统模块 | 全文复核后保留 |

### 项目实现研究

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Harness 源码研究：对象分层、证据卡与实现路线](../src/content/writing/composable-agent-harness-research-method.md) | 不同项目如何以同一职责比较 | 全文复核后保留 |
| [Claude Code：执行循环、记忆与扩展机制](../src/content/writing/claude-code-internals-overview.md) | Claude Code 的循环与扩展各负责什么 | 正文修订 |
| [Codex：运行时、沙箱与持续任务](../src/content/writing/codex-system-overview.md) | Core 与 App 能力怎样分开理解 | 正文修订 |
| [Kimi Code：Session、Skills 与任务委派](../src/content/writing/kimi-code-system-overview.md) | Session 事件如何支撑继续工作 | 正文修订 |
| [OpenCode：客户端、服务端与扩展系统](../src/content/writing/opencode-system-overview.md) | 多客户端怎样共享运行状态 | 正文修订 |
| [DeepSeek Harness：插件怎样出现、协作，并真正退出](../src/content/writing/deepseek-harness-composition.md) | 插件依赖、隔离和退出如何组合 | 正文修订 |
| [DeepSeek Harness：历史不能丢，模型又不能看全部历史](../src/content/writing/deepseek-harness-state.md) | 完整历史如何投影为有限上下文 | 正文修订 |
| [DeepSeek Harness：工具、PTC 和多 Agent，怎样不放大副作用](../src/content/writing/deepseek-harness-execution.md) | PTC 和委派如何保持执行边界 | 正文修订 |
| [Hermes：长期运行的内核如何维持](../src/content/writing/hermes-agent-architecture-deep-dive.md) | 跨会话 Agent 内核怎样组织 | 正文修订 |
| [Hermes：从工具循环到常驻服务](../src/content/writing/hermes-agent-runtime-services.md) | 工具循环如何接常驻 Gateway | 正文修订 |
| [Hermes：经验如何积累而不失去边界](../src/content/writing/hermes-agent-memory-governance.md) | 长期经验如何更新且能纠错 | 正文修订 |
| [Pi：最小内核如何维持正确性](../src/content/writing/pi-architecture-deep-dive.md) | 最小内核如何兼容模型和多个入口 | 正文修订 |
| [Pi：运行历史如何成为可扩展 Session](../src/content/writing/pi-session-extension-architecture.md) | 历史树怎样变成模型上下文 | 正文修订 |
| [Pi：如何走向可恢复的多进程系统](../src/content/writing/pi-durable-harness-governance.md) | Pi 实验架构怎样拆持久状态和多端 | 正文修订 |

### Skills 与工程资产

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Anthropic Skills：规范、渐进加载与文档管线](../src/content/writing/anthropic-skills-overview.md) | Skill 如何从规范变成文档生产管线 | 正文修订 |
| [Addy Skills：工程生命周期与验证门槛](../src/content/writing/addy-agent-skills-overview.md) | 工程生命周期怎样设置退出门槛 | 正文修订 |
| [Matt Pocock Skills：需求对齐与反馈循环](../src/content/writing/mattpocock-skills-overview.md) | 局部 Skill 如何减少需求误解 | 正文修订 |
| [ECC：如何把工程经验编译到不同平台](../src/content/writing/ecc-architecture-deep-dive.md) | 共享工程资产如何适配多个 Harness | 正文修订 |
| [ECC：规则如何在事件边界真正发生](../src/content/writing/ecc-hook-runtime-memory.md) | 规则何时成为执行门禁 | 正文修订 |
| [ECC：如何治理配置供应链与控制平面](../src/content/writing/ecc-memory-supply-chain.md) | ECC 应怎样安全采用与更新 | 正文修订 |

### 记忆系统实现

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Mem0：身份过滤、ADD-only 写入与混合检索](../src/content/writing/mem0-series-overview.md) | Mem0 怎样写入和召回身份范围内事实 | 正文修订 |
| [Mem0：部署、Provider 与生产边界](../src/content/writing/mem0-production-boundaries.md) | 可替换 Provider 带来哪些运维责任 | 正文修订 |
| [OpenViking：上下文分层、URI 与层级检索](../src/content/writing/openviking-series-overview.md) | 分层文件系统如何组织上下文读取 | 正文修订 |
| [OpenViking：会话记忆、存储一致性与治理](../src/content/writing/openviking-session-governance.md) | 会话提交后的内容和索引如何一致 | 正文修订 |
| [TencentDB Agent Memory：协议代理与分层记忆](../src/content/writing/tencentdb-agent-memory-overview.md) | 代理怎样装配团队分层记忆 | 正文修订 |
| [TencentDB Agent Memory：资产权限与发布治理](../src/content/writing/tencentdb-agent-memory-governance.md) | 团队记忆如何共享且可撤回 | 正文修订 |

### 评测体系与可靠性

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [可靠性边界：验收、风险与自治范围](../src/content/writing/ai-agent-reliability-boundaries.md) | 哪些证据支持扩大自治 | 正文修订 |
| [先搭一张从任务到上线决策的地图](../src/content/writing/agent-system-evaluation-research.md) | 评测从任务到发布如何衔接 | 正文修订 |
| [成功率、稳定性与成本，不能揉成一个分数](../src/content/writing/agent-evaluation-metrics.md) | 如何同时表达成功稳定与代价 | 正文修订 |
| [先把题目和裁判做对，再谈排行榜](../src/content/writing/agent-evaluation-datasets.md) | 样本与评分器如何减少漏判 | 正文修订 |
| [把一次打分变成可重复的回归系统](../src/content/writing/agent-evaluation-engineering.md) | 怎样把契约做成可重跑回归 | 正文修订 |
| [TRACE 如何从“答对”走向“可信地答对”](../src/content/writing/trace-framework-deep-dive.md) | TRACE 各代理量实际测到什么 | 正文修订 |
| [TRACE 的实验边界与业务评测改造](../src/content/writing/trace-lite-production.md) | 论文方法怎样转成可观测业务指标 | 正文修订 |

### 模型能力与任务边界

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [先分清“能做”与“可交付”](../src/content/writing/llm-agent-capability-landscape-2026.md) | 模型能力如何映射可委托任务 | 全文复核后保留 |
| [用真实任务选择模型，而不是看一次演示](../src/content/writing/ai-capability-evidence-action.md) | 如何把公开榜单变为自己的采用实验 | 正文修订 |

### 产品分析方法

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [先知道要做什么决定，再选择框架](../src/content/writing/product-analysis-frameworks.md) | 当前决定应该用哪种分析框架 | 正文修订 |
| [从市场很大，到我们为什么能做](../src/content/writing/product-frameworks-market.md) | 如何从大市场收敛到可进入范围 | 正文修订 |
| [从用户旅程到一次有边界的发布](../src/content/writing/product-frameworks-prioritization.md) | 如何把需求证据变为发布范围 | 正文修订 |
| [用户真的得到价值，生意才有机会成立](../src/content/writing/product-frameworks-growth.md) | 怎样从漏斗症状追到价值与商业结果 | 正文修订 |
| [让一次发布留下结果，也留下可复用的认识](../src/content/writing/product-frameworks-delivery.md) | 发布完成怎样形成可更新认识 | 正文修订 |

### 任务契约与产品节奏

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Agent 产品工作：结果契约、自治阶梯与上下文](../src/content/writing/product-work-methodology.md) | 用户委托如何定义目标与行动范围 | 正文修订 |
| [让任务评测进入产品工作节奏](../src/content/writing/agent-product-evaluation-rhythm.md) | 评测如何改变每阶段可委托范围 | 正文修订 |

### Agent 交互与协作

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Agent 任务体验：从目标输入到交付证据](../src/content/writing/claude-code-product-design.md) | 任务体验怎样把目标变成可验收交付 | 正文修订 |
| [少一点确认，不等于少一点边界](../src/content/writing/claude-code-trust.md) | 减少确认如何保持可控体验 | 正文修订 |
| [并行和跨端，首先是状态管理问题](../src/content/writing/claude-code-session-collaboration.md) | 并行和跨端如何管理状态归属 | 正文修订 |

### 场景价值与交付成本

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [AI 交付价值：指标口径、失败成本与人工基线](../src/content/writing/ai-capability-product-metrics.md) | 怎样计算同等质量的真实交付成本 | 正文修订 |
| [测试通过之后，还需要哪些交付证据](../src/content/writing/ai-value-coding.md) | 代码修改需要哪些独立交付证据 | 正文修订 |
| [听懂一句话，不等于改对一个闹钟](../src/content/writing/ai-value-voice.md) | 语音任务怎样核对正确设备终态 | 正文修订 |
| [文件能打开，为什么仍然不能交付](../src/content/writing/ai-value-office.md) | 怎样证明办公成品可继续使用 | 正文修订 |

### Agent 竞品分析与选型

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [Agent 选型：比较维度、任务契约与 PoC](../src/content/writing/agent-landscape-comparison-methods.md) | 怎样建立可比的 Agent 采用证据 | 正文修订 |
| [Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../src/content/writing/coding-agent-harness-showdown.md) | 三款产品化 Coding Agent 如何分工 | 正文修订 |
| [Kimi Work、WorkBuddy 与豆包工作如何分工](../src/content/writing/china-work-agent-showdown.md) | 三款办公产品应如何进入候选集 | 正文修订 |
| [办公 Agent 的落地取决于最后一公里](../src/content/writing/china-work-agent-adoption.md) | 办公任务最后一公里怎样验收 | 正文修订 |

### 研究、创业与组织学习

| 文章 | 主问题 | 处理 |
| --- | --- | --- |
| [为什么下一代组织要学会处理未知](../src/content/writing/lu-qi-researcher-founder.md) | 研究创业观点包含哪些组织前提 | 正文修订 |
| [研究、创新与斜率怎样变成行动](../src/content/writing/researcher-founder-thinking.md) | 研究创新斜率如何转成实际行动 | 正文修订 |
| [组织学习速度为什么可能成为新壁垒](../src/content/writing/learning-organization-boundaries.md) | 反馈变快是否构成竞争壁垒 | 正文修订 |
