---
title: TencentDB Agent Memory：资产权限与发布治理
description: 从 Chat Memory、Skill、Wiki、CodeGraph 的所有权、版本、审核、ACL 与 Agent 装配理解团队治理。
publishedAt: 2026-09-05
updatedAt: 2026-09-06
type: essay
status: growing
topics:
  - TencentDB Agent Memory
  - Agent Memory
  - 人机协同
featured: false
readingTime: 5 min
---

## 定位与价值

本篇检查一条私有经验如何成为团队资产，再进入特定 Agent 的 Loadout；有权查看不等于应该自动加载。

完整定位与安装见[项目总览](/writing/tencentdb-agent-memory-overview/)。

研究基线：[TencentCloud/TencentDB-Agent-Memory @ 2ee2239](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/README.md)；源码与社区核对日期为 2026-09-06。

## 技术架构

```mermaid
flowchart TB
 U[入口：Owner / Team 操作] --> C[核心：资产可见性与装配规则]
 C --> A[适配：Memory / Skill / Wiki / CodeGraph]
 A --> D[基础设施：版本、权限与资产存储]
 D -->|允许的资产| L[Agent Loadout]
 L --> P[运行接入：Memory Proxy]
 P -->|上下文| G[目标 Agent]
 C -->|管理结果| U
```

*图 1｜按职责归纳的调用地图；箭头表示请求与结果，不表示四个独立部署服务。*

## 核心机制

```mermaid
sequenceDiagram
 participant O as 资产 Owner
 participant C as 团队控制面
 participant L as Agent Loadout
 participant A as 目标 Agent
 O->>C: 设置资产版本与可见性
 C->>C: 检查 Owner、团队和 ACL
 C->>L: 装配允许使用的资产
 A->>L: 请求当前装配内容
 L-->>A: 返回允许的资产
 Note over O,A: 统一审核与版本晋升是采用要求，不能据图推断已内置审批引擎
```

*图 2｜本篇关键流程的职责示意；部署者提出的验收要求与框架内建行为需按正文区分。*

### 资产与可见性的分工

#### 四类资产承担不同用途

Chat Memory 保存事实、偏好、决策和交互；Skill 保存带触发边界、步骤、资源和验证规则的可执行经验；Wiki 组织文档关系；CodeGraph 组织符号、调用与影响路径。它们不该使用完全相同的审核标准。

错误 Chat Memory 可能让回答失真，错误 Skill 可能直接放大执行副作用，过期 Wiki 会误导判断，陈旧 CodeGraph 会制造错误影响分析。控制面需要同时展示内容、来源、Owner、版本、状态、使用情况和绑定关系。

#### 可见性回答谁能看，Loadout 回答谁应该拿

官方设计区分 `private`、`team`、`restricted` 与面向 Agent 的定向装配。Owner 管理自己的资产，Team 角色和 ACL 决定可见范围；Loadout 再把特定资产绑定给 Scout、Builder、Reviewer 等 Agent。

这比单纯的多租户 scope 多一步：一个人有权读取团队 Wiki，不代表每个自动运行的 Agent 都应该默认获得它。最小权限不仅减少泄漏，也减少无关上下文和错误 Skill 被触发的机会。


### Loadout 与发布验证

#### 发布 Skill 应像发布代码

从会话提炼出的 Skill 只有在适用条件、输入输出、失败路径和验证方法被检查后，才有资格从个人候选进入团队资产。更新后需要版本、灰度、回滚和使用反馈；高风险 Skill 还应限制工具权限与运行环境，而不是仅靠“审核通过”四个字。

同样，文档和代码变化后，Wiki ingest 与 CodeGraph sync 必须形成明确的新鲜度信号。团队经验复用的前提，是资产能持续退出，而不是只会不断增加。

这把 [Agent 记忆设计：一条记忆跨团队流动之后](/writing/agent-memory-governance/)中的抽象治理问题具体化：Owner、状态、版本、可见性和 Agent 绑定都应成为一等字段，而不是埋在 Prompt 约定中。

#### Beta 阶段最重要的是保持可逆

官方明确把 Team Memory 标注为 Beta，路线图仍包含记忆编辑、搜索和 Agent 模板等能力。这时最稳妥的采用方式是小范围、可观察、可退出：固定提交或版本；为关键资产保留原始来源；默认私有；共享需要审核；高风险 Skill 在隔离环境验证；非必要记忆服务失败时可降级为不注入记忆，但身份、数据范围和执行权限必须保持原约束；如果关键授权依赖该服务，则应停止操作。

<details>
<summary>官方资产与权限说明</summary>

- [Memory Hub 与团队玩法](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/README_CN.md#memory-hub-不是展板是操作台)
- [团队记忆与可见性](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/README_CN.md#一支-agent-团队共享经验不共享隐私)
- [`MemoryKnowledge` 源码目录](https://github.com/TencentCloud/TencentDB-Agent-Memory/tree/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/MemoryKnowledge)

</details>

## 快速上手

安装与基础示例见[项目总览](/writing/tencentdb-agent-memory-overview/#快速上手)。本篇从同一环境继续，按文中的故障场景检查结果。

模型、执行环境与存储等共用配置，以及安装常见问题，见[总览的三个配置项](/writing/tencentdb-agent-memory-overview/#快速上手)。本篇命令仅在明确记录实跑结果时才作为通过证据。

## 生态与社区

许可证、官方集成、提交与 Issue 样本统一见[项目总览的生态与社区](/writing/tencentdb-agent-memory-overview/#生态与社区)。本篇的治理建议不表示上游已提供对应 SLA 或托管能力。

## 源码阅读路径

按下面顺序阅读固定提交：先找包或命令入口，再进入核心抽象、具体实现和测试。

| 顺序 | 目录 → 文件 | 函数、对象或检查重点 |
| --- | --- | --- |
| 1 | [MemoryProxy/package.json](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/MemoryProxy/package.json) | Proxy 启动与构建入口 |
| 2 | [MemoryProxy/src/index.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/MemoryProxy/src/index.ts) | 服务启动与退出 |
| 3 | [MemoryProxy/src/injection/pipeline.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/MemoryProxy/src/injection/pipeline.ts) | InjectionPipeline：注入管线 |
| 4 | [MemoryProxy/src/injection/adapters/openai.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/MemoryProxy/src/injection/adapters/openai.ts) | OpenAIAdapter：协议具体实现 |
| 5 | [MemoryProxy/src/common/__tests__/user-query-extractor.test.ts](https://github.com/TencentCloud/TencentDB-Agent-Memory/blob/2ee22397f6091b8cd3ea847bc1edb04d3bec0c94/MemoryProxy/src/common/__tests__/user-query-extractor.test.ts) | 用户查询抽取用例 |
