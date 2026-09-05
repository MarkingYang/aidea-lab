---
title: OpenViking 源码研究（三）：检索为什么要先走目录再读全文
description: 沿 Intent 分析、Typed Query、目录召回、优先队列下钻和 rerank 理解 OpenViking 检索。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - OpenViking
  - RAG
  - Context Engineering
featured: false
readingTime: 6 min
---

> OpenViking 源码研究系列：[1. 全景](/writing/openviking-series-overview/)｜[2. 分层目录](/writing/openviking-context-layers/)｜[3. 分层检索](/writing/openviking-hierarchical-retrieval/)｜[4. 提交与治理](/writing/openviking-session-governance/)｜[5. 整体判断](/writing/openviking-series-synthesis/)

平面向量检索把所有切片放进同一个候选池。OpenViking 则先判断要找哪类上下文、哪些目录值得进入，再读取少量具体内容。复杂查询因此更像一次有预算的文件系统导航。

```mermaid
flowchart LR
  Q[问题 + Session 语境] --> I[Intent Analyzer]
  I --> T[0-5 个 Typed Queries]
  T --> R[目标类型与根目录召回]
  R --> P[优先队列递归下钻]
  P --> K[Rerank]
  K --> C[候选 Context]
  C --> L[按需读取 L2]
```

*图 1｜先路由类型和目录，再进入细节，避免把整个资料库直接压入候选集。*

## Typed Query 先拆搜索意图

系统可以结合 Session 摘要、最近消息与当前问题，生成少量带目标类型和优先级的查询。某个问题可能同时需要用户 Memory、项目 Resource 和操作 Skill；拆分让它们分别在合适的命名空间搜索，再汇合为上下文。

这种路由不是为了把简单问题复杂化。对明确 URI 的读取，可以直接走确定性路径；只有跨类型、跨目录的模糊问题才值得支付意图分析与多路召回成本。

## 层级检索用目录控制搜索空间

HierarchicalRetriever 从高分目录起步，把候选放进优先队列，读取 L1 判断是否继续下钻。目录分数、类型、深度与预算共同决定下一步，最后再由 rerank 对候选排序。L0 负责便宜地发现方向，L1 负责导航，L2 在真正需要时加载。

它的优势不只是省 Token，还保留了来源结构：命中一段内容时，Agent 同时知道它属于哪个项目、目录和上下文类型。对于多文档推理，这比一堆失去父级关系的 chunk 更容易解释。

## 目录也可能制造召回盲区

如果父目录摘要漏掉一个重要子项，层级检索可能根本不会走到正确文件；目录太深会增加决策次数，太扁又退化为平面候选池。因此需要监控三类失败：目标 L2 存在但祖先未召回；L1 召回但没有继续下钻；候选正确却被 reranker 降权。

评测不能只看最终答案，还应记录 Typed Query、访问过的目录、停止原因和最终加载的 L2。这样才能区分是摄取、导航还是排序出了问题。相关的通用诊断框架可参考 [Agent 评测：把一次打分变成回归系统](/writing/agent-evaluation-engineering/)。

<details>
<summary>实现入口</summary>

- [Retrieval Mechanism](https://github.com/volcengine/OpenViking/blob/0c5147cae26aec8d6d93445ec6ad86d5faff4035/docs/en/concepts/07-retrieval.md)
- [`HierarchicalRetriever`](https://github.com/volcengine/OpenViking/blob/0c5147cae26aec8d6d93445ec6ad86d5faff4035/openviking/retrieve/hierarchical_retriever.py)
- [`IntentAnalyzer`](https://github.com/volcengine/OpenViking/blob/0c5147cae26aec8d6d93445ec6ad86d5faff4035/openviking/retrieve/intent_analyzer.py)

</details>

---

上一篇：[分层目录](/writing/openviking-context-layers/)。

下一篇：[Session 提交如何连接记忆、事务与权限](/writing/openviking-session-governance/)。
