# 按系列合并文章

> 已被后续要求纠正：文章按独立项目与完整知识问题划分，不将不同 GitHub 项目合成一篇，不为阅读时长扩写。当前依据见 [对象研究说明](../object-research/README.md)。以下仅记录此前过程。

基线为已发布提交 `d5e12d0`：88 篇文章、17 个系列、4 个知识域。用户于 2026-09-07 要求每个系列合并为一篇，并以 20～30 分钟为阅读目标。本轮仅本地预览，未发布。

保留每个系列首篇的 URL，其他文章重定向到合并文章的原文章 ID 锚点。最早发表日期保留，修订日期为 2026-09-07。正文不使用图片；来源、版本、教学假设与未执行实验的限制保留。

架构与项目研究压缩重复说明，项目研究按各对象自身设计重点整合，再回到共同故障与取舍。短系列增加完整的设计案例或判断演练，不标记为实测结果。其他系列合并章节、清理重复说明和跨篇导航。

阅读时间按现有站点规则估算：中文每分钟 350 字、英文每分钟 190 词，并计入表格和代码的阅读开销；参考资料单独阅读，不计入正文。该数字是估算，不代表实际读者测量。

| 系列 | 合并后的文章 | 原篇数 | 预计分钟 |
| --- | --- | ---: | ---: |
| harness-engineering | [Harness 架构：从执行循环到图编排与多 Agent](../../src/content/writing/prompt-context-harness-engineering.md) | 7 | 29 |
| harness-tools | [工具系统：能力发现、MCP 协议与安全执行](../../src/content/writing/harness-engineering-tools.md) | 7 | 26 |
| harness-recovery | [状态与恢复：并发冲突、幂等写入和故障验证](../../src/content/writing/harness-foundations-concurrency.md) | 3 | 21 |
| agent-memory | [上下文与记忆：从写入、检索到纠错和删除](../../src/content/writing/harness-operations-context.md) | 5 | 23 |
| harness-operations | [Agent 运行治理：模型路由、任务调度与发布回退](../../src/content/writing/harness-operations-model-gateway.md) | 5 | 24 |
| harness-integration | [Mini Harness 实战：接入模型、工具、状态与验收](../../src/content/writing/harness-integration-map.md) | 5 | 24 |
| harness-projects | [Agent 项目架构比较：控制、状态、扩展与部署取舍](../../src/content/writing/composable-agent-harness-research-method.md) | 14 | 22 |
| harness-skills | [Skills 工程：把方法、检查与经验变成可维护资产](../../src/content/writing/anthropic-skills-overview.md) | 6 | 24 |
| memory-systems | [记忆系统比较：Mem0、OpenViking 与 TencentDB](../../src/content/writing/mem0-series-overview.md) | 6 | 24 |
| agent-evaluation | [Agent 评测：任务验收、可靠性、过程证据与发布决策](../../src/content/writing/ai-agent-reliability-boundaries.md) | 7 | 29 |
| ai-capability-boundaries | [模型能力边界：从公开评测到真实任务选型](../../src/content/writing/llm-agent-capability-landscape-2026.md) | 2 | 20 |
| product-frameworks | [产品分析：从市场判断到需求取舍、增长与交付](../../src/content/writing/product-analysis-frameworks.md) | 5 | 26 |
| ai-product-work | [Agent 产品工作：结果契约、自治范围与迭代节奏](../../src/content/writing/product-work-methodology.md) | 2 | 20 |
| claude-code-design | [Agent 交互设计：以 Claude Code 看委托、信任与协作](../../src/content/writing/claude-code-product-design.md) | 3 | 21 |
| ai-product-value | [AI 产品价值：编程、语音与办公的交付成本](../../src/content/writing/ai-capability-product-metrics.md) | 4 | 25 |
| agent-work-systems | [Agent 选型：从竞品定位到任务对照与采用决策](../../src/content/writing/agent-landscape-comparison-methods.md) | 4 | 27 |
| researcher-founder | [陆奇谈研究型创业者：从处理未知到组织学习](../../src/content/writing/lu-qi-researcher-founder.md) | 3 | 20 |

逐篇来源映射见 [manifest.json](manifest.json)。原文、原目录和日期可以从基线提交读取；工作过程中的临时副本不作为新文章或研究结论。
