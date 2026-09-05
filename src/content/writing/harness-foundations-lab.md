---
title: Harness 工程基础与协议（五）：故障实验：用并发与协议反例检验运行边界
description: 运行标准库实验，验证版本冲突、原子去重、握手闸门、目录失效和取消竞态，并明确模拟与真实接入的距离。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Harness
  - AI 工程
  - MCP
featured: false
readingTime: 7 min
---

> Harness 工程基础与协议系列：[1. 全景与并发](/writing/harness-foundations-concurrency/)｜[2. 一致性](/writing/harness-foundations-consistency/)｜[3. MCP 生命周期](/writing/harness-foundations-mcp-lifecycle/)｜[4. MCP 恢复](/writing/harness-foundations-mcp-recovery/)｜[5. 故障实验](/writing/harness-foundations-lab/)

前四篇把并发正确性、业务身份和连接生命周期放到了同一张图里。本篇提供一个可以下载、重复运行和修改的实验，将这些概念变成失败时也能检查的断言。

[下载实验包](/labs/harness-foundations.zip)。需要 Python 3.10+，只使用标准库，不需要模型密钥。

## 先运行，再对照证据

解压并进入 `harness-foundations` 目录后执行：

```sh
python3 lab.py
python3 -m unittest discover -p 'test_*.py' -v
```

包内有 `README.md`、`lab.py` 和 `test_contracts.py`。演示使用临时目录，每次运行重新创建数据库，结束后自动清理。

参考输出如下。线程竞争的获胜者不固定，但这些汇总值应保持一致：

```json
{
  "concurrent_updates_accepted": 1,
  "document_version": 2,
  "late_response": "ignored_response",
  "needs_reconciliation": ["review-001:ticket"],
  "actual_ticket": [1, "source-001"],
  "actual_ticket_count": 1
}
```

一个更新被接受，对应文档版本从 1 变成 2。随后演示先创建工单，再模拟响应丢失和重连；旧响应被忽略，实际工单仍然只有一个。

`needs_reconciliation` 仍包含操作键是有意保留的：独立查询发现工单，不会自动修改协议模型的待对账集合。完整 Harness 还应检查目标与参数，再持久化任务终态。

## 哪些部分真正执行，哪些部分受控模拟

| 层次 | 实验实际做了什么 | 没有验证什么 |
| --- | --- | --- |
| 并发存储 | 两线程、独立连接、真实 SQLite 提交 | 多机器竞争、目标数据库隔离级别 |
| 工单去重 | 唯一约束、事务内查找与创建 | 多租户身份、去重记录过期 |
| 协议状态 | Python 字典消息、等待表和受控事件 | 网络传输、完整 Schema 与协议一致性 |
| 连接中断 | 清除等待项并模拟重新初始化 | 真实 TCP、HTTP、SSE 或子进程故障 |
| 业务观察 | 读取实际提交的本地工单 | 远端最终一致性与任务级自动验收 |

特别要注意：协议等待表、目录状态和未知操作集合都在内存中。SQLite 资源可以被新建的存储对象重新读取，不代表协议状态已经支持进程崩溃恢复。

[第一批故障实验](/writing/harness-engineering-lab/)提供了持久化执行意图和双库恢复；本包则集中验证并发与消息边界。两套实验可以互相补充，但目前没有合并成一个生产 Runtime。

## 16 项测试按失败责任划分

| 组别 | 数量 | 关键断言 |
| --- | --- | --- |
| 并发与业务状态 | 5 | 旧版本拒绝、新版本可提交、并发重试只有一个资源、同键异参拒绝、断线不撤销副作用 |
| 初始化与能力 | 4 | 初始化前禁用工具、完成通知后开放、版本不兼容断开、缺少能力拒绝调用 |
| 关联与取消 | 4 | 倒序响应正确关联、取消后忽略迟到响应、初始化不可取消、未知取消不改变状态 |
| 目录与错误 | 3 | 旧目录响应不能恢复缓存、区分协议与工具错误、畸形响应不完成请求 |

这些测试在编写时全部通过。数量描述的是覆盖的契约，不是 MCP 兼容性得分，也不是 Agent 任务成功率。

## 用小改动理解测试为何存在

可以在实验副本中尝试三种变化：去掉更新条件中的版本判断；把工单去重检查移到事务之外并移除唯一约束；允许旧目录响应重新将缓存标为有效。

先预测哪项断言会失败，再运行测试。对并发错误，某些错误实现不一定每次都暴露；应使用屏障控制关键交错，而不是重复运行直到碰到一次异常。实验当前已有的屏障确保两个更新者先读到同一版本。

这一步的目标是建立因果解释：某项机制具体阻止了哪个反例。若移除一个机制后没有相关测试失败，要么测试覆盖不足，要么它并不负责你以为的保证。

## 下一步接入真实服务时保留什么

真实接入应固定 SDK 与协议版本，在本地测试服务器上增加消息编码、分片、异常退出、会话失效和认证失败测试；再接实际写工具，验证业务操作键和权威查询。

当前实验没有实现完整 JSON-RPC 验证、工具分页、双向服务端请求、OAuth、HTTP/SSE、Tasks 或任何模型调用。协议依据来自 [MCP 2025-11-25 生命周期](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle)及各篇所列规范；实验中的保守闸门和目录修订策略属于本文设计。

本系列到此完成。回到[全景与并发](/writing/harness-foundations-concurrency/)，应能为每个共享写入说明版本与去重范围，为每次断线说明哪些事实仍未知，再用故障测试检验这些说法。真实模型、真实传输和生产运行验证，仍是后续需要补齐的部分。

上一篇：[MCP 恢复](/writing/harness-foundations-mcp-recovery/)。


继续实践：[Harness 接入与实战](/writing/harness-integration-map/)。
