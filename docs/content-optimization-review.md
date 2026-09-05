# 全站内容深化审查索引

> 此文件是上一轮结构与表达检查记录；2026-09-06 全文审阅结果以 [全量索引](content-full-review.md)和 [八项编辑卡](content-full-review.json)为准。

逐篇检查当前 88 篇的结构、开篇、示例、收尾和专题归属，重点改写影响理解与论证的段落。保留已有明确的版本说明、反例和独立验收。详细编辑卡见 [JSON 记录](content-optimization-review.json)，实际文字修改见 [修订记录](content-optimization-edits.json)。

本轮不将结构审查视为全部外部事实的独立研究；新架构依赖的官方语义与实验结果另有记录。

| 文章 | 专题 | 处理 |
| --- | --- | --- |
| [Addy Skills：工程生命周期与验证门槛](../src/content/writing/addy-agent-skills-overview.md) | Skills 与工程资产 | 以“修复登录请求超时，但不改登录协议”为教学例子：定义阶段固定允许修改的行为，计划阶段列出复现与回归，构建阶段修改超时处理，验证阶段运行这两类测试。测试失败时回到对应变更，而不是继续发布。阶段的意… |
| [先把题目和裁判做对，再谈排行榜](../src/content/writing/agent-evaluation-datasets.md) | 评测体系与可靠性 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [把一次打分变成可重复的回归系统](../src/content/writing/agent-evaluation-engineering.md) | 评测体系与可靠性 | 评测回归要保证同一任务在不同版本下可比较。以销售月报为例：固定输入表和月份，分别运行两个 Agent 版本，再由独立检查器核对数字、来源和保存位置。本文将这条流程实现为可重复运行的本地实验。 |
| [成功率、稳定性与成本，不能揉成一个分数](../src/content/writing/agent-evaluation-metrics.md) | 评测体系与可靠性 | 假设销售经理要求汇总 8 月订单，输出地区、销售额与来源行号，禁止混入 7 月数据。同一 Agent 运行三次：两次通过验收，一次选错月份。这说明“多次尝试能找到合格结果”与“每次执行都可靠”不同… |
| [Agent 选型：比较维度、任务契约与 PoC](../src/content/writing/agent-landscape-comparison-methods.md) | Agent 竞品分析与选型 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [先把记忆放回完整生命周期](../src/content/writing/agent-memory-design-competitive-analysis.md) | 上下文与记忆机制 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [一条记忆开始跨团队流动之后](../src/content/writing/agent-memory-governance.md) | 上下文与记忆机制 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [找到相关记忆，只完成了一半](../src/content/writing/agent-memory-retrieval.md) | 上下文与记忆机制 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [保留历史，还是维护当前事实](../src/content/writing/agent-memory-writing.md) | 上下文与记忆机制 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [让任务评测进入产品工作节奏](../src/content/writing/agent-product-evaluation-rhythm.md) | 任务契约与产品节奏 | ## 将评测结果落实到授权范围 |
| [先搭一张从任务到上线决策的地图](../src/content/writing/agent-system-evaluation-research.md) | 评测体系与可靠性 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [可靠性边界：验收、风险与自治范围](../src/content/writing/ai-agent-reliability-boundaries.md) | 评测体系与可靠性 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [用真实任务选择模型，而不是看一次演示](../src/content/writing/ai-capability-evidence-action.md) | 模型能力与任务边界 | 结合[模型能力与评测证据](/writing/llm-agent-capability-landscape-2026/)，可以提出以下三个产品方向假设；它们仍需用业务任务验证。；[任务评测设计] |
| [AI 交付价值：指标口径、失败成本与人工基线](../src/content/writing/ai-capability-product-metrics.md) | 场景价值与交付成本 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [测试通过之后，还需要哪些交付证据](../src/content/writing/ai-value-coding.md) | 场景价值与交付成本 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [文件能打开，为什么仍然不能交付](../src/content/writing/ai-value-office.md) | 场景价值与交付成本 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [听懂一句话，不等于改对一个闹钟](../src/content/writing/ai-value-voice.md) | 场景价值与交付成本 | 用户手机上已有明天早上 7:00 的闹钟，现在要求“改成 7:30”。任务成功的条件是修改这一个闹钟，保留其他闹钟，并从设备读取新时间确认。语音识别正确只是其中一步。；统计延迟时分别记录首次反馈与… |
| [Anthropic Skills：规范、渐进加载与文档管线](../src/content/writing/anthropic-skills-overview.md) | Skills 与工程资产 | 例如，用户要求把销售表生成可编辑的月报。Skill 说明先核对月份与字段，脚本生成文档，再渲染检查表格是否溢出；若总额不符，就回到原始数据核对。这个教学例子说明：说明文件负责组织步骤，脚本与产物检… |
| [先看清 MCP、Skill 与 Agent 的系统全景](../src/content/writing/capability-routing-at-scale.md) | 工具、协议与执行边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [从能力描述到检索与正文精排](../src/content/writing/capability-routing-discovery.md) | 工具、协议与执行边界 | 候选可能是 Skill、工具或 Agent。下一步应比较完成同一任务的执行路径，见[方案与执行](/writing/capability-routing-execution/)。 |
| [用评测与治理建立生产信心](../src/content/writing/capability-routing-evaluation.md) | 工具、协议与执行边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [从候选列表到可执行方案](../src/content/writing/capability-routing-execution.md) | 工具、协议与执行边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [办公 Agent 的落地取决于最后一公里](../src/content/writing/china-work-agent-adoption.md) | Agent 竞品分析与选型 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Kimi Work、WorkBuddy 与豆包工作如何分工](../src/content/writing/china-work-agent-showdown.md) | Agent 竞品分析与选型 | 本文依据截至 2026 年 9 月的公开资料，选择三款办公 Agent 比较其入口与任务范围： |
| [Claude Code：执行循环、记忆与扩展机制](../src/content/writing/claude-code-internals-overview.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Agent 任务体验：从目标输入到交付证据](../src/content/writing/claude-code-product-design.md) | Agent 交互与协作 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [并行和跨端，首先是状态管理问题](../src/content/writing/claude-code-session-collaboration.md) | Agent 交互与协作 | ## Worktree 的隔离范围；## 按寿命管理上下文；## 用扩展接入现有流程；## 跨端接管需要保留哪些状态 |
| [少一点确认，不等于少一点边界](../src/content/writing/claude-code-trust.md) | Agent 交互与协作 | ## 用验证界面支持用户验收 |
| [Codex：运行时、沙箱与持续任务](../src/content/writing/codex-system-overview.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../src/content/writing/coding-agent-harness-showdown.md) | Agent 竞品分析与选型 | ## Codex：任务监督、环境与变更审查；## Claude Code：项目约束与工作流扩展 |
| [Harness 源码研究：对象分层、证据卡与实现路线](../src/content/writing/composable-agent-harness-research-method.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [DeepSeek Harness：插件怎样出现、协作，并真正退出](../src/content/writing/deepseek-harness-composition.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [DeepSeek Harness：工具、PTC 和多 Agent，怎样不放大副作用](../src/content/writing/deepseek-harness-execution.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [DeepSeek Harness：历史不能丢，模型又不能看全部历史](../src/content/writing/deepseek-harness-state.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [ECC：如何把工程经验编译到不同平台](../src/content/writing/ecc-architecture-deep-dive.md) | Skills 与工程资产 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [ECC：规则如何在事件边界真正发生](../src/content/writing/ecc-hook-runtime-memory.md) | Skills 与工程资产 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [ECC：如何治理配置供应链与控制平面](../src/content/writing/ecc-memory-supply-chain.md) | Skills 与工程资产 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Agent Harness 架构选型：轻量循环、图式编排与持久工作流](../src/content/writing/harness-architecture-selection.md) | 架构与运行循环 | 新增三种运行架构的部署、取舍、共同验证和迁移方案。 |
| [运行循环与规划：状态、进展和停止条件](../src/content/writing/harness-engineering-loop.md) | 架构与运行循环 | 用户要求在工单系统创建一张待核验工单，并返回可查询的编号。模型只生成了标题和来源，却回答“完成了”。此时任务尚未完成：运行器还需检查许可、实际创建，再查询工单核对字段。；补充与正文、任务边界对应的… |
| [Harness 架构：任务契约、模块职责与建设顺序](../src/content/writing/harness-engineering-map.md) | 架构与运行循环 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。；补齐八项模块接口、输入输出、状态所有者与失败出口。 |
| [持久化与恢复：事务、幂等、对账和补偿](../src/content/writing/harness-engineering-recovery.md) | 状态、并发与恢复 | 假设 Worker A、B 都基于文档版本 1 生成摘要，A 先提交并得到版本 2。B 提交时收到冲突；如果只改用版本号 2，却仍写入原摘要，就会覆盖 A 新增的证据。版本检查通过不代表内容合并正… |
| [执行安全：身份、授权、审批与沙箱](../src/content/writing/harness-engineering-security.md) | 工具、协议与执行边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [工具契约：输入、结果与错误语义](../src/content/writing/harness-engineering-tools.md) | 工具、协议与执行边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [并发控制：任务所有权、锁与预算竞争](../src/content/writing/harness-foundations-concurrency.md) | 状态、并发与恢复 | 删除无信息增量的段落；补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [故障实验：并发冲突、业务恢复与协议状态](../src/content/writing/harness-foundations-lab.md) | 状态、并发与恢复 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [MCP 生命周期：握手、目录、断线与取消](../src/content/writing/harness-foundations-mcp-lifecycle.md) | 工具、协议与执行边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [从模块组装到运行：完成你的第一版 Mini Harness](../src/content/writing/harness-integration-lab.md) | Mini Harness 实战 | 本实验创建一张本地待核验工单：来源为 `source-001`，标题为“核验 Agent Harness 资料”。运行后应只存在一条字段匹配的工单；写入后进程退出，再次运行也不能重复创建。下面按模… |
| [Mini Harness 的模块、接口与默认选型](../src/content/writing/harness-integration-map.md) | Mini Harness 实战 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [工具、执行策略与 MCP 怎样接线](../src/content/writing/harness-integration-mcp.md) | Mini Harness 实战 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [模型、上下文与有界循环怎样组合](../src/content/writing/harness-integration-model.md) | Mini Harness 实战 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [状态、幂等与验收怎样闭环](../src/content/writing/harness-integration-recovery.md) | Mini Harness 实战 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [上下文组装：材料、状态与输入预算](../src/content/writing/harness-operations-context.md) | 上下文与记忆机制 | title: 上下文组装：材料、状态与输入预算 |
| [换一个模型，为什么不是改一个名字](../src/content/writing/harness-operations-model-gateway.md) | 运行治理与发布 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [增加一个 Agent，需要增加哪些责任](../src/content/writing/harness-operations-multi-agent.md) | 运行治理与发布 | 补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [沿着一条失败任务，把故障定位到边界](../src/content/writing/harness-operations-observability.md) | 运行治理与发布 | 选择[故障实验] |
| [从一个 Worker 到可恢复的任务服务](../src/content/writing/harness-operations-production.md) | 运行治理与发布 | [本地实验]；补充与正文、任务边界对应的 Mermaid 图，并校正图号与阅读时间。 |
| [让每一次变化都有进入生产和退出生产的证据](../src/content/writing/harness-operations-release.md) | 运行治理与发布 | 发布后的执行权与竞争处理见[并发控制](/writing/harness-foundations-concurrency/)。 |
| [Hermes：长期运行的内核如何维持](../src/content/writing/hermes-agent-architecture-deep-dive.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Hermes：经验如何积累而不失去边界](../src/content/writing/hermes-agent-memory-governance.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Hermes：从工具循环到常驻服务](../src/content/writing/hermes-agent-runtime-services.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Kimi Code：Session、Skills 与任务委派](../src/content/writing/kimi-code-system-overview.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [LangChain 与 LangGraph：从模型调用到可恢复的 Agent，协议处在哪一层？](../src/content/writing/langchain-langgraph-frameworks-and-protocols.md) | 架构与运行循环 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [组织学习速度为什么可能成为新壁垒](../src/content/writing/learning-organization-boundaries.md) | 研究、创业与组织学习 | 这里讨论的是作者从演讲中提炼的组织学习假设，是否形成竞争优势仍需看真实反馈和经营结果。；删除动员式结尾，收窄竞争判断；以销售复盘实验说明反馈如何改变问题定义及样本边界。 |
| [先分清“能做”与“可交付”](../src/content/writing/llm-agent-capability-landscape-2026.md) | 模型能力与任务边界 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Loop Engineering 与 Graph Engineering：Agent 如何持续推进，又怎样组织复杂任务](../src/content/writing/loop-graph-engineering.md) | 架构与运行循环 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [为什么下一代组织要学会处理未知](../src/content/writing/lu-qi-researcher-founder.md) | 研究、创业与组织学习 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Matt Pocock Skills：需求对齐与反馈循环](../src/content/writing/mattpocock-skills-overview.md) | Skills 与工程资产 | 例如，用户说“让导入更快”。澄清后确认：一万行 CSV 必须在约定时间内导入，失败行要能下载重试，禁止跳过校验。这时就可以形成基线测量和失败样本；继续追问按钮颜色不会改变当前实现决策，应停止扩展问… |
| [Mem0：部署、Provider 与生产边界](../src/content/writing/mem0-production-boundaries.md) | 记忆系统实现 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Mem0：身份过滤、ADD-only 写入与混合检索](../src/content/writing/mem0-series-overview.md) | 记忆系统实现 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Multi-Agent 技术架构选型：从任务拆分到框架与部署决策](../src/content/writing/multi-agent-architecture-selection.md) | 架构与运行循环 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [OpenCode：客户端、服务端与扩展系统](../src/content/writing/opencode-system-overview.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [OpenViking：上下文分层、URI 与层级检索](../src/content/writing/openviking-series-overview.md) | 记忆系统实现 | 例如，团队把接口手册作为 Resource，保存“该项目禁止自动发布”为 Memory，再把发布检查方法作为 Skill。回答接口用法时应读取手册；执行发布时还要检查项目约束。统一检索入口不能消除… |
| [OpenViking：会话记忆、存储一致性与治理](../src/content/writing/openviking-session-governance.md) | 记忆系统实现 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Pi：最小内核如何维持正确性](../src/content/writing/pi-architecture-deep-dive.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Pi：如何走向可恢复的多进程系统](../src/content/writing/pi-durable-harness-governance.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Pi：运行历史如何成为可扩展 Session](../src/content/writing/pi-session-extension-architecture.md) | 项目实现研究 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [先知道要做什么决定，再选择框架](../src/content/writing/product-analysis-frameworks.md) | 产品分析方法 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [让一次发布留下结果，也留下可复用的认识](../src/content/writing/product-frameworks-delivery.md) | 产品分析方法 | 以下为假设案例：“试用前两天，客户明确要求数据只能留在指定区域（S）；团队需在两天内调整试用范围与部署（T）；产品减少输入字段，工程配置区域存储，销售重新确认验收范围（A）；客户确认测试环境满足这… |
| [用户真的得到价值，生意才有机会成立](../src/content/writing/product-frameworks-growth.md) | 产品分析方法 | 这条追问链提出了“样本与目标场景不匹配”的原因假设，尚未证明因果。下一步用销售会议样本核对被指派人与发言人，再比较修订前后的抽取结果；若错误没有减少，应继续检查其他原因。；若价值主张是“减少人工时… |
| [从市场很大，到我们为什么能做](../src/content/writing/product-frameworks-market.md) | 产品分析方法 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [从用户旅程到一次有边界的发布](../src/content/writing/product-frameworks-prioritization.md) | 产品分析方法 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [Agent 产品工作：结果契约、自治阶梯与上下文](../src/content/writing/product-work-methodology.md) | 任务契约与产品节奏 | 用客户反馈任务明确输入、目标和权限，替换泛化的传统产品与 Agent 对比铺垫。 |
| [从 Prompt 到 Context，再到 Harness：Agent 工程如何走向任务闭环](../src/content/writing/prompt-context-harness-engineering.md) | 架构与运行循环 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [研究、创新与斜率怎样变成行动](../src/content/writing/researcher-founder-thinking.md) | 研究、创业与组织学习 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [TencentDB Agent Memory：资产权限与发布治理](../src/content/writing/tencentdb-agent-memory-governance.md) | 记忆系统实现 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [TencentDB Agent Memory：协议代理与分层记忆](../src/content/writing/tencentdb-agent-memory-overview.md) | 记忆系统实现 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [TRACE 如何从“答对”走向“可信地答对”](../src/content/writing/trace-framework-deep-dive.md) | 评测体系与可靠性 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
| [把 TRACE 变成生产评测，而不是新排行榜](../src/content/writing/trace-lite-production.md) | 评测体系与可靠性 | 保留现有结构与正文；按专题边界核对主问题、示例和收尾，未新增泛化导读。 |
