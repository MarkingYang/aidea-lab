# 全站文章编辑审查 · 2026-09-05

审查对象：任务开始时 `src/content/writing` 下全部 **130 篇** Markdown 正文。执行期间其他任务新增的 Mem0 等稿件属于并行编辑，不包含在这份固定清单中；未覆盖它们的写作改动。审查维度为信息增量、论证一致性、术语与图表一致性、实战可操作性；不是为全部外部事实重新做一轮独立研究。

## 对三个问题的回答

**1. 有明显冗余，但分布不均。** 主要集中在重复导读、反复声明“不是排行榜”、同一结论在多个终篇重述，以及一段材料被拆成多篇。评测公式、恢复反例、权限适用条件有实际作用，不应为了短而删掉。31 篇重复的阅读说明与图例模板已清理；开源路线的重复项目介绍、工程产品重复表格、终篇重复“最后判断”等已定点删除。

**2. 有需要直接修正的逻辑问题。** 问题主要是“证据只支持 A，却写成保证 B”、不同层级概念混用、公式性质说错，以及拆篇后留下悬空指代。下面列出原文证据和处理，不把一般文风偏好算作事实错误。

**3. 原 Harness 实战更像集成实验验收说明，缺了装配教程。** 已重写五篇：先定义 Mini Harness 的八项职责、输入输出与默认组合，再讲模型/上下文/循环、工具/策略、状态/验收，最后按文件和调用顺序运行。技术选择有明确场景与升级条件；默认实验是单动作工作流，多轮循环另给设计，并明确尚未实现。不能为了标题叫实战，就把一个固定工单创建任务写成自主研究 Agent。

## 审查与修改统计

- 正文审读：130 / 130 篇；逐篇结论见下表。
- 本次有文件改动：**116 篇**，其中包含阅读时间校正；这个数不等于全文重写数量。
- 阅读时间校正：**76 篇**。按仓库既有算法估算中文、英文、表格、图和代码阅读时间；这只是显示口径，不是内容质量分数。
- 原正文估计仅 1–2 分钟：**35 篇**。其中七组四篇式研究共 **28 篇**，信息量偏薄；其余 7 篇主要承担导航或阶段总结。短本身不是错误，但不足以支撑深度研究承诺。
- 五篇 Mini Harness 正文、系列标题/简介和下载包 README 已同步；URL 保留。
- 自动检查只验证结构，不能发现大多数论证错误。现有系列检查覆盖 125 篇，本次审读另包含 5 篇能力路由文章。

逐篇主状态（互斥）：需补厚/合并 28 篇；保留/精简 60 篇；已修正 31 篇；导航型短篇 6 篇；已重写 5 篇。某篇列为“需补厚/合并”时，其中已发现的局部错误仍可能已修正，详见该行。

## 有证据的主要问题

| 类型 | 原文位置与问题 | 本次处理 |
| --- | --- | --- |
| 无依据精确化 | 比较方法、国内办公比较称“不用总分”，却提供无评分规则的 1–5 曲线与强弱矩阵 | 删除两组数值曲线，改为公开机制、待验证假设和同任务证据 |
| 结论强于证据 | 全景、工程比较、办公采用在实测前写“最高”“这一回合占优” | 改为带场景的候选，不从功能目录推出总体胜者 |
| 跨产品外推 | Kimi Work 的 300 子 Agent 上限被放进 Code 验证；手机助手与桌面能力被推作连续 Session | 分开产品、版本和任务状态，要求独立证据 |
| 混合量纲 | 办公采用将完成率、时间、成本、安全按百分比直接相加 | 改成分项口径；需要汇总时先定义归一化与方向，硬门槛单列 |
| 过强保证 | Claude/ECC/Anthropic 多篇称 Hook “一定运行”“无论模型怎样判断” | 限定事件匹配、同步/异步、退出与失败行为；授权和隔离各负其责 |
| 证据可信度 | Addy 验证篇称运行环境产生“不可伪造的结果” | 改为可核对结果，补受保护 CI 和独立验收条件 |
| 生命周期偷换 | DeepSeek 组合篇把插件卸载写成“完整撤销副作用” | 限于受管理注册和资源清理，区分外部业务写入 |
| 类型层级混用 | DeepSeek 总结把 `standard` Preset 与 `sdk-minimal` Profile 当同级选项 | 分开选择层次并提示组合兼容 |
| 图文计数不一致 | Hermes 图中七平面，正文称六、表格缺执行平面 | 统一七个分析平面并补表项 |
| 默认与可选冲突 | Hermes 图称长期写入必须审批，正文说明可自动写入 | 图改为审批开关分支，拒绝不生效 |
| 权限边界混淆 | Hermes Toolset 筛选被称为权限边界 | 区分模型可见能力与服务端/执行层授权 |
| 时间定义混用 | 记忆写入称“两种时间”，例子混入第三种记录时间 | 明确定义来源事件、业务有效、系统记录三个时间 |
| 历史保留矛盾 | OpenViking 段落提及原始归档和 diff，表格仍称更改不可逆 | 改为恢复依赖历史及差异是否保留 |
| 数学错误 | TRACE 称非零几何平均不能相互补偿 | 给出 1×0.25 与 0.5×0.5 反例，最低要求独立设门槛 |
| 成本与采样 | TRACE-Lite 只强调成功成本、五次运行，并把总分当门禁 | 补失败与人工成本，五次只作探索，P95 需足够样本 |
| 分类与漏斗 | 增长篇将互相影响的原因称严格 MECE，并直接判最后一步问题最大 | 区分诊断视角与互斥分桶，列相对和绝对流失 |
| 年化与累计 | 市场篇用“三年内”解释 SOM 年收入 | 明确第三年末的年化情景，不是三年累计收入 |
| 拆篇残留 | “前面的得分”“文末八类评测”“本文课件截图”等对象已不在当前篇 | 改定义或改向正确篇目 |
| 编辑史进正文 | 多篇介绍旧长文如何撤回、拆分，重复“最后判断” | 删除或改为读者可使用的研究方法 |

## 仍需下一轮内容建设的地方

### 28 篇研究短文：优先合并为七篇完整研究

Addy Skills、Anthropic Skills、Matt Pocock Skills、Claude Code 系统、Codex 系统、Kimi Code 系统、OpenCode 系统，各四篇。目前不少文章只有概述、一个原则与下篇预告，不能靠调小阅读时间解决。

建议每个项目先组成一篇可独立阅读的研究：项目解决的问题 → 一条具体任务链 → 关键文件/配置 → 输入输出样本 → 一个失败或限制 → 有条件的结论。内容补足到存在不同独立问题时再拆。若调整路由，应保留旧链接或做重定向。本次完成检查和局部修订，**未把这 28 篇扩写为深度源码研究，也未直接删除它们的 URL**。

### 终篇不要反复落在同一句话

工作系统、可信工程、AI 产品工作、AI 价值、能力边界等终篇都反复强调“可验证、可接管、可修正”。建议分别只保留自己的增量：责任怎么分、可靠性证据怎么变、产品节奏怎么定、总成本怎样计算、基准怎样迁移。已删明显同篇重复，跨系列的结构性重叠仍列在逐篇清单中。

### 概念文章和实测文章采用不同承诺

生产运行、路由规模、产品能力比较多为设计或公开资料分析；有参考架构不等于完成部署，有产品功能不等于通过统一评测。后续补实测应记录版本、输入、配置、实际结果及失败样本。当前没有对全部产品和论文重新跑实验，不能把这次编辑审查称作事实全量认证。

## 逐篇结论

“保留/精简”表示本次未定位到必须纠正的明显内部错误，或仅去模板；不表示所有外部事实已核验。“需补厚/合并”是后续结构问题。阅读时间单位为分钟，左为修改前，右为本次修改后。

| # | 文章 | 主状态 | 判断与处理 | 阅读时间 | 本次改动 |
| --- | --- | --- | --- | --- | --- |
| 1 | [Addy Osmani Agent Skills 研究（二）：命令如何路由到阶段 Skills](../src/content/writing/addy-agent-skills-lifecycle.md) | 需补厚/合并 | 安装—使用—反馈主线成立；缺一项 Skill 从失败样本到修改的完整记录。 | 6 → 2 | 阅读时间 |
| 2 | [Addy Osmani Agent Skills 研究（一）：先看完整研发生命周期](../src/content/writing/addy-agent-skills-overview.md) | 需补厚/合并 | 可作系列导读；单独承诺系统研究偏重，宜与机制篇合并。 | 5 → 2 | 阅读时间 |
| 3 | [Addy Osmani Agent Skills 研究（四）：Skill 应编码决策点而非口号](../src/content/writing/addy-agent-skills-synthesis.md) | 需补厚/合并 | 结尾重复验证与反馈原则；宜并入案例结论。 | 5 → 1 | 阅读时间 |
| 4 | [Addy Osmani Agent Skills 研究（三）：验证门槛如何抵抗走捷径](../src/content/writing/addy-agent-skills-verification.md) | 需补厚/合并 | 已撤回工具结果“不可伪造”的绝对保证；仍需失败用例与评分实例。 | 7 → 2 | 正文、阅读时间 |
| 5 | [Agent 评测（三）：先把题目和裁判做对，再谈排行榜](../src/content/writing/agent-evaluation-datasets.md) | 保留/精简 | 样本分层与泄漏风险分工清楚；保留实操内容，删重复图示说明。 | 6 → 6 | 去模板 |
| 6 | [Agent 评测（四）：把一次打分变成可重复的回归系统](../src/content/writing/agent-evaluation-engineering.md) | 保留/精简 | 运行器、环境、评分器分离有可执行价值；删通用图例。 | 5 → 5 | 去模板 |
| 7 | [Agent 评测（二）：成功率、稳定性与成本，不能揉成一个分数](../src/content/writing/agent-evaluation-metrics.md) | 保留/精简 | 成功率、重复成功与成本口径区分有效；保留公式和适用条件。 | 6 → 6 | 去模板 |
| 8 | [Agent 评测（五）：高分为何不能直接兑换更大的行动权](../src/content/writing/agent-evaluation-synthesis.md) | 保留/精简 | 总结仍与可靠性系列重叠；宜保留评测证据适用范围这一独特论点。 | 6 → 6 | 去模板 |
| 9 | [Agent 工作系统全景（二）：不用总分，如何比较不同 Agent](../src/content/writing/agent-landscape-comparison-methods.md) | 已修正 | 已删无校准数字曲线、强中弱矩阵和总体排名，改为来源—假设—任务证据。 | 8 → 8 | 正文 |
| 10 | [Agent 记忆设计（一）：先把记忆放回完整生命周期](../src/content/writing/agent-memory-design-competitive-analysis.md) | 保留/精简 | 记忆系统的设计坐标有用；各项目差异仍应随固定版本核对。 | 6 → 6 | 去模板 |
| 11 | [Agent 记忆设计（四）：一条记忆开始跨团队流动之后](../src/content/writing/agent-memory-governance.md) | 保留/精简 | 权限、污染和派生记忆治理分工清晰；删图例套话。 | 7 → 7 | 去模板 |
| 12 | [Agent 记忆设计（三）：找到相关记忆，只完成了一半](../src/content/writing/agent-memory-retrieval.md) | 已修正 | 已删拆篇留下的“前面的得分”悬空指代，明确不同分数量纲不能直接相加。 | 7 → 7 | 正文、去模板 |
| 13 | [Agent 记忆设计（五）：长期记忆的价值，在于能够改变认识](../src/content/writing/agent-memory-synthesis.md) | 保留/精简 | 保留适用条件；与写入、治理篇的通用总结存在重复。 | 8 → 6 | 去模板、阅读时间 |
| 14 | [Agent 记忆设计（二）：保留历史，还是维护当前事实](../src/content/writing/agent-memory-writing.md) | 已修正 | 已补来源、有效、记录三种时间；修正有历史差异却称不可逆的矛盾。 | 7 → 7 | 正文、去模板 |
| 15 | [AI 时代的产品工作（二）：从需求文档走向结果契约](../src/content/writing/agent-product-contracts-context.md) | 保留/精简 | 任务契约与上下文各有对象；未见需直接修正的明显内在矛盾。 | 6 → 6 | 正文保留 |
| 16 | [AI 时代的产品工作（三）：让任务评测进入产品工作节奏](../src/content/writing/agent-product-evaluation-rhythm.md) | 保留/精简 | 把评测放进产品节奏有增量；可补一次指标变化如何改变发布决定的案例。 | 6 → 6 | 正文保留 |
| 17 | [可信 Agent 工程（二）：能力进入真实任务后，怎样逐步扩大自治](../src/content/writing/agent-reliability-adoption.md) | 保留/精简 | 自治按任务风险分层合理；与其他系列重叠的监督成本结论宜少复述。 | 9 → 9 | 正文保留 |
| 18 | [Agent 评测（一）：先搭一张从任务到上线决策的地图](../src/content/writing/agent-system-evaluation-research.md) | 已修正 | 任务契约入口有效；已删公开文章中的旧版本编辑史。 | 6 → 6 | 正文、去模板 |
| 19 | [Agent 工作系统全景（八）：真正需要选择的，是怎样完成工作](../src/content/writing/agent-work-system-synthesis.md) | 已修正 | 已删第一段重复“最后判断”与编辑历史；保留责任分配表。 | 8 → 8 | 正文 |
| 20 | [Agent 工作系统全景（一）：先把八款产品放回三条赛道](../src/content/writing/ai-agent-landscape-2026.md) | 已修正 | 已将“综合完成度最高”改为研究案例，避免先否定排名又宣布冠军。 | 7 → 5 | 正文、阅读时间 |
| 21 | [可信 Agent 工程（一）：先看 Skills、RAG 与权限各自解决什么](../src/content/writing/ai-agent-reliability-boundaries.md) | 保留/精简 | 边界框架能组织后文；重复的闭环结论可继续压缩，未发现明确公式冲突。 | 7 → 7 | 正文保留 |
| 22 | [AI 能力与交付边界（三）：能力地图最终要回答什么值得委托](../src/content/writing/ai-capability-boundary-synthesis.md) | 保留/精简 | 结论与证据链主线一致；通用“证据、责任、接管”表述与其他终篇重复。 | 6 → 6 | 正文保留 |
| 23 | [AI 能力与交付边界（二）：用真实任务选择模型，而不是看一次演示](../src/content/writing/ai-capability-evidence-action.md) | 保留/精简 | 评测证据与可行动条件分开有用；评测数字需按来源快照持续维护。 | 7 → 3 | 阅读时间 |
| 24 | [AI 产品价值（一）：先看交付结果，再给算法能力找位置](../src/content/writing/ai-capability-product-metrics.md) | 保留/精简 | 总成本与有效交付区别明确；保留成本链，删通用图例。 | 8 → 8 | 去模板 |
| 25 | [AI 时代的产品工作（七）：产品工作的终点，是组织学习](../src/content/writing/ai-product-work-synthesis.md) | 保留/精简 | 把契约、上下文、评测合起来有作用；缺一个真正贯穿三者的失败案例。 | 7 → 7 | 正文保留 |
| 26 | [AI 产品价值（二）：测试通过之后，还需要哪些交付证据](../src/content/writing/ai-value-coding.md) | 保留/精简 | 生成速度与工程交付成本区分有效；删重复图例和阅读说明。 | 7 → 7 | 去模板 |
| 27 | [AI 产品价值（四）：文件能打开，为什么仍然不能交付](../src/content/writing/ai-value-office.md) | 保留/精简 | 格式、字段和写回作为完成条件有实用性；保留业务终态讨论。 | 8 → 8 | 去模板 |
| 28 | [AI 产品价值（五）：能力进步，为什么未必等于交付变便宜](../src/content/writing/ai-value-synthesis.md) | 保留/精简 | 方向成立但重复各篇监督成本结论；建议压缩为适用条件与反例。 | 8 → 8 | 去模板 |
| 29 | [AI 产品价值（三）：听懂一句话，不等于改对一个闹钟](../src/content/writing/ai-value-voice.md) | 保留/精简 | 超时后先核对终态的条件有用；保留该条件，删除通用画图说明。 | 7 → 7 | 去模板 |
| 30 | [可信 Agent 工程（四）：从案例到一条可落地的 Harness 建设路径](../src/content/writing/anthropic-harness-practice.md) | 保留/精简 | 实验和人机分工较具体；需持续区分本地实例与生产认证、隔离能力。 | 7 → 7 | 正文保留 |
| 31 | [可信 Agent 工程（三）：Anthropic 如何把可靠性写进 Harness](../src/content/writing/anthropic-harness.md) | 已修正 | 已修正 Hook 必然发生的承诺；其余循环与恢复建议应依任务风险采用。 | 9 → 9 | 正文 |
| 32 | [Anthropic Agent Skills 研究（三）：复杂文档 Skill 如何组织产物链](../src/content/writing/anthropic-skills-document-pipelines.md) | 需补厚/合并 | 只有管线概述，缺输入文件、步骤、结果与失败样本；建议与同系列合并。 | 7 → 2 | 阅读时间 |
| 33 | [Anthropic Agent Skills 研究（一）：先看标准、模板与示例地图](../src/content/writing/anthropic-skills-overview.md) | 需补厚/合并 | 导读重复资产分类；适合作为一篇完整研究的开头。 | 5 → 2 | 阅读时间 |
| 34 | [Anthropic Agent Skills 研究（二）：渐进披露如何控制上下文成本](../src/content/writing/anthropic-skills-progressive-disclosure.md) | 需补厚/合并 | 层次定义有用，但缺实际加载前后 token 与上下文示例。 | 6 → 2 | 阅读时间 |
| 35 | [Anthropic Agent Skills 研究（四）：可移植能力不等于可复制文本](../src/content/writing/anthropic-skills-synthesis.md) | 需补厚/合并 | 主要重复渐进披露与执行约束；可改为同篇结尾。 | 5 → 1 | 阅读时间 |
| 36 | [万级能力路由（一）：先看清 MCP、Skill 与 Agent 的系统全景](../src/content/writing/capability-routing-at-scale.md) | 保留/精简 | 路由架构职责较完整；规模化措辞需要真实目录规模和评测证据，当前是参考设计。 | 8 → 6 | 阅读时间 |
| 37 | [万级能力路由（二）：从能力描述到检索与正文精排](../src/content/writing/capability-routing-discovery.md) | 保留/精简 | 召回与精排分工清楚；保留“精排不能补漏召回”的关键限制。 | 8 → 6 | 阅读时间 |
| 38 | [万级能力路由（四）：用评测与治理建立生产信心](../src/content/writing/capability-routing-evaluation.md) | 保留/精简 | 指标与执行状态对应较具体；继续保留结果未知写入不直接重试的限制。 | 9 → 7 | 阅读时间 |
| 39 | [万级能力路由（三）：从候选列表到可执行方案](../src/content/writing/capability-routing-execution.md) | 保留/精简 | 发现与执行分开有用；调用成功仍需业务验证的边界明确。 | 9 → 6 | 阅读时间 |
| 40 | [万级能力路由（五）：重新理解路由——受约束的任务决策](../src/content/writing/capability-routing-synthesis.md) | 保留/精简 | 与发现、执行篇有重述；可重点保留不同规模下何时增加复杂度。 | 9 → 7 | 阅读时间 |
| 41 | [Agent 工作系统全景（七）：办公 Agent 的落地取决于最后一公里](../src/content/writing/china-work-agent-adoption.md) | 已修正 | 已撤回三回合预判赢家、混合量纲加权式和跨产品状态推断。 | 9 → 10 | 正文、阅读时间 |
| 42 | [Agent 工作系统全景（六）：Kimi Work、WorkBuddy 与豆包工作如何分工](../src/content/writing/china-work-agent-showdown.md) | 已修正 | 已删无依据数值曲线，改为可推翻的候选假设；跨端连续性单独核验。 | 9 → 7 | 正文、阅读时间 |
| 43 | [Claude Code 系统研究（二）：模型如何在工具证据中持续行动](../src/content/writing/claude-code-agent-loop.md) | 需补厚/合并 | 已修正 Hook 不可绕过的说法；执行图之后仍缺完整工具往返样本。 | 6 → 2 | 正文、阅读时间 |
| 44 | [Claude Code 系统研究（一）：先看编码 Agent 的扩展地图](../src/content/writing/claude-code-internals-overview.md) | 需补厚/合并 | 文章是机制导读，尚不足以单独支撑深度系统研究承诺。 | 5 → 2 | 阅读时间 |
| 45 | [Claude Code 系统研究（四）：学习发生在可审计的外部资产中](../src/content/writing/claude-code-internals-synthesis.md) | 需补厚/合并 | 已限定 Hook 表述；总结仍重复上下文、工具、权限，宜并入循环案例。 | 5 → 1 | 正文、阅读时间 |
| 46 | [Claude Code 系统研究（三）：记忆、Skill 与 Hook 不应混成一层](../src/content/writing/claude-code-memory-extension.md) | 需补厚/合并 | 已限定 Hook 匹配、同步与失败处理；仍需配置示例和触发结果。 | 7 → 2 | 正文、阅读时间 |
| 47 | [Claude Code 产品设计（一）：先看任务、执行与证据三个闭环](../src/content/writing/claude-code-product-design.md) | 保留/精简 | 产品闭环图有清晰定位；删图例套话。 | 7 → 7 | 去模板 |
| 48 | [Claude Code 产品设计（五）：Agent 产品真正设计的是责任，而不只是操作](../src/content/writing/claude-code-product-synthesis.md) | 保留/精简 | 综合段落与工作系统终篇重叠；应更聚焦界面反馈和用户接管成本。 | 6 → 6 | 去模板 |
| 49 | [Claude Code 产品设计（四）：并行和跨端，首先是状态管理问题](../src/content/writing/claude-code-session-collaboration.md) | 已修正 | 会话与 Worktree 分工保留；补 Hook 匹配、同步阻断与失败处理限制。 | 8 → 8 | 正文、去模板 |
| 50 | [Claude Code 产品设计（二）：从一句需求，到一条可以干预的任务旅程](../src/content/writing/claude-code-task-experience.md) | 保留/精简 | 过程与交付的体验拆解有用；保留具体交接点，删通用时序图说明。 | 9 → 7 | 去模板、阅读时间 |
| 51 | [Claude Code 产品设计（三）：少一点确认，不等于少一点边界](../src/content/writing/claude-code-trust.md) | 保留/精简 | 权限、证据、接管可形成检查项；避免进一步扩写泛化信任口号。 | 7 → 7 | 去模板 |
| 52 | [Codex 系统研究（二）：沙箱、审批与证据如何约束执行](../src/content/writing/codex-runtime-sandbox.md) | 需补厚/合并 | 沙箱概览偏短；需具体权限配置、拒绝样例和运行环境差异。 | 6 → 2 | 阅读时间 |
| 53 | [Codex 系统研究（三）：Skills、Memory 与 Automations 如何延长任务](../src/content/writing/codex-skills-memory-automation.md) | 需补厚/合并 | 列出了扩展对象，但缺一项自动任务的配置、运行和结果记录。 | 7 → 2 | 阅读时间 |
| 54 | [Codex 系统研究（一）：先区分开源运行时与协作产品](../src/content/writing/codex-system-overview.md) | 需补厚/合并 | 可当入口导读，单独正文信息量小；建议合并成一篇完整系统文章。 | 5 → 2 | 阅读时间 |
| 55 | [Codex 系统研究（四）：长期工作不能失去可接管性](../src/content/writing/codex-system-synthesis.md) | 需补厚/合并 | 重复执行、证据和持续任务判断；宜并入实证案例结尾。 | 5 → 1 | 阅读时间 |
| 56 | [Agent 工作系统全景（五）：两周 PoC 应该怎样比较 Coding Agent](../src/content/writing/coding-agent-harness-poc.md) | 已修正 | 已将预先宣布领先改为检查项；任务与人工审查成本框架可保留。 | 6 → 6 | 正文 |
| 57 | [Agent 工作系统全景（三）：Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../src/content/writing/coding-agent-harness-showdown.md) | 已修正 | 已去总体最强与低成本预判，删重复开源五要素表，分清 Kimi Work 与 Code 的并发口径。 | 10 → 10 | 正文 |
| 58 | [可塑 Agent Harness（一）：先把十个项目放回各自的问题](../src/content/writing/composable-agent-harness-architecture.md) | 已修正 | 已删拆分历史，直接解释为何不同层次项目不能按功能排名。 | 6 → 3 | 正文、阅读时间 |
| 59 | [可塑 Agent Harness（二）：用同一张研究卡读不同仓库](../src/content/writing/composable-agent-harness-research-method.md) | 保留/精简 | 源码阅读卡有独立价值；应作为后续短篇补证据的统一标准。 | 5 → 3 | 阅读时间 |
| 60 | [可塑 Agent Harness（三）：先完成理解，再开始关联](../src/content/writing/composable-agent-harness-synthesis.md) | 已修正 | 已改编辑历史为比较同名机制的方法；仍以研究计划为主，适合并入方法篇。 | 4 → 2 | 正文、阅读时间 |
| 61 | [DeepSeek Harness 架构（一）：先理解能力组合与事实记录这两条主线](../src/content/writing/deepseek-harness-architecture.md) | 保留/精简 | 运行时与事实记录主线明确；删重复图例，保留版本基线。 | 5 → 5 | 去模板 |
| 62 | [DeepSeek Harness 架构（二）：插件怎样出现、协作，并真正退出](../src/content/writing/deepseek-harness-composition.md) | 已修正 | 已把生命周期清理与业务回滚分开，限定 Realm 为逻辑作用域隔离。 | 9 → 9 | 正文、去模板 |
| 63 | [DeepSeek Harness 架构（四）：工具、PTC 和多 Agent，怎样不放大副作用](../src/content/writing/deepseek-harness-execution.md) | 已修正 | 已把并行“可证明属性”改为声明加测试；保留单调策略与隔离边界。 | 10 → 10 | 正文、去模板 |
| 64 | [DeepSeek Harness 架构（三）：历史不能丢，模型又不能看全部历史](../src/content/writing/deepseek-harness-state.md) | 保留/精简 | 事件日志与投影的区分有实质内容；删通用时序图说明。 | 8 → 8 | 去模板 |
| 65 | [DeepSeek Harness 架构（五）：自由不会消灭复杂度，它会改变复杂度的归属](../src/content/writing/deepseek-harness-synthesis.md) | 已修正 | 已纠正 Profile 与 Preset 混为同级选项；保留渐进采用路径。 | 8 → 8 | 正文、去模板 |
| 66 | [ECC 工程资产系统研究（二）：如何把工程经验编译到不同平台](../src/content/writing/ecc-architecture-deep-dive.md) | 已修正 | 已限定 Hook 检查触发条件；Meta-Harness 与运行时的区分有效。 | 8 → 9 | 正文、阅读时间 |
| 67 | [ECC 工程资产系统研究（三）：规则如何在事件边界真正发生](../src/content/writing/ecc-hook-runtime-memory.md) | 已修正 | 已修正标题必然执行与正文可禁用、异步不阻断的冲突。 | 7 → 7 | 正文 |
| 68 | [ECC 工程资产系统研究（四）：如何治理配置供应链与控制平面](../src/content/writing/ecc-memory-supply-chain.md) | 保留/精简 | 资产传播与权限、版本、回滚结合有具体价值，未见需直接改写的内在冲突。 | 8 → 8 | 正文保留 |
| 69 | [ECC 工程资产系统研究（一）：先看跨 Harness 的完整地图](../src/content/writing/ecc-series-overview.md) | 导航型短篇 | 短篇可作导航，不应被读作独立深度分析；阅读时间已校正。 | 5 → 2 | 阅读时间 |
| 70 | [ECC 工程资产系统研究（五）：跨平台复用必须保留能力差异](../src/content/writing/ecc-series-synthesis.md) | 导航型短篇 | 短结论与机制篇重叠，建议合并到供应链治理结尾。 | 5 → 1 | 阅读时间 |
| 71 | [Agent Harness 工程（六）：用一次故障实验，把五条边界接起来](../src/content/writing/harness-engineering-lab.md) | 保留/精简 | 有配套实验与步骤，保留；与新集成系列的区别是核心循环原理。 | 7 → 5 | 阅读时间 |
| 72 | [Agent Harness 工程（二）：什么时候继续，什么时候停止](../src/content/writing/harness-engineering-loop.md) | 保留/精简 | 循环状态与退出条件有实质内容，未见明显前后矛盾。 | 7 → 5 | 阅读时间 |
| 73 | [Agent Harness 工程（一）：一条任务如何穿过整个系统](../src/content/writing/harness-engineering-map.md) | 保留/精简 | 主线职责清晰，可作为概念入口；不需再重复新系列选型表。 | 7 → 5 | 阅读时间 |
| 74 | [Agent Harness 工程（三）：Checkpoint 之后，怎样避免重复执行](../src/content/writing/harness-engineering-recovery.md) | 保留/精简 | 重试、恢复、幂等边界值得保留；避免把恢复等同于重新运行。 | 7 → 5 | 阅读时间 |
| 75 | [Agent Harness 工程（五）：从提示注入到凭证隔离，边界放在哪里](../src/content/writing/harness-engineering-security.md) | 保留/精简 | 执行权限与隔离区分具体，作为其他 Hook 论断的统一参照。 | 7 → 5 | 阅读时间 |
| 76 | [Agent Harness 工程（四）：工具调用之前，先写清执行契约](../src/content/writing/harness-engineering-tools.md) | 保留/精简 | 工具契约有实用性；原理篇不需要再重复 MCP SDK 接线步骤。 | 7 → 5 | 阅读时间 |
| 77 | [Harness 工程基础与协议（一）：全景与并发：多个动作怎样安全地一起发生](../src/content/writing/harness-foundations-concurrency.md) | 保留/精简 | 竞争与所有权反例有实质价值；实验结果范围已限定。 | 7 → 5 | 阅读时间 |
| 78 | [Harness 工程基础与协议（二）：一致性：版本、事务与幂等各自守住什么](../src/content/writing/harness-foundations-consistency.md) | 保留/精简 | 事务、业务键与连接的保证范围分开清楚；保留。 | 7 → 4 | 阅读时间 |
| 79 | [Harness 工程基础与协议（五）：故障实验：用并发与协议反例检验运行边界](../src/content/writing/harness-foundations-lab.md) | 保留/精简 | 有明确故障与验收目标；与后续集成实验属于不同层次。 | 7 → 5 | 阅读时间 |
| 80 | [Harness 工程基础与协议（三）：MCP 生命周期：从连通到具备调用条件](../src/content/writing/harness-foundations-mcp-lifecycle.md) | 保留/精简 | 握手与具备调用条件分开有效；协议版本应继续固定。 | 7 → 4 | 阅读时间 |
| 81 | [Harness 工程基础与协议（四）：MCP 恢复：断线、取消与业务对账不能混成一步](../src/content/writing/harness-foundations-mcp-recovery.md) | 保留/精简 | 会话恢复与业务对账分开正确；保留取消不等于回滚的限制。 | 7 → 4 | 阅读时间 |
| 82 | [Harness 接入与实战（五）：从模块组装到运行：完成你的第一版 Mini Harness](../src/content/writing/harness-integration-lab.md) | 已重写 | 已重写：文件装配图、安装、CLI、真实 Python 入口、数据库检查和扩展路径。 | 7 → 5 | 正文、阅读时间 |
| 83 | [Harness 接入与实战（一）：Mini Harness 的模块、接口与默认选型](../src/content/writing/harness-integration-map.md) | 已重写 | 已重写：八个模块、输入输出、默认组件、升级条件及完整学习地图。 | 7 → 7 | 正文 |
| 84 | [Harness 接入与实战（三）：工具、执行策略与 MCP 怎样接线](../src/content/writing/harness-integration-mcp.md) | 已重写 | 已重写：直接函数与 MCP 的选择、查询创建接口、策略插入点和业务系统替换。 | 7 → 4 | 正文、阅读时间 |
| 85 | [Harness 接入与实战（二）：模型、上下文与有界循环怎样组合](../src/content/writing/harness-integration-model.md) | 已重写 | 已重写：上下文、提案契约、多轮工具结果回传与预算；标明伪代码和现有接口。 | 7 → 5 | 正文、阅读时间 |
| 86 | [Harness 接入与实战（四）：状态、幂等与验收怎样闭环](../src/content/writing/harness-integration-recovery.md) | 已重写 | 已重写：双存储、状态含义、稳定操作键、独立验收与三个退出点。 | 7 → 5 | 正文、阅读时间 |
| 87 | [Harness 运行与演进（一）：先看全景，再决定模型应该看到什么](../src/content/writing/harness-operations-context.md) | 保留/精简 | 上下文装配与压缩有具体决策条件；无需把长期记忆设为所有任务必需。 | 8 → 6 | 阅读时间 |
| 88 | [Harness 运行与演进（五）：换一个模型，为什么不是改一个名字](../src/content/writing/harness-operations-model-gateway.md) | 保留/精简 | 路由、重试、预算和供应方差异分工清楚；选型需要真实任务数据。 | 7 → 5 | 阅读时间 |
| 89 | [Harness 运行与演进（四）：增加一个 Agent，需要增加哪些责任](../src/content/writing/harness-operations-multi-agent.md) | 保留/精简 | 能说明拆分和协调成本；保留适用条件，避免并行规模当收益。 | 7 → 5 | 阅读时间 |
| 90 | [Harness 运行与演进（三）：沿着一条失败任务，把故障定位到边界](../src/content/writing/harness-operations-observability.md) | 保留/精简 | 关联 ID 与 Trace 范围区分有价值；最小实验事件不应冒充完整观测平台。 | 8 → 6 | 阅读时间 |
| 91 | [Harness 运行与演进（二）：规划怎样帮助完成任务，而不是增加步骤](../src/content/writing/harness-operations-planning.md) | 保留/精简 | 规划与任务状态分离清楚；是否需要显式计划应按复杂度判断。 | 7 → 5 | 阅读时间 |
| 92 | [Harness 运行与演进（六）：从一个 Worker 到可恢复的任务服务](../src/content/writing/harness-operations-production.md) | 保留/精简 | 覆盖生产能力但主要为设计检查项；不是已部署系统的证明。 | 8 → 5 | 阅读时间 |
| 93 | [Harness 运行与演进（七）：让每一次变化都有进入生产和退出生产的证据](../src/content/writing/harness-operations-release.md) | 保留/精简 | 发布门槛与回归责任具体；保留。 | 8 → 6 | 阅读时间 |
| 94 | [Hermes Agent 源码研究（二）：长期运行的内核如何维持](../src/content/writing/hermes-agent-architecture-deep-dive.md) | 已修正 | 已统一正文、图和表为七个分析平面，并补执行平面表项。 | 7 → 8 | 正文、阅读时间 |
| 95 | [Hermes Agent 源码研究（四）：经验如何积累而不失去边界](../src/content/writing/hermes-agent-memory-governance.md) | 已修正 | 已修正图中审批必经与正文可选审批的矛盾，加入开启/关闭分流。 | 9 → 9 | 正文 |
| 96 | [Hermes Agent 源码研究（三）：从工具循环到常驻服务](../src/content/writing/hermes-agent-runtime-services.md) | 已修正 | 已把 Toolset 从完整权限边界改为能力筛选，授权仍在后端与执行环境。 | 5 → 5 | 正文 |
| 97 | [Hermes Agent 源码研究（一）：先看长期 Agent 的完整地图](../src/content/writing/hermes-agent-series-overview.md) | 导航型短篇 | 可以承担导航，正文不足以独立构成研究；阅读时间已校正。 | 5 → 2 | 阅读时间 |
| 98 | [Hermes Agent 源码研究（五）：自我改进必须先成为可治理过程](../src/content/writing/hermes-agent-series-synthesis.md) | 导航型短篇 | 总结可读但信息量小；建议与治理篇收束部分合并。 | 5 → 1 | 阅读时间 |
| 99 | [Kimi Code 系统研究（二）：持久 Session 如何支持恢复与回放](../src/content/writing/kimi-code-session-runtime.md) | 需补厚/合并 | 只概述 Session 与运行对象，缺实际恢复前后记录。 | 6 → 2 | 阅读时间 |
| 100 | [Kimi Code 系统研究（三）：Skills 与 Agent Swarm 如何组合](../src/content/writing/kimi-code-skills-swarm.md) | 需补厚/合并 | 只概述扩展与委派，缺一次父子任务交接及结果合并样本。 | 7 → 1 | 阅读时间 |
| 101 | [Kimi Code 系统研究（一）：先看新一代 CLI 的系统地图](../src/content/writing/kimi-code-system-overview.md) | 需补厚/合并 | 导读型内容，宜与运行机制、版本边界合成一篇。 | 5 → 2 | 阅读时间 |
| 102 | [Kimi Code 系统研究（四）：可恢复与会学习之间还有一步](../src/content/writing/kimi-code-system-synthesis.md) | 需补厚/合并 | 重复模型—产品整合判断，缺前面证据推导出的独特结论。 | 5 → 1 | 阅读时间 |
| 103 | [AI 时代的产品工作（六）：组织学习速度为什么可能成为新壁垒](../src/content/writing/learning-organization-boundaries.md) | 已修正 | 已修正本篇没有截图却写“本文截图”的悬空说明；组织边界论述可保留。 | 5 → 5 | 正文 |
| 104 | [AI 能力与交付边界（一）：先分清“能做”与“可交付”](../src/content/writing/llm-agent-capability-landscape-2026.md) | 已修正 | 已将不存在的文末八类评测改为正确分篇链接；模型数字仍需来源维护。 | 7 → 8 | 正文、阅读时间 |
| 105 | [AI 时代的产品工作（四）：为什么下一代组织要学会处理未知](../src/content/writing/lu-qi-researcher-founder.md) | 保留/精简 | 主要是演讲整理与个人解释；应保持原观点、推断、例子分开。 | 6 → 6 | 正文保留 |
| 106 | [Matt Pocock Skills 研究（二）：追问与共享语言如何降低误解](../src/content/writing/mattpocock-skills-alignment.md) | 需补厚/合并 | 问题—方案对齐方向成立，缺一次 PRD 或访谈输出的前后实例。 | 6 → 1 | 阅读时间 |
| 107 | [Matt Pocock Skills 研究（三）：反馈速度为什么决定 Agent 速度](../src/content/writing/mattpocock-skills-feedback-loops.md) | 需补厚/合并 | 反馈原则偏概述，缺任务失败—反馈—修改的实际链路。 | 6 → 2 | 阅读时间 |
| 108 | [Matt Pocock Skills 研究（一）：先看真实工程失效地图](../src/content/writing/mattpocock-skills-overview.md) | 需补厚/合并 | 导读与其他 Skill 系列重复分类语言；适合合并入口。 | 5 → 2 | 阅读时间 |
| 109 | [Matt Pocock Skills 研究（四）：组合能力不应夺走人的控制权](../src/content/writing/mattpocock-skills-synthesis.md) | 需补厚/合并 | 复述对齐和反馈，尚无独立增量；建议合并。 | 5 → 1 | 阅读时间 |
| 110 | [Agent 工作系统全景（四）：Hermes、Pi 与 DeepSeek Harness 的三种路线](../src/content/writing/open-source-agent-harness-routes.md) | 已修正 | 已删连续两轮相同项目介绍与首选/第二选择排名，改为研究对象和自建代价。 | 7 → 4 | 正文、阅读时间 |
| 111 | [OpenCode 系统研究（三）：Agents、Skills 与 Plugins 如何分工](../src/content/writing/opencode-agents-skills-plugins.md) | 需补厚/合并 | 资产类型区分有用，但缺插件配置、加载及实际执行证据。 | 7 → 2 | 阅读时间 |
| 112 | [OpenCode 系统研究（二）：Client 与 Server 如何共享任务状态](../src/content/writing/opencode-client-server-runtime.md) | 需补厚/合并 | 客户端/服务端解释偏概览，缺请求、Session 与事件往返样本。 | 6 → 2 | 阅读时间 |
| 113 | [OpenCode 系统研究（一）：先看开放 Coding Agent 的地图](../src/content/writing/opencode-system-overview.md) | 需补厚/合并 | 入口介绍偏短；建议与架构和扩展示例合成完整文章。 | 5 → 2 | 阅读时间 |
| 114 | [OpenCode 系统研究（四）：开放的价值是让边界可检查](../src/content/writing/opencode-system-synthesis.md) | 需补厚/合并 | 总结可移植性但缺条件验证；宜并入实例分析。 | 5 → 1 | 阅读时间 |
| 115 | [Pi Coding Agent 源码研究（二）：最小内核如何维持正确性](../src/content/writing/pi-architecture-deep-dive.md) | 保留/精简 | 包层次和小内核选择有具体分析，保留。 | 8 → 8 | 正文保留 |
| 116 | [Pi Coding Agent 源码研究（四）：如何走向可恢复的多进程系统](../src/content/writing/pi-durable-harness-governance.md) | 保留/精简 | 持久性、扩展和治理责任分开较清楚，保留。 | 8 → 8 | 正文保留 |
| 117 | [Pi Coding Agent 源码研究（一）：先看极简 Harness 的完整地图](../src/content/writing/pi-series-overview.md) | 导航型短篇 | 可作入口导航，阅读时间已校正；不必按深度正文包装。 | 5 → 2 | 阅读时间 |
| 118 | [Pi Coding Agent 源码研究（五）：极简的价值是暴露责任](../src/content/writing/pi-series-synthesis.md) | 导航型短篇 | 小结重复小内核取舍，建议并入治理篇结尾。 | 5 → 1 | 阅读时间 |
| 119 | [Pi Coding Agent 源码研究（三）：运行历史如何成为可扩展 Session](../src/content/writing/pi-session-extension-architecture.md) | 保留/精简 | Session 树与扩展生命周期有机制细节，保留。 | 7 → 7 | 正文保留 |
| 120 | [产品分析框架（一）：先知道要做什么决定，再选择框架](../src/content/writing/product-analysis-frameworks.md) | 保留/精简 | 决策地图与贯穿案例有效，删除重复阅读说明和图例。 | 7 → 5 | 去模板、阅读时间 |
| 121 | [产品分析框架（五）：让一次发布留下结果，也留下可复用的认识](../src/content/writing/product-frameworks-delivery.md) | 已修正 | 已删第二次 4R 版本说明；责任、关闭条件与复盘证据值得保留。 | 6 → 6 | 正文、去模板 |
| 122 | [产品分析框架（四）：用户真的得到价值，生意才有机会成立](../src/content/writing/product-frameworks-growth.md) | 已修正 | 已区分相对/绝对流失，纠正交叠原因被称为严格 MECE；ROI 算术保留。 | 8 → 8 | 正文、去模板 |
| 123 | [产品分析框架（二）：从市场很大，到我们为什么能做](../src/content/writing/product-frameworks-market.md) | 已修正 | 已区分第三年末年化 SOM 与三年累计收入；市场算例算术无明显错误。 | 8 → 8 | 正文、去模板 |
| 124 | [产品分析框架（三）：从用户旅程到一次有边界的发布](../src/content/writing/product-frameworks-prioritization.md) | 保留/精简 | RICE 数值与敏感性分析相符；保留，删图例套话。 | 7 → 7 | 去模板 |
| 125 | [产品分析框架（六）：框架的终点，不是确定性，而是更好的判断](../src/content/writing/product-frameworks-synthesis.md) | 保留/精简 | 边界讨论成立；与通用“可验证可修正”结论重叠，宜聚焦框架误用。 | 7 → 7 | 去模板 |
| 126 | [AI 时代的产品工作（一）：产品经理开始设计工作系统](../src/content/writing/product-work-methodology.md) | 已修正 | 已把权限和 Hook 的绝对保证改为分层约束；其余框架需配业务实例。 | 6 → 6 | 正文 |
| 127 | [AI 时代的产品工作（五）：研究、创新与斜率怎样变成行动](../src/content/writing/researcher-founder-thinking.md) | 保留/精简 | 研究型创业者的思维展开有独立主题；未见必须直接修正的内部矛盾。 | 5 → 5 | 正文保留 |
| 128 | [可信 Agent 工程（五）：TRACE 如何从“答对”走向“可信地答对”](../src/content/writing/trace-framework-deep-dive.md) | 已修正 | 已纠正几何平均不能补偿的数学错误；论文结果聚合仍明确标为待澄清。 | 10 → 10 | 正文 |
| 129 | [可信 Agent 工程（六）：把 TRACE 变成生产评测，而不是新排行榜](../src/content/writing/trace-lite-production.md) | 已修正 | 已补论文聚合疑点、完整失败成本、小样本限制，并将独立门槛与汇总分分开。 | 7 → 8 | 正文、阅读时间 |
| 130 | [可信 Agent 工程（七）：可靠性不是一个功能，而是一条证据链](../src/content/writing/trustworthy-agent-engineering-synthesis.md) | 保留/精简 | 与工作系统、产品价值终篇同义结论较多；建议集中在可靠性证据如何随授权变化。 | 7 → 7 | 正文保留 |

## 本次验证与依据

- `npm run build` 通过；25 个系列、125 篇的结构检查无错误，知识图谱检查通过。最后一次构建已同时包含其他任务新增的 5 篇 Mem0 稿件（185 个页面、135 篇文章）；这些新增稿件不因此算作通过本次编辑审查。另对本次固定清单的 130 篇检查了写作内链与代码围栏，无错误。
- Mini Harness：16 项现有模型/集成测试通过；三处真实退出恢复均通过。本文新增的 `execute()` 调用示例实际运行成功，派发一次、资源一份。
- 下载包：只包含 8 个预期教学文件，与 `docs/harness-integration` 对应文件逐字节一致。
- 未进行在线模型调用或生产压测；未将多轮循环伪代码当作已实现功能。
- 校正 Hook 行为时参照 [Claude Code Hooks](https://code.claude.com/docs/en/hooks)；模块接口参照 [Claude 工具定义](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)、[MCP 2025-11-25 Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)、[SQLite Python 接口](https://docs.python.org/3/library/sqlite3.html)、[LangGraph 持久化](https://docs.langchain.com/oss/python/langgraph/persistence)。这些来源用于限定能力与接口，不作为“全局最佳组件”排名的依据。

后续编辑原则：每篇先写一个明确问题；每个段落至少增加机制、证据、实例、反例或决策条件中的一项；保留影响判断的边界，删除同义重述；源代码示例标明可运行片段或设计伪代码；系列长度由独立问题数决定，不为“总—分—总”形式强行拆篇。
