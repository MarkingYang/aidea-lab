# 内容体系重构计划 · 2026-09-05

> 执行已完成，见[重构结果](content-restructure-result.md)。下方保留制定时的 145 → 83 篇基线；执行期间新增 1 篇，当前总数为 84 篇。

## 目标与执行顺序

将当前 **145 篇、29 个系列**整理为 **4 个知识域、17 个专题、83 篇文章**。以当前工作区为输入，保留上轮已经修正的正文；已新增的三组记忆系统文章也纳入归类与合并。

1. 确定下列知识域、专题与逐篇归宿。
2. 先完成实质内容合并：保留机制、代码、证据、实验下载与独有结论，删除重复导读和总结。合并不是给旧文章加目录后原样拼接。
3. 删除失去独立问题的旧文章源文件；建立旧文章和旧专题 URL 到新归宿的重定向。
4. 按单一注册表生成目录、专题、文章面包屑、前后篇与搜索分类。允许一篇或两篇专题，取消必须三篇及强制“总—分—总”。
5. 用合并后的正文重建图谱：知识域 → 专题 → 文章；保留真实引用与关键词，删除旧节点，导航不算正文引用。
6. 检查全部归属、旧链接迁移、无孤立节点、合并内容、图表、桌面和移动端阅读。

## 目录形式

目录固定为“知识域 → 专题 → 文章”三级。项目名作为文章对象，不与循环、状态、权限等机制混成同级专题。项目细节无法合理合并时，保留在“Agent Harness → 项目实现研究”下，标题明确项目与机制。

### Agent Harness

- **架构与运行循环**（2 篇）：任务契约、控制循环与停止条件。
- **工具、协议与执行边界**（7 篇）：工具契约、MCP 生命周期、安全边界与能力路由。
- **状态、并发与恢复**（3 篇）：区分运行状态和业务事实，处理竞争、重复与结果未知。
- **上下文与记忆机制**（5 篇）：按装配、写入、检索和治理组织记忆生命周期。
- **运行治理与发布**（5 篇）：模型网关、协作、观测、调度和版本发布。
- **Mini Harness 实战**（5 篇）：按模块选型、模型循环、工具策略、状态验收与运行步骤组装。
- **项目实现研究**（14 篇）：沿实际项目研究循环、状态、扩展和执行边界。
- **Skills 与工程资产**（6 篇）：标准、工程方法、Hook 运行时与跨平台资产治理。
- **记忆系统实现**（6 篇）：对照 Mem0、OpenViking、TencentDB 的数据流与治理边界。

### 评测与能力边界

- **评测体系与可靠性**（7 篇）：任务边界、指标、样本、回归与 TRACE 过程评测。
- **模型能力与任务边界**（2 篇）：将公开评测转成带场景、证据与责任条件的使用判断。

### 产品与交付

- **产品分析方法**（5 篇）：市场、优先级、增长和复盘，按实际决策组织框架。
- **任务契约与产品节奏**（2 篇）：把目标、上下文与评测接进产品团队工作。
- **Agent 交互与协作**（3 篇）：以 Claude Code 为案例分析任务旅程、信任与并行协作。
- **场景价值与交付成本**（4 篇）：用编程、语音和办公案例计算真实交付价值。
- **产品比较与采用**（4 篇）：比较方法与 PoC、工程产品、办公产品和组织采用。

### 研究与认知

- **研究、创业与组织学习**（3 篇）：研究型创业的原始观点、推演方法和组织边界。

## 合并与删除规则

- 四个 Harness 系列的 23 篇按职责重新分配，不再四次从同一个工单恢复问题开场。原理与实战保持不同承诺；基础实验集中到故障实验文章，Mini Harness 保留具体组装步骤。
- 七组四篇研究合为七篇：Claude Code、Codex、Kimi Code、OpenCode、Anthropic Skills、Addy Skills、Matt Pocock Skills。
- Hermes、Pi、DeepSeek、ECC 保留有独立机制的深度文章；独立导读和泛化总结删除，独有信息进入相应机制文章。
- Mem0、OpenViking、TencentDB 各从五篇整理为“架构与数据流 / 治理与部署边界”两篇。
- 评测与可靠性合并到同一知识域；TRACE 保留公式与落地两篇，避免再建一套重复的 Harness 总论。
- 产品比较集中到比较与 PoC、工程产品、办公产品、组织采用；删除无独立增量的全景与终篇。
- 产品方法、交互案例、场景价值、研究型创业分别归类；重复终篇的有用条件提取到对应文章。

## 逐篇迁移表

保留 URL 的目标文章可以改标题；被删文章通过直接重定向到目标文章保留外部访问，不保留空壳文章和图谱节点。`删除冗余`指删除独立篇目，其独有证据仍检查并提取。

| 原文章 | 操作 | 最终文章 |
| --- | --- | --- |
| `addy-agent-skills-lifecycle` | 合并内容后删除旧篇 | `addy-agent-skills-overview` |
| `addy-agent-skills-overview` | 保留并归类 | `addy-agent-skills-overview` |
| `addy-agent-skills-synthesis` | 删除冗余篇目，提取独有内容 | `addy-agent-skills-overview` |
| `addy-agent-skills-verification` | 合并内容后删除旧篇 | `addy-agent-skills-overview` |
| `agent-evaluation-datasets` | 保留并归类 | `agent-evaluation-datasets` |
| `agent-evaluation-engineering` | 保留并归类 | `agent-evaluation-engineering` |
| `agent-evaluation-metrics` | 保留并归类 | `agent-evaluation-metrics` |
| `agent-evaluation-synthesis` | 删除冗余篇目，提取独有内容 | `agent-evaluation-engineering` |
| `agent-landscape-comparison-methods` | 保留并归类 | `agent-landscape-comparison-methods` |
| `agent-memory-design-competitive-analysis` | 保留并归类 | `agent-memory-design-competitive-analysis` |
| `agent-memory-governance` | 保留并归类 | `agent-memory-governance` |
| `agent-memory-retrieval` | 保留并归类 | `agent-memory-retrieval` |
| `agent-memory-synthesis` | 删除冗余篇目，提取独有内容 | `agent-memory-governance` |
| `agent-memory-writing` | 保留并归类 | `agent-memory-writing` |
| `agent-product-contracts-context` | 合并内容后删除旧篇 | `product-work-methodology` |
| `agent-product-evaluation-rhythm` | 保留并归类 | `agent-product-evaluation-rhythm` |
| `agent-reliability-adoption` | 合并内容后删除旧篇 | `ai-agent-reliability-boundaries` |
| `agent-system-evaluation-research` | 保留并归类 | `agent-system-evaluation-research` |
| `agent-work-system-synthesis` | 删除冗余篇目，提取独有内容 | `agent-landscape-comparison-methods` |
| `ai-agent-landscape-2026` | 合并内容后删除旧篇 | `agent-landscape-comparison-methods` |
| `ai-agent-reliability-boundaries` | 保留并归类 | `ai-agent-reliability-boundaries` |
| `ai-capability-boundary-synthesis` | 删除冗余篇目，提取独有内容 | `ai-capability-evidence-action` |
| `ai-capability-evidence-action` | 保留并归类 | `ai-capability-evidence-action` |
| `ai-capability-product-metrics` | 保留并归类 | `ai-capability-product-metrics` |
| `ai-product-work-synthesis` | 删除冗余篇目，提取独有内容 | `product-work-methodology` |
| `ai-value-coding` | 保留并归类 | `ai-value-coding` |
| `ai-value-office` | 保留并归类 | `ai-value-office` |
| `ai-value-synthesis` | 删除冗余篇目，提取独有内容 | `ai-capability-product-metrics` |
| `ai-value-voice` | 保留并归类 | `ai-value-voice` |
| `anthropic-harness` | 合并内容后删除旧篇 | `harness-engineering-map` |
| `anthropic-harness-practice` | 合并内容后删除旧篇 | `harness-engineering-map` |
| `anthropic-skills-document-pipelines` | 合并内容后删除旧篇 | `anthropic-skills-overview` |
| `anthropic-skills-overview` | 保留并归类 | `anthropic-skills-overview` |
| `anthropic-skills-progressive-disclosure` | 合并内容后删除旧篇 | `anthropic-skills-overview` |
| `anthropic-skills-synthesis` | 删除冗余篇目，提取独有内容 | `anthropic-skills-overview` |
| `capability-routing-at-scale` | 保留并归类 | `capability-routing-at-scale` |
| `capability-routing-discovery` | 保留并归类 | `capability-routing-discovery` |
| `capability-routing-evaluation` | 保留并归类 | `capability-routing-evaluation` |
| `capability-routing-execution` | 保留并归类 | `capability-routing-execution` |
| `capability-routing-synthesis` | 删除冗余篇目，提取独有内容 | `capability-routing-evaluation` |
| `china-work-agent-adoption` | 保留并归类 | `china-work-agent-adoption` |
| `china-work-agent-showdown` | 保留并归类 | `china-work-agent-showdown` |
| `claude-code-agent-loop` | 合并内容后删除旧篇 | `claude-code-internals-overview` |
| `claude-code-internals-overview` | 保留并归类 | `claude-code-internals-overview` |
| `claude-code-internals-synthesis` | 删除冗余篇目，提取独有内容 | `claude-code-internals-overview` |
| `claude-code-memory-extension` | 合并内容后删除旧篇 | `claude-code-internals-overview` |
| `claude-code-product-design` | 保留并归类 | `claude-code-product-design` |
| `claude-code-product-synthesis` | 删除冗余篇目，提取独有内容 | `claude-code-product-design` |
| `claude-code-session-collaboration` | 保留并归类 | `claude-code-session-collaboration` |
| `claude-code-task-experience` | 合并内容后删除旧篇 | `claude-code-product-design` |
| `claude-code-trust` | 保留并归类 | `claude-code-trust` |
| `codex-runtime-sandbox` | 合并内容后删除旧篇 | `codex-system-overview` |
| `codex-skills-memory-automation` | 合并内容后删除旧篇 | `codex-system-overview` |
| `codex-system-overview` | 保留并归类 | `codex-system-overview` |
| `codex-system-synthesis` | 删除冗余篇目，提取独有内容 | `codex-system-overview` |
| `coding-agent-harness-poc` | 合并内容后删除旧篇 | `agent-landscape-comparison-methods` |
| `coding-agent-harness-showdown` | 保留并归类 | `coding-agent-harness-showdown` |
| `composable-agent-harness-architecture` | 合并内容后删除旧篇 | `composable-agent-harness-research-method` |
| `composable-agent-harness-research-method` | 保留并归类 | `composable-agent-harness-research-method` |
| `composable-agent-harness-synthesis` | 删除冗余篇目，提取独有内容 | `composable-agent-harness-research-method` |
| `deepseek-harness-architecture` | 合并内容后删除旧篇 | `deepseek-harness-composition` |
| `deepseek-harness-composition` | 保留并归类 | `deepseek-harness-composition` |
| `deepseek-harness-execution` | 保留并归类 | `deepseek-harness-execution` |
| `deepseek-harness-state` | 保留并归类 | `deepseek-harness-state` |
| `deepseek-harness-synthesis` | 删除冗余篇目，提取独有内容 | `deepseek-harness-execution` |
| `ecc-architecture-deep-dive` | 保留并归类 | `ecc-architecture-deep-dive` |
| `ecc-hook-runtime-memory` | 保留并归类 | `ecc-hook-runtime-memory` |
| `ecc-memory-supply-chain` | 保留并归类 | `ecc-memory-supply-chain` |
| `ecc-series-overview` | 删除冗余篇目，提取独有内容 | `ecc-architecture-deep-dive` |
| `ecc-series-synthesis` | 删除冗余篇目，提取独有内容 | `ecc-memory-supply-chain` |
| `harness-engineering-lab` | 合并内容后删除旧篇 | `harness-foundations-lab` |
| `harness-engineering-loop` | 保留并归类 | `harness-engineering-loop` |
| `harness-engineering-map` | 保留并归类 | `harness-engineering-map` |
| `harness-engineering-recovery` | 保留并归类 | `harness-engineering-recovery` |
| `harness-engineering-security` | 保留并归类 | `harness-engineering-security` |
| `harness-engineering-tools` | 保留并归类 | `harness-engineering-tools` |
| `harness-foundations-concurrency` | 保留并归类 | `harness-foundations-concurrency` |
| `harness-foundations-consistency` | 合并内容后删除旧篇 | `harness-engineering-recovery` |
| `harness-foundations-lab` | 保留并归类 | `harness-foundations-lab` |
| `harness-foundations-mcp-lifecycle` | 保留并归类 | `harness-foundations-mcp-lifecycle` |
| `harness-foundations-mcp-recovery` | 合并内容后删除旧篇 | `harness-foundations-mcp-lifecycle` |
| `harness-integration-lab` | 保留并归类 | `harness-integration-lab` |
| `harness-integration-map` | 保留并归类 | `harness-integration-map` |
| `harness-integration-mcp` | 保留并归类 | `harness-integration-mcp` |
| `harness-integration-model` | 保留并归类 | `harness-integration-model` |
| `harness-integration-recovery` | 保留并归类 | `harness-integration-recovery` |
| `harness-operations-context` | 保留并归类 | `harness-operations-context` |
| `harness-operations-model-gateway` | 保留并归类 | `harness-operations-model-gateway` |
| `harness-operations-multi-agent` | 保留并归类 | `harness-operations-multi-agent` |
| `harness-operations-observability` | 保留并归类 | `harness-operations-observability` |
| `harness-operations-planning` | 合并内容后删除旧篇 | `harness-engineering-loop` |
| `harness-operations-production` | 保留并归类 | `harness-operations-production` |
| `harness-operations-release` | 保留并归类 | `harness-operations-release` |
| `hermes-agent-architecture-deep-dive` | 保留并归类 | `hermes-agent-architecture-deep-dive` |
| `hermes-agent-memory-governance` | 保留并归类 | `hermes-agent-memory-governance` |
| `hermes-agent-runtime-services` | 保留并归类 | `hermes-agent-runtime-services` |
| `hermes-agent-series-overview` | 删除冗余篇目，提取独有内容 | `hermes-agent-architecture-deep-dive` |
| `hermes-agent-series-synthesis` | 删除冗余篇目，提取独有内容 | `hermes-agent-memory-governance` |
| `kimi-code-session-runtime` | 合并内容后删除旧篇 | `kimi-code-system-overview` |
| `kimi-code-skills-swarm` | 合并内容后删除旧篇 | `kimi-code-system-overview` |
| `kimi-code-system-overview` | 保留并归类 | `kimi-code-system-overview` |
| `kimi-code-system-synthesis` | 删除冗余篇目，提取独有内容 | `kimi-code-system-overview` |
| `learning-organization-boundaries` | 保留并归类 | `learning-organization-boundaries` |
| `llm-agent-capability-landscape-2026` | 保留并归类 | `llm-agent-capability-landscape-2026` |
| `lu-qi-researcher-founder` | 保留并归类 | `lu-qi-researcher-founder` |
| `mattpocock-skills-alignment` | 合并内容后删除旧篇 | `mattpocock-skills-overview` |
| `mattpocock-skills-feedback-loops` | 合并内容后删除旧篇 | `mattpocock-skills-overview` |
| `mattpocock-skills-overview` | 保留并归类 | `mattpocock-skills-overview` |
| `mattpocock-skills-synthesis` | 删除冗余篇目，提取独有内容 | `mattpocock-skills-overview` |
| `mem0-add-pipeline` | 合并内容后删除旧篇 | `mem0-series-overview` |
| `mem0-hybrid-retrieval` | 合并内容后删除旧篇 | `mem0-series-overview` |
| `mem0-production-boundaries` | 保留并归类 | `mem0-production-boundaries` |
| `mem0-series-overview` | 保留并归类 | `mem0-series-overview` |
| `mem0-series-synthesis` | 删除冗余篇目，提取独有内容 | `mem0-production-boundaries` |
| `open-source-agent-harness-routes` | 合并内容后删除旧篇 | `composable-agent-harness-research-method` |
| `opencode-agents-skills-plugins` | 合并内容后删除旧篇 | `opencode-system-overview` |
| `opencode-client-server-runtime` | 合并内容后删除旧篇 | `opencode-system-overview` |
| `opencode-system-overview` | 保留并归类 | `opencode-system-overview` |
| `opencode-system-synthesis` | 删除冗余篇目，提取独有内容 | `opencode-system-overview` |
| `openviking-context-layers` | 合并内容后删除旧篇 | `openviking-series-overview` |
| `openviking-hierarchical-retrieval` | 合并内容后删除旧篇 | `openviking-series-overview` |
| `openviking-series-overview` | 保留并归类 | `openviking-series-overview` |
| `openviking-series-synthesis` | 删除冗余篇目，提取独有内容 | `openviking-session-governance` |
| `openviking-session-governance` | 保留并归类 | `openviking-session-governance` |
| `pi-architecture-deep-dive` | 保留并归类 | `pi-architecture-deep-dive` |
| `pi-durable-harness-governance` | 保留并归类 | `pi-durable-harness-governance` |
| `pi-series-overview` | 删除冗余篇目，提取独有内容 | `pi-architecture-deep-dive` |
| `pi-series-synthesis` | 删除冗余篇目，提取独有内容 | `pi-durable-harness-governance` |
| `pi-session-extension-architecture` | 保留并归类 | `pi-session-extension-architecture` |
| `product-analysis-frameworks` | 保留并归类 | `product-analysis-frameworks` |
| `product-frameworks-delivery` | 保留并归类 | `product-frameworks-delivery` |
| `product-frameworks-growth` | 保留并归类 | `product-frameworks-growth` |
| `product-frameworks-market` | 保留并归类 | `product-frameworks-market` |
| `product-frameworks-prioritization` | 保留并归类 | `product-frameworks-prioritization` |
| `product-frameworks-synthesis` | 删除冗余篇目，提取独有内容 | `product-frameworks-delivery` |
| `product-work-methodology` | 保留并归类 | `product-work-methodology` |
| `researcher-founder-thinking` | 保留并归类 | `researcher-founder-thinking` |
| `tencentdb-agent-memory-governance` | 保留并归类 | `tencentdb-agent-memory-governance` |
| `tencentdb-agent-memory-layers` | 合并内容后删除旧篇 | `tencentdb-agent-memory-overview` |
| `tencentdb-agent-memory-overview` | 保留并归类 | `tencentdb-agent-memory-overview` |
| `tencentdb-agent-memory-proxy` | 合并内容后删除旧篇 | `tencentdb-agent-memory-overview` |
| `tencentdb-agent-memory-synthesis` | 删除冗余篇目，提取独有内容 | `tencentdb-agent-memory-governance` |
| `trace-framework-deep-dive` | 保留并归类 | `trace-framework-deep-dive` |
| `trace-lite-production` | 保留并归类 | `trace-lite-production` |
| `trustworthy-agent-engineering-synthesis` | 删除冗余篇目，提取独有内容 | `ai-agent-reliability-boundaries` |
