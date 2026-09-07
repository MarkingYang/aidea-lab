# 文章图解补充

2026-09-07，按用户要求补充产品路线图、竞品分析矩阵，以及技术架构、数据流、状态机和时序图。本轮为 19 篇文章添加 50 张图，文章总数仍为 63；用户已于 2026-09-07 授权发布至 origin/main。

## 范围与依据

图表围绕具体论述选择：8 篇已有源码研究各补四个视角，5 篇核心技术文章按问题补充，6 篇产品文章补路线图或矩阵。没有为每一篇产品方法文虚构竞品，也没有把模型综述或 Lu Qi 阅读改造成架构研究。

图中关系来自对应章节现有事实、设计或实验，资料截点不变。每图紧邻文字说明，区分源码事实、文档基线、设计建议和受控实验。产品路线图不表示厂商发布承诺；矩阵不使用未经实测的数字、分数或强弱坐标。

用户本次明确要求解释图，覆盖原先文章不使用图的默认限制。沿用站点 Mermaid 渲染、缩放与 SVG 导出；正文说明与可编辑图源码同时保留。没有引入图片附件或新的发布服务。

| 文章 | 图表数 | 类型 |
| --- | ---: | --- |
| [product-work-methodology](../../src/content/writing/product-work-methodology.md) | 1 | 产品路线图 |
| [product-frameworks-prioritization](../../src/content/writing/product-frameworks-prioritization.md) | 1 | 产品路线图 |
| [claude-code-product-design](../../src/content/writing/claude-code-product-design.md) | 1 | 产品路线图 |
| [coding-agent-harness-showdown](../../src/content/writing/coding-agent-harness-showdown.md) | 1 | 竞品分析矩阵图 |
| [china-work-agent-showdown](../../src/content/writing/china-work-agent-showdown.md) | 2 | 竞品分析矩阵图、产品采用路线图 |
| [agent-landscape-comparison-methods](../../src/content/writing/agent-landscape-comparison-methods.md) | 2 | 产品选型路线图、竞品分析矩阵图 |
| [langgraph-runtime-architecture](../../src/content/writing/langgraph-runtime-architecture.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [litellm-gateway-architecture](../../src/content/writing/litellm-gateway-architecture.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [opa-policy-architecture](../../src/content/writing/opa-policy-architecture.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [openhands-sdk-architecture](../../src/content/writing/openhands-sdk-architecture.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [haystack-pipeline-architecture](../../src/content/writing/haystack-pipeline-architecture.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [temporal-durable-execution](../../src/content/writing/temporal-durable-execution.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [prompt-context-harness-engineering](../../src/content/writing/prompt-context-harness-engineering.md) | 2 | 系统架构图、数据流图 |
| [agent-runtime](../../src/content/writing/agent-runtime.md) | 4 | 系统架构图、状态机图、时序图、数据流图 |
| [harness-engineering-loop](../../src/content/writing/harness-engineering-loop.md) | 2 | 状态机图、数据流图 |
| [harness-operations-context](../../src/content/writing/harness-operations-context.md) | 1 | 数据流图 |
| [rag](../../src/content/writing/rag.md) | 1 | 数据流图 |
| [kimi-code-system-overview](../../src/content/writing/kimi-code-system-overview.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |
| [opencode-system-overview](../../src/content/writing/opencode-system-overview.md) | 4 | 系统架构图、数据流图、状态机图、时序图 |

## 文件与验证

- `specs.json`：图的目标章节、类型、说明和 Mermaid 源码。
- `manifest.json`：修改前后正文哈希及逐篇覆盖范围。
- `apply.py`：一次性插入器；检测重复标记，保留发布时间并重估阅读时间。
- `check-browser.mjs`：实际页面渲染检查，覆盖 1440 / 390 像素、明暗主题、缩放和页面边界。

构建、目录与知识图谱检查已通过。浏览器结果另见 `browser-results.json`；该检查只证明图表可渲染和交互，不证明项目实现已新增实测。

原有旧版评审与命名文档中的哈希是历史快照，不用新正文覆盖它们。

最终验证：50 张图在桌面和手机、明暗两种主题下渲染通过，页面无横向溢出；宽图可在图框内横向滚动。代表性截图已人工查看并修正重叠标签及小图过度放大。最终路线图另验证 SVG 下载与全屏。修复了正文行内长代码标识造成的手机页面溢出。原正文、原发布日期与 Lu Qi 原文保持不变。
