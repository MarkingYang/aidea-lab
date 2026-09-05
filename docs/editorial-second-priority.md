# 第二优先级长文：编排进度与 Review 清单

执行日期：2026-09-05，Asia/Shanghai。

## 第一组：Agent 工作系统全景

`ai-agent-landscape-2026`、`coding-agent-harness-showdown` 与 `china-work-agent-showdown` 原本已经互相声明为第一、第二、第三篇，但阅读时间分别为 23、31、28 分钟。它们不是三篇互不相关的文章，而是一套尚未正式注册、结构失衡的隐性系列。

本轮优先复用已有论述与一手资料，不重复制造相似内容：保留三个原 slug 作为系列入口、工程产品篇和办公产品篇，将原有章节迁移到最合适的位置，再补充比较方法、开源路线、工程 PoC、组织落地与最终综合思考。原章节没有重复进入不同文章。

### 系列目录

| 顺序 | 文章 | 角色 | 预计阅读 |
| --- | --- | --- | ---: |
| 1 | [先把八款产品放回三条赛道](../src/content/writing/ai-agent-landscape-2026.md) | 总览：建立全局地图 | 7 分钟 |
| 2 | [不用总分，如何比较不同 Agent](../src/content/writing/agent-landscape-comparison-methods.md) | 方法：建立任务与证据尺度 | 8 分钟 |
| 3 | [Claude Code、Codex 与 Kimi Code 的 Harness 分歧](../src/content/writing/coding-agent-harness-showdown.md) | 工程产品：理解默认闭环 | 10 分钟 |
| 4 | [Hermes、Pi 与 DeepSeek Harness 的三种路线](../src/content/writing/open-source-agent-harness-routes.md) | 开源架构：理解复杂度归属 | 7 分钟 |
| 5 | [两周 PoC 应该怎样比较 Coding Agent](../src/content/writing/coding-agent-harness-poc.md) | 实践：把比较变成真实任务 | 10 分钟 |
| 6 | [Kimi Work、WorkBuddy 与豆包工作如何分工](../src/content/writing/china-work-agent-showdown.md) | 办公产品：比较不同入口 | 10 分钟 |
| 7 | [办公 Agent 的落地取决于最后一公里](../src/content/writing/china-work-agent-adoption.md) | 组织实践：处理治理与采用 | 9 分钟 |
| 8 | [真正需要选择的，是怎样完成工作](../src/content/writing/agent-work-system-synthesis.md) | 总结：回到责任结构 | 8 分钟 |

阅读路径采用“总—分—总”：第一篇只搭高层骨架；第二至七篇分别回答比较、技术路线、验证与落地；第八篇不复述产品功能，而是把模型、Harness、环境与组织重新组合为工作系统，讨论监督成本、复杂度归属和可纠正性。每篇都保留全系列导航，并用结尾问题引向下一篇。

### 与已有文章怎样编排

这组系列负责横向选择，已有深度系列负责纵向理解，两者通过正文链接连接：

- 开源路线篇连接 Hermes、Pi、DeepSeek Harness 与 ECC 的架构拆解；
- 工程 PoC 连接 Agent 评测系列，复用任务契约、样本和回归语言；
- 组织落地连接产品分析框架与 AI 产品价值系列，继续讨论决策记录和交付成本；
- 系列内部的八篇导航形成稳定主路径，终篇再链接回首篇，允许带着新问题重读。

### 知识图谱维护

系列已注册到 `src/data/knowledge.json`，图谱仍由构建过程从内容集合自动生成，不维护第二份手写图数据。新增文章会进入以下关系：

1. `series`：八篇文章归入“Agent 工作系统全景”局部知识圆；
2. `keyword`：依据 frontmatter 标签连接 Coding Agent、Agent Harness、办公 Agent 等跨系列关键词；
3. `reference`：依据正文站内链接连接已有架构、评测与产品系列；
4. `similarity`：在缺少显式引用时，以受控共享标签补充弱关联。

图谱校验增加了本系列专用断言：系列中心必须存在，八篇文章必须完整归入同一系列并分别连接中心。通用断言继续保证每个构建后的文章页面恰好有一个图节点，所有边均指向有效节点，局部圆不重叠且保持在全局圆内。

### Review 重点

- [ ] 第一篇是否能在不进入产品细节时讲清三条赛道；
- [ ] 第二篇的比较方法能否真正约束后续产品判断；
- [ ] 第五、七篇是否足以让读者开展 PoC 与组织落地；
- [ ] 第八篇是否由前七篇推出新的系统认识，而非简单摘要；
- [ ] 八篇的阅读负担是否都控制在十分钟以内；
- [ ] 知识图谱中系列局部圆、跨系列引用和文章跳转是否正确。

## 第二组：可塑 Agent Harness

原方案把 Hermes、Pi 与 ECC 编排成一个十一篇对照系列，过早建立了统一结论。本轮再次拆分：母系列只保留研究地图、统一研究卡与阶段结论；十个仓库分别形成独立的“总—分—分—总”单元，完成单项目理解后才启动关联研究。

| 类型 | 独立系列 | 研究重点 |
| --- | --- | --- |
| 长期 Agent | Hermes Agent | Loop、Gateway、Memory、Skills 与学习治理 |
| Coding Harness | Claude Code、Codex、OpenCode、Kimi Code、Pi | 执行、状态、权限、扩展与恢复 |
| Skill 资产 | Addy Osmani、Anthropic、Matt Pocock | 流程、标准、渐进加载与反馈循环 |
| 跨 Harness 工程层 | ECC | 安装编译、Hook、Memory 与供应链 |

知识图谱为母系列和十个项目分别建立局部圆。文章只按真实系列归属、关键词和正文引用连接；母系列不生成项目相似性结论。Kimi CLI 已并入 Kimi Code 的研究范围，`affaan-m/ECC` 使用仓库的正确所有者名称。

第二组 Review 重点：每个入口是否先画清系统边界；中间篇是否沿状态或数据主线进入机制；终篇是否只总结本项目；跨项目判断是否被明确推迟。

## 第三组：可信 Agent 工程

`ai-agent-reliability-boundaries`、`anthropic-harness` 与 `trace-framework-deep-dive` 原来分别为 16、20、22 分钟。三篇看似分别讨论产品边界、Harness 和论文，实际构成“定义可靠性—把可靠性写进系统—验证可靠性”的同一条工程链。

| 顺序 | 文章 | 角色 | 预计阅读 |
| --- | --- | --- | ---: |
| 1 | [先看 Skills、RAG 与权限各自解决什么](../src/content/writing/ai-agent-reliability-boundaries.md) | 总览：单项机制边界 | 7 分钟 |
| 2 | [能力进入真实任务后，怎样逐步扩大自治](../src/content/writing/agent-reliability-adoption.md) | 实践：验收与授权 | 6 分钟 |
| 3 | [Anthropic 如何把可靠性写进 Harness](../src/content/writing/anthropic-harness.md) | 架构：上下文、工具与边界 | 9 分钟 |
| 4 | [从案例到一条可落地的 Harness 建设路径](../src/content/writing/anthropic-harness-practice.md) | 实践：分阶段建设 | 7 分钟 |
| 5 | [TRACE 如何从“答对”走向“可信地答对”](../src/content/writing/trace-framework-deep-dive.md) | 方法：结果与过程评测 | 8 分钟 |
| 6 | [把 TRACE 变成生产评测，而不是新排行榜](../src/content/writing/trace-lite-production.md) | 实践：TRACE-Lite | 7 分钟 |
| 7 | [可靠性不是一个功能，而是一条证据链](../src/content/writing/trustworthy-agent-engineering-synthesis.md) | 总结：任务契约与证据循环 | 7 分钟 |

图谱新增“可信 Agent 工程”局部圆，并通过正文显式连接 Agent 评测工程和可塑 Agent Harness。这样 TRACE 不会成为孤立论文节点，Anthropic Harness 也能同时参与商业闭环与开源架构的比较。

第三组 Review 重点：首篇是否明确区分方法、证据、执行边界与验收；Anthropic 案例是否支撑分阶段建设；TRACE 指标是否保留代理量和因果解释边界；终篇是否把接管与恢复视为可靠性能力，而不是失败后的补丁。

## 第四组：AI 能力与交付边界

原 `llm-agent-capability-landscape-2026` 为 12 分钟，内容同时承担能力地图、模型选择、行动建议和大段评测证据。现在拆为三篇：第一篇建立“能做”与“可交付”的边界，第二篇集中证据和行动，终篇把能力选择收束为动态委托关系。

| 顺序 | 文章 | 预计阅读 |
| --- | --- | ---: |
| 1 | [先分清“能做”与“可交付”](../src/content/writing/llm-agent-capability-landscape-2026.md) | 7 分钟 |
| 2 | [用真实任务选择模型，而不是看一次演示](../src/content/writing/ai-capability-evidence-action.md) | 7 分钟 |
| 3 | [能力地图最终要回答什么值得委托](../src/content/writing/ai-capability-boundary-synthesis.md) | 6 分钟 |

图谱以“AI 能力与交付边界”为局部圆，并显式连接 AI 产品价值、万级能力路由和 Agent 评测，避免把新的能力地图变成孤立入口。

## 第五组：AI 时代的产品工作

`product-work-methodology` 与 `lu-qi-researcher-founder` 原来分别为 18、14 分钟。一篇讨论已知任务怎样变成 Agent 产品，另一篇讨论组织怎样面对未知问题。两者合并后形成“探索未知—定义结果契约—进入可靠交付—用反馈继续学习”的完整路径。

| 顺序 | 文章 | 预计阅读 |
| --- | --- | ---: |
| 1 | [产品经理开始设计工作系统](../src/content/writing/product-work-methodology.md) | 6 分钟 |
| 2 | [从需求文档走向结果契约](../src/content/writing/agent-product-contracts-context.md) | 6 分钟 |
| 3 | [让任务评测进入产品工作节奏](../src/content/writing/agent-product-evaluation-rhythm.md) | 6 分钟 |
| 4 | [为什么下一代组织要学会处理未知](../src/content/writing/lu-qi-researcher-founder.md) | 6 分钟 |
| 5 | [研究、创新与斜率怎样变成行动](../src/content/writing/researcher-founder-thinking.md) | 5 分钟 |
| 6 | [组织学习速度为什么可能成为新壁垒](../src/content/writing/learning-organization-boundaries.md) | 5 分钟 |
| 7 | [产品工作的终点，是组织学习](../src/content/writing/ai-product-work-synthesis.md) | 7 分钟 |

图谱以正文引用连接产品分析框架和 AI 产品价值系列，同时通过 Researcher Founder、学习、产品方法论等关键词进入“产品与实践”及“认知与观察”的交叉区域。

## 第二优先级完成状态

- [x] 12 篇未系列化长文全部重新编排；
- [x] 形成 5 个新系列，共 36 篇；
- [x] 保留所有原 slug，原二级章节迁移且只出现一次；
- [x] 单篇标注阅读时间均不超过 10 分钟；
- [x] 系列导航、前后引子、终篇回看与 Mermaid 图注纳入自动检查；
- [x] 五个系列注册到知识目录，并由构建过程自动生成图节点、局部圆和跨系列关系。

## 质量校准（2026-09-05）

第二优先级已与第一优先级共用同一套构建契约。除导航和图谱关系外，本轮进一步校准文章角色与主阅读路径：

- “两周 PoC”删除重复的价值曲线与 SWOT 长表，改为任务契约、两周节奏、失败样本和统一证据，文章标题与实际交付一致；
- “可信 Agent 工程”首篇从单一大章节收束为方法、证据、反馈和影响范围四张高层地图，不在系列入口提前陷入实现细节；
- Anthropic Harness 将六条原理提升为可扫描的主章节，并把十层功能库存收束为五项系统责任；
- Hermes 记忆篇删除与系列终篇重复的架构优劣势长评，保留记忆分层、Artifact Learning、安全边界与四条可迁移原则；
- 国内办公 Agent 篇删除重复功能矩阵、五要素与 SWOT 叠加，只保留产品分工、关键断点、价值曲线和真实任务选择表。

校准后的 36 篇主阅读路径估算均不超过 10 分钟；折叠证据附录和参考资料属于可选深读。知识目录顺序、跨系列链接与图谱归属由 `check-series.mjs` 和知识图谱检查共同守护，新文档进入已有系列时必须同时更新两份声明，否则构建失败。

第二优先级的长文拆分到此完成。后续 Review 应优先确认：新增终篇是否真正从前文推出更深判断，跨系列编排是否自然，以及 5–10 分钟的阅读标签是否符合实际阅读体验。
