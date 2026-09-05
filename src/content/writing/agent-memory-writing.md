---
title: 保留历史，还是维护当前事实
description: 比较追加、合并和分层提炼的写入策略，建立有效时间、来源和纠错契约。
publishedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Memory
  - Context Engineering
  - Mem0
  - OpenViking
  - TencentDB Agent Memory
featured: false
readingTime: 6 min
updatedAt: 2026-09-05
---

> 版本范围：2026-09-05 核查的 Mem0 v3 迁移文档、OpenViking main 文档和 TencentDB Agent Memory 的 feat/server_team 分支。云服务、开源库与开发分支分别看待；Team Memory 仍是 Beta，本文不作统一性能排名。

> 单项目纵向阅读：[Mem0 写入管线](/writing/mem0-series-overview/) · [OpenViking Session 提交](/writing/openviking-session-governance/) · [TencentDB 分层记忆](/writing/tencentdb-agent-memory-overview/)

一月在上海、六月搬到杭州，这两条信息不一定互相矛盾。问题是查询要知道“现在”，还是要还原“一月”。如果写入时直接覆盖，历史丢了；如果只追加，读取时就需要更多判断。

## Mem0：自动追加，把当前性判断留给读取

Mem0 的旧算法会在写入时判断 `ADD / UPDATE / DELETE`，新算法改成单次 LLM 调用的 **ADD-only extraction**。自动管线只追加新事实，不覆盖或删除旧事实；显式的 update/delete API 仍然存在，由调用方主动使用。官方的 [OSS v2 → v3 迁移指南](https://docs.mem0.ai/migration/oss-v2-to-v3)明确列出了这一变化。

这个选择解决的是“历史不可逆”问题。比如：

```text
1 月：用户住在上海
6 月：用户搬到杭州
```

如果第二条直接覆盖第一条，系统能回答“现在住哪里”，却很难回答“何时搬家”“之前住哪里”。ADD-only 保存事件序列，再把“哪一条对当前问题有效”的责任交给时间属性和检索排序。

它的代价也很明确：矛盾没有消失，只是从写入阶段移动到了读取阶段。时间识别错误、排序不稳或查询缺乏时间意图时，新旧事实仍可能同时进入上下文。换言之，Mem0 选择了“保留证据，再解决冲突”，而不是“尽早形成唯一真相”。

## OpenViking：在提交边界形成可审计的记忆变更

会话先保存消息、上下文引用和工具调用，`session.commit()` 同步归档原始消息，再在后台生成摘要和长期记忆。候选记忆会先经过向量预筛，再由 LLM 对相似项做 `skip / create / merge / delete` 决策；每次提交还写入 `memory_diff.json`，保留新增、更新与删除的前后差异。详见[Session Management](https://github.com/volcengine/OpenViking/blob/0c5147cae26aec8d6d93445ec6ad86d5faff4035/docs/en/concepts/08-session.md)。

内置记忆类型已经超出用户偏好，覆盖 profile、preferences、entities、events、identity、soul、cases、trajectories 与 experiences。这说明 OpenViking 想记住的不只是“用户是谁”，还包括“Agent 做过什么、哪条轨迹有效、以后应怎样做”。

## TencentDB：保留原始层，再逐级形成认识

| 层 | 保存内容 | 解决的问题 |
| --- | --- | --- |
| L0 Conversation | 原始对话与上下文 | 保留证据与来源 |
| L1 Atom | 事实、偏好、约束、事件 | 精确召回可执行信息 |
| L2 Scenario | 按项目或场景组织的知识块 | 快速恢复任务语境 |
| L3 Core / Persona | 稳定画像、长期模式与高层认知 | 让 Agent 快速理解用户与团队 |

这套结构同时保留“原话”和“高层认识”：L3 用较小体积恢复整体语境，L2 给出场景导航，遇到具体问题再通过 BM25、向量检索与 RRF 回到 L1/L0。条数、字符与超时预算则约束最终注入。

分层的风险是摘要漂移：L3 如果基于错误 L2 继续归纳，错误会被放大成“稳定人格”；反过来，如果高层画像更新太保守，又会长期保留过期认识。因此，L0 的来源保留、L1–L3 的生成日志和人工可编辑面板不是附属功能，而是分层体系能够成立的校正机制。

## 写入触发，是延迟与可靠性的取舍

Mem0 把触发权交给应用，最灵活，也最依赖接入方正确编排。OpenViking 用显式 `commit()` 形成清楚的会话边界。腾讯方案通过 Proxy / Adapter 捕获，让未原生支持记忆的 Agent 也能接入，并在后台层层归纳。

不存在绝对最优的触发点：

- 实时写入降低丢失风险，但增加成本并容易记住尚未确认的信息；
- 会话结束写入能看到完整结果，但长会话可能迟迟不提交；
- 后台写入保护交互延迟，却必须处理任务状态、重试与最终一致性。

## 三种策略的共同难题：错误如何被纠正

这是三者最关键的架构分叉。

| 策略 | 代表 | 优点 | 风险 |
| --- | --- | --- | --- |
| 追加历史，读取时判定 | Mem0 v3 自动抽取 | 不丢时间序列，写入简单 | 冲突累积，依赖时间排序与查询理解 |
| 写入时合并、更新或删除 | OpenViking | 当前知识更紧凑，可直接浏览 | LLM 误合并会改变当前记忆；恢复依赖原始消息与差异记录是否保留 |
| 原始层保留，高层逐级归纳 | TencentDB Agent Memory | 兼顾证据与快速画像 | 层间漂移、更新策略和回溯链更复杂 |

一个成熟系统通常不会只选一边。更稳妥的组合是：原始事件 append-only；派生画像可更新；任何高层结论都保留来源、有效时间和生成版本。

## 来源时间、有效时间与记录时间必须分开

`event_time` 表示来源事件发生的时间，`valid_time` 表示事实在业务上有效的时间或区间，`recorded_at` 表示系统记录它的时间。例如 7 月 2 日收到“6 月 10 日已经搬家”的消息，系统 7 月 3 日补录：消息事件时间是 7 月 2 日，住所生效时间是 6 月 10 日，记录时间是 7 月 3 日。字段名称属于这里的设计建议，不要求各框架同名。不能把最近写入的记录简单等同于现在最可信的事实。

再加入来源和状态：用户明确纠正、文件推断与模型猜测不应拥有相同可信度。模型输出的 confidence 也不是经过校准的事实概率。

```json
{
  "subject": "user-a",
  "claim": "居住在杭州",
  "source_refs": ["session-06/message-12"],
  "recorded_at": "2026-07-01",
  "valid_from": "2026-06-01",
  "scope": "team-a/user-a",
  "status": "confirmed",
  "supersedes": "address-shanghai-v1"
}
```

这是自定义设计示例，不是三家通用 SDK 格式。

## 实践：用四个查询检查同一组记忆

| 查询 | 期望行为 |
|---|---|
| 一月住哪里？ | 使用一月有效的上海记录 |
| 现在住哪里？ | 使用当前有效的杭州记录 |
| 七月才录入，是否七月才搬家？ | 区分记录时间与生效时间 |
| 用户说“那条搬家记录是错的” | 纠正派生状态，保留必要审计依据 |

如果来源无法确定“现在”，应承认未知或询问，而不是强行选最新一条。后台写入还需要暴露 accepted、processing、completed、failed 等状态；接收成功不等于新记忆已经可读。

本篇的结论不是某一种策略获胜，而是：任何自动提炼都可能出错，系统必须明确错误保留在哪里、怎样撤回、哪些派生物需要重新生成。
