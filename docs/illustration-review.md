# 全站图解配置与复核

2026-09-06。在上一轮 88 篇全文审阅基础上，盘点全站图解位置。本轮新增 8 张原创手绘科普图，覆盖 8 个核心问题；3 张替换同义 Mermaid，其余补充具体场景或横向对照。保留 103 张 Mermaid，用于精确的机制、时序和项目实现说明。恢复篇的详细数据库时序可按需展开。

## 配图原则

- 概念比较用分区，装配用模块边界，故障用编号分镜，集合关系用包含图。颜色只辅助区分，关键含义同时用文字、编号和符号表达。
- 图中例子沿用正文；注明教学设定、查询目标、前提与结果。每张图只服务一个问题，不把示意图当实测证据。
- 先读论点再看图，再进入接口和实现细节。文字说明与替代文本保留完整含义，读者无需猜箭头。
- 相同机制只在主文完整绘制；项目与观点文章保留已有图表，不为覆盖率重复配图。

## 生成与存放

使用内置 image_gen，未使用 CLI。参考图仅用于浅色分区、手绘线条和简洁科普排版，未复用来源品牌。全部提示词、修订要求、落点、替代文本、图注及文件摘要见 [生成清单](illustration-prompts.json)。最终 PNG 存放于 [项目素材目录](../src/assets/illustrations/)；Astro 构建为 WebP，保留 1536 × 1024 尺寸、懒加载与异步解码。

人工逐张检查中文、箭头与前后论证。两张初稿作了逻辑修正：恢复图移除错误跨格箭头，明确返回已有工单与客户端验收；记忆图取消绕过过滤步骤的连线。评测图只展示一组三次运行的判定，未编造总体得分。

历史 [全文审阅](content-full-review.md) 的字符统计和 source_sha256 对应图解改动前的 8baa4ed 快照；本轮变动文章与图片摘要单列在生成清单中，不改写历史审阅结论。

## 全量落点

| 专题 | 文章 | 保留 Mermaid 数 | 本轮处理 |
| --- | --- | ---: | --- |
| 架构与运行循环 | [从 Prompt 到 Context，再到 Harness：Agent 工程如何走向任务闭环](../src/content/writing/prompt-context-harness-engineering.md) | 1 | 论点后的示例图解：同一核验任务的三种工程职责 |
| 架构与运行循环 | [Harness 架构：任务契约、模块职责与建设顺序](../src/content/writing/harness-engineering-map.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 架构与运行循环 | [运行循环与规划：状态、进展和停止条件](../src/content/writing/harness-engineering-loop.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 架构与运行循环 | [Loop Engineering 与 Graph Engineering：Agent 如何持续推进，又怎样组织复杂任务](../src/content/writing/loop-graph-engineering.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 架构与运行循环 | [LangChain 与 LangGraph：从模型调用到可恢复的 Agent，协议处在哪一层？](../src/content/writing/langchain-langgraph-frameworks-and-protocols.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 架构与运行循环 | [Multi-Agent 技术架构选型：从任务拆分到框架与部署决策](../src/content/writing/multi-agent-architecture-selection.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 架构与运行循环 | [Agent Harness 架构选型：轻量循环、图式编排与持久工作流](../src/content/writing/harness-architecture-selection.md) | 5 | 论点后的示例图解：用控制与状态归属比较三种架构 |
| 工具、协议与执行边界 | [工具契约：输入、结果与错误语义](../src/content/writing/harness-engineering-tools.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 工具、协议与执行边界 | [MCP 生命周期：握手、目录、断线与取消](../src/content/writing/harness-foundations-mcp-lifecycle.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 工具、协议与执行边界 | [执行安全：身份、授权、审批与沙箱](../src/content/writing/harness-engineering-security.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 工具、协议与执行边界 | [先看清 MCP、Skill 与 Agent 的系统全景](../src/content/writing/capability-routing-at-scale.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 工具、协议与执行边界 | [从能力描述到检索与正文精排](../src/content/writing/capability-routing-discovery.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 工具、协议与执行边界 | [从候选列表到可执行方案](../src/content/writing/capability-routing-execution.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 工具、协议与执行边界 | [用评测与治理建立生产信心](../src/content/writing/capability-routing-evaluation.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 状态、并发与恢复 | [并发控制：版本冲突、锁与背压](../src/content/writing/harness-foundations-concurrency.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 状态、并发与恢复 | [持久化与恢复：事务、幂等、对账和补偿](../src/content/writing/harness-engineering-recovery.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 状态、并发与恢复 | [故障实验：并发冲突、业务恢复与协议状态](../src/content/writing/harness-foundations-lab.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 上下文与记忆机制 | [上下文组装：材料、状态与输入预算](../src/content/writing/harness-operations-context.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 上下文与记忆机制 | [先把记忆放回完整生命周期](../src/content/writing/agent-memory-design-competitive-analysis.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 上下文与记忆机制 | [保留历史，还是维护当前事实](../src/content/writing/agent-memory-writing.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 上下文与记忆机制 | [找到相关记忆，只完成了一半](../src/content/writing/agent-memory-retrieval.md) | 0 | 替换同义 Mermaid：相关记忆如何成为当前可用的上下文 |
| 上下文与记忆机制 | [一条记忆开始跨团队流动之后](../src/content/writing/agent-memory-governance.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 运行治理与发布 | [换一个模型，为什么不是改一个名字](../src/content/writing/harness-operations-model-gateway.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 运行治理与发布 | [增加一个 Agent，需要增加哪些责任](../src/content/writing/harness-operations-multi-agent.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 运行治理与发布 | [沿着一条失败任务，把故障定位到边界](../src/content/writing/harness-operations-observability.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 运行治理与发布 | [从一个 Worker 到可恢复的任务服务](../src/content/writing/harness-operations-production.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 运行治理与发布 | [让每一次变化都有进入生产和退出生产的证据](../src/content/writing/harness-operations-release.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| Mini Harness 实战 | [Mini Harness 的模块、接口与默认选型](../src/content/writing/harness-integration-map.md) | 0 | 替换同义 Mermaid：Mini Harness 的八项职责如何落到两个进程 |
| Mini Harness 实战 | [模型、上下文与有界循环怎样组合](../src/content/writing/harness-integration-model.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Mini Harness 实战 | [工具、执行策略与 MCP 怎样接线](../src/content/writing/harness-integration-mcp.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Mini Harness 实战 | [状态、幂等与验收怎样闭环](../src/content/writing/harness-integration-recovery.md) | 1 | 论点后的示例图解：工单已创建但响应丢失时，按原键查询 |
| Mini Harness 实战 | [从模块组装到运行：完成你的第一版 Mini Harness](../src/content/writing/harness-integration-lab.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Harness 源码研究：对象分层、证据卡与实现路线](../src/content/writing/composable-agent-harness-research-method.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 项目实现研究 | [Claude Code：执行循环、记忆与扩展机制](../src/content/writing/claude-code-internals-overview.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Codex：运行时、沙箱与持续任务](../src/content/writing/codex-system-overview.md) | 3 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Kimi Code：Session、Skills 与任务委派](../src/content/writing/kimi-code-system-overview.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [OpenCode：客户端、服务端与扩展系统](../src/content/writing/opencode-system-overview.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [DeepSeek Harness：插件怎样出现、协作，并真正退出](../src/content/writing/deepseek-harness-composition.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [DeepSeek Harness：历史不能丢，模型又不能看全部历史](../src/content/writing/deepseek-harness-state.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [DeepSeek Harness：工具、PTC 和多 Agent，怎样不放大副作用](../src/content/writing/deepseek-harness-execution.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Hermes：长期运行的内核如何维持](../src/content/writing/hermes-agent-architecture-deep-dive.md) | 3 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Hermes：从工具循环到常驻服务](../src/content/writing/hermes-agent-runtime-services.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 项目实现研究 | [Hermes：经验如何积累而不失去边界](../src/content/writing/hermes-agent-memory-governance.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Pi：最小内核如何维持正确性](../src/content/writing/pi-architecture-deep-dive.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Pi：运行历史如何成为可扩展 Session](../src/content/writing/pi-session-extension-architecture.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 项目实现研究 | [Pi：如何走向可恢复的多进程系统](../src/content/writing/pi-durable-harness-governance.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Skills 与工程资产 | [Anthropic Skills：规范、渐进加载与文档管线](../src/content/writing/anthropic-skills-overview.md) | 1 | 替换同义 Mermaid：Skills 从发现到执行的三次展开 |
| Skills 与工程资产 | [Addy Skills：工程生命周期与验证门槛](../src/content/writing/addy-agent-skills-overview.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Skills 与工程资产 | [Matt Pocock Skills：需求对齐与反馈循环](../src/content/writing/mattpocock-skills-overview.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| Skills 与工程资产 | [ECC：如何把工程经验编译到不同平台](../src/content/writing/ecc-architecture-deep-dive.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Skills 与工程资产 | [ECC：规则如何在事件边界真正发生](../src/content/writing/ecc-hook-runtime-memory.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Skills 与工程资产 | [ECC：如何治理配置供应链与控制平面](../src/content/writing/ecc-memory-supply-chain.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 记忆系统实现 | [Mem0：身份过滤、ADD-only 写入与混合检索](../src/content/writing/mem0-series-overview.md) | 3 | 保留现有机制图；具体对照由正文与表格承接 |
| 记忆系统实现 | [Mem0：部署、Provider 与生产边界](../src/content/writing/mem0-production-boundaries.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 记忆系统实现 | [OpenViking：上下文分层、URI 与层级检索](../src/content/writing/openviking-series-overview.md) | 3 | 保留现有机制图；具体对照由正文与表格承接 |
| 记忆系统实现 | [OpenViking：会话记忆、存储一致性与治理](../src/content/writing/openviking-session-governance.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 记忆系统实现 | [TencentDB Agent Memory：协议代理与分层记忆](../src/content/writing/tencentdb-agent-memory-overview.md) | 3 | 保留现有机制图；具体对照由正文与表格承接 |
| 记忆系统实现 | [TencentDB Agent Memory：资产权限与发布治理](../src/content/writing/tencentdb-agent-memory-governance.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 评测体系与可靠性 | [可靠性边界：验收、风险与自治范围](../src/content/writing/ai-agent-reliability-boundaries.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 评测体系与可靠性 | [先搭一张从任务到上线决策的地图](../src/content/writing/agent-system-evaluation-research.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 评测体系与可靠性 | [成功率、稳定性与成本，不能揉成一个分数](../src/content/writing/agent-evaluation-metrics.md) | 1 | 论点后的示例图解：同一组三次运行，至少一次成功与全部成功判断不同 |
| 评测体系与可靠性 | [先把题目和裁判做对，再谈排行榜](../src/content/writing/agent-evaluation-datasets.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 评测体系与可靠性 | [把一次打分变成可重复的回归系统](../src/content/writing/agent-evaluation-engineering.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 评测体系与可靠性 | [TRACE 如何从“答对”走向“可信地答对”](../src/content/writing/trace-framework-deep-dive.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 评测体系与可靠性 | [TRACE 的实验边界与业务评测改造](../src/content/writing/trace-lite-production.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 模型能力与任务边界 | [先分清“能做”与“可交付”](../src/content/writing/llm-agent-capability-landscape-2026.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 模型能力与任务边界 | [用真实任务选择模型，而不是看一次演示](../src/content/writing/ai-capability-evidence-action.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 产品分析方法 | [先知道要做什么决定，再选择框架](../src/content/writing/product-analysis-frameworks.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 产品分析方法 | [从市场很大，到我们为什么能做](../src/content/writing/product-frameworks-market.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 产品分析方法 | [从用户旅程到一次有边界的发布](../src/content/writing/product-frameworks-prioritization.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 产品分析方法 | [用户真的得到价值，生意才有机会成立](../src/content/writing/product-frameworks-growth.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 产品分析方法 | [让一次发布留下结果，也留下可复用的认识](../src/content/writing/product-frameworks-delivery.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 任务契约与产品节奏 | [Agent 产品工作：结果契约、自治阶梯与上下文](../src/content/writing/product-work-methodology.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| 任务契约与产品节奏 | [让任务评测进入产品工作节奏](../src/content/writing/agent-product-evaluation-rhythm.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Agent 交互与协作 | [Agent 任务体验：从目标输入到交付证据](../src/content/writing/claude-code-product-design.md) | 2 | 保留现有机制图；具体对照由正文与表格承接 |
| Agent 交互与协作 | [少一点确认，不等于少一点边界](../src/content/writing/claude-code-trust.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Agent 交互与协作 | [并行和跨端，首先是状态管理问题](../src/content/writing/claude-code-session-collaboration.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 场景价值与交付成本 | [AI 交付价值：指标口径、失败成本与人工基线](../src/content/writing/ai-capability-product-metrics.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 场景价值与交付成本 | [测试通过之后，还需要哪些交付证据](../src/content/writing/ai-value-coding.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 场景价值与交付成本 | [听懂一句话，不等于改对一个闹钟](../src/content/writing/ai-value-voice.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 场景价值与交付成本 | [文件能打开，为什么仍然不能交付](../src/content/writing/ai-value-office.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Agent 竞品分析与选型 | [Agent 选型：比较维度、任务契约与 PoC](../src/content/writing/agent-landscape-comparison-methods.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Agent 竞品分析与选型 | [Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../src/content/writing/coding-agent-harness-showdown.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| Agent 竞品分析与选型 | [Kimi Work、WorkBuddy 与豆包工作如何分工](../src/content/writing/china-work-agent-showdown.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| Agent 竞品分析与选型 | [办公 Agent 的落地取决于最后一公里](../src/content/writing/china-work-agent-adoption.md) | 1 | 论点后的示例图解：月报交付的四道检查与一个口径反例 |
| 研究、创业与组织学习 | [为什么下一代组织要学会处理未知](../src/content/writing/lu-qi-researcher-founder.md) | 1 | 保留现有机制图；具体对照由正文与表格承接 |
| 研究、创业与组织学习 | [研究、创新与斜率怎样变成行动](../src/content/writing/researcher-founder-thinking.md) | 0 | 保留文字与表格；本轮不增加装饰图 |
| 研究、创业与组织学习 | [组织学习速度为什么可能成为新壁垒](../src/content/writing/learning-organization-boundaries.md) | 0 | 保留文字与表格；本轮不增加装饰图 |

## 验证结果

- `npm run build` 通过：88 篇文章、81 条旧路由、内容与图号检查均无错误；图谱仍为 148 个节点、642 条关系。
- 构建自动输出 8 张 1536 × 1024 WebP，每张约 102–132 KB；PNG 原稿保存在项目中，页面不直接加载大体积原稿。
- `scripts/illustration-browser-check.mjs` 通过 16 组桌面／手机图片检查：资源、图注、替代文本、固有尺寸、懒加载、页面溢出、放大后四边可达、适应窗口、Escape 关闭与焦点返回。另验证无 JavaScript 时图片仍可见。
- `scripts/knowledge-browser-check.mjs` 的 150 项全站检查通过；目录与搜索 16 项单元测试通过。
- 人工复核 Mini Harness 桌面、手机正文及手机放大截图；图片缩略图可查看整体关系，放大后可滚动阅读细节。

复验命令：

```sh
npm run build
node --test scripts/library.test.mjs
BLOG_BASE_URL=http://localhost:4321 node scripts/illustration-browser-check.mjs
BLOG_BASE_URL=http://localhost:4321 node scripts/knowledge-browser-check.mjs
```

浏览器脚本需要 Playwright 与 Chrome；Playwright 不在项目依赖中时可通过 `BLOG_PLAYWRIGHT_ROOT` 指向已安装的运行时依赖目录。人工图文复核与自动浏览器检查各自记录，自动检查不验证图中文字的事实准确性。
