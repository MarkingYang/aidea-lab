# 知识点命名与补充

2026-09-07，按用户要求让知识文章标题直接对应术语。本轮 63 篇、22 组、8 个目录方向；用户随后明确要求“发布”，已授权通过 origin/main 发布本批内容。逐项变更见 [changes.json](changes.json)。

| 知识点 | 文章标题 | 本轮动作 |
| --- | --- | --- |
| Prompt Engineering | Prompt Engineering：提示词工程 | 新增 |
| Context Engineering | Context Engineering：上下文工程 | 改名，连接 Prompt 与 RAG |
| Loop Engineering / Graph Engineering | Loop Engineering 与 Graph Engineering：循环与图编排 | 改名，保留完整联合论述 |
| Harness | Harness：Agent 架构 | 改名，连接新增机制 |
| RAG | RAG：检索增强生成 | 新增 |
| Agent Runtime | Agent Runtime：Agent 运行时 | 新增 |
| Memory | Memory：记忆写入 / Memory：记忆检索 / Memory：记忆治理 | 三个既有完整问题分别改名 |
| LLM Gateway | LLM Gateway：模型网关 | 改名 |

统一使用 Engineering 和 LLM Gateway 的拼写。GitHub 文章继续以项目命名，不把 Haystack 改成 RAG，也不把 LiteLLM 改成模型网关知识篇。项目研究保留完整对象，知识文章通过来源和正文链接说明具体实现。

## 新增内容与证据边界

- Prompt：任务契约、指令与资料分离、Few-shot 反例、结构与语义校验、多步提示、资产版本与回归。引用 Anthropic 官方提示文档和既有 Hermes、Skills 研究。通知案例是设计示例，未运行真实模型对照。
- RAG：知识准备与查询、切分和索引版本、召回融合重排、权限与时间条件、证据装配、引用核验、固定与 Agentic 流程、分阶段评测。引用既有 Haystack 固定提交和受控实验；不宣称真实向量召回或生成质量已验证。
- Runtime：运行对象、模块协作、状态机、结果未知、日志与视图、持久执行、工具并行和取消。引用 OpenHands 源码研究、Temporal 与 Haystack 既有实验；不扩大此前的进程、服务、容器与模型验证范围。

旧 URL、已有发布时间、源代码版本和实验包保持原样；Lu Qi 原文未修改。没有新建一篇介绍 Blog 研究方法的公开文章。

## 与三类评审的关系

`docs/three-category-review/` 是更名前 60 篇内容的评审快照，包含当时正文哈希；本轮不覆盖该历史证据。新增三篇在拟议分类中属于 GitHub（技术框架）下的知识剖析，拟议数量从 43 / 2 / 15 变为 46 / 2 / 15。

本站导航尚未从 8 个方向迁移到 GitHub（技术框架）、模型、产品三类。标题与内容补充不代表导航迁移已完成，也不代表模型和产品单对象研究缺口已经补齐。

构建与链接检查验证内容结构、目录归属和引用目标，不证明技术论断已完成端到端实验。
