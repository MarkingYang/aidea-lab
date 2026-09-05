---
title: Harness 工程基础与协议（四）：MCP 恢复：断线、取消与业务对账不能混成一步
description: 区分 stdio 与 Streamable HTTP，理解会话和事件恢复的边界，处理取消竞态与响应丢失后的业务结果未知。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Harness
  - AI 工程
  - MCP
featured: false
readingTime: 4 min
---

> Harness 工程基础与协议系列：[1. 全景与并发](/writing/harness-foundations-concurrency/)｜[2. 一致性](/writing/harness-foundations-consistency/)｜[3. MCP 生命周期](/writing/harness-foundations-mcp-lifecycle/)｜[4. MCP 恢复](/writing/harness-foundations-mcp-recovery/)｜[5. 故障实验](/writing/harness-foundations-lab/)

客户端发出创建工单请求，服务端已完成提交，响应却在途中丢失。此时界面显示连接中断。重新连接能恢复通信，但不能仅凭连接状态判断是否应该再创建一次工单。

要处理这个场景，先分清连接、请求、业务操作分别记录了什么。

## 两种传输需要不同的运行管理

MCP 2025-11-25 定义 stdio 与 Streamable HTTP。stdio 常用于客户端启动本地子进程，协议消息走标准输入输出，标准输出不能混入普通日志。Streamable HTTP 使用 HTTP 端点，并可通过 SSE 传递消息。[MCP 传输规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)

| 运行问题 | stdio 接入时重点检查 | HTTP 接入时重点检查 |
| --- | --- | --- |
| 服务生命周期 | 子进程启动、退出和资源回收 | 服务可达性、请求和会话生命周期 |
| 日志与消息 | 标准输出被日志污染 | 代理缓冲、连接中断与流解析 |
| 身份边界 | 子进程继承的环境和本地权限 | 身份验证、会话归属与来源校验 |
| 故障验证 | 子进程异常退出、残缺消息 | 响应丢失、流断开、会话失效 |

这些是后续真实接入应执行的检查，本系列没有启动子进程协议服务器，也没有发送 HTTP 请求。

## 三种 ID 对应三种范围

| 标识 | 作用范围 | 不能据此推断 |
| --- | --- | --- |
| JSON-RPC 请求 ID | 请求与响应关联 | 业务动作只执行一次 |
| MCP 会话 ID | 服务端选择启用的 HTTP 会话 | 调用者具有业务权限 |
| SSE 事件 ID | 支持恢复时定位事件位置 | 外部写入尚未发生 |

业务操作键是另一层应用契约，用来关联同一个写入意图。配套模型把它保存在客户端等待记录里，没有把它伪装成 MCP 标准字段。真实接入时，需要工具或背后业务服务明确支持它。

HTTP 服务端可以选择分配会话 ID；携带已失效会话 ID 收到 404 时，客户端必须重新初始化。SSE 恢复也取决于服务端支持，不能假设每次断线都可以完整重放。[会话与恢复规则](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)

即便消息重放成功，仍应按请求 ID 处理重复或迟到响应，并按业务操作判断副作用。

## 取消是一场可能发生竞态的协作

普通请求可以使用 `notifications/cancelled` 通知取消。初始化请求不能这样取消；任务增强请求采用单独的 `tasks/cancel` 机制，不能混用。[MCP 取消规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation)

取消可能与完成同时发生。接收方可能已经提交了工单，无法通过停止计算撤销它。发送方停止等待，也不等于收到了一份“没有执行”的证明。

实验在取消后移除等待项，把写操作加入未知结果集合，忽略后续迟到响应。这只是在模型中确定了客户端如何处理消息。是否撤销工单，需要一个独立且获得授权的业务动作，不能偷偷塞进取消逻辑。

## 重连后恢复的是观察能力

建议将恢复拆成可独立验收的步骤：

1. 建立新连接并完成协商，重新确认工具目录。
2. 找到断线时尚未确定结果的业务操作。
3. 使用权威查询检查实际资源及其参数。
4. 根据查询一致性、去重契约和任务目标，决定完成、等待、重试或交接。

“查不到”只有在查询语义足以排除已提交结果时，才能支持后续判断。远端查询如果存在延迟，就仍要保留未知状态。

配套演示直接查询本地 SQLite 中的工单，能看到已提交的资源；但协议模型仍保留 `needs_reconciliation`，因为演示没有实现任务级验收和完成状态回写。查询证据与任务终态之间，仍有一道应用决策。

## 给连接恢复设置终点

重复重连也会消耗时间和资源。每次连接尝试要受单次超时约束，整个任务还需要总截止时间，不能让进度通知或重试不断延长用户等待。

同时保留[观测篇](/writing/harness-operations-observability/)中的任务关联：任务 ID、业务操作键、请求 ID 和连接代次分别记录。否则新连接里的成功日志会掩盖上一条连接留下的未知写入。

练习时，选择一个真实写工具，在“提交前断开”和“提交后响应丢失”两处分别注入故障。两种场景的界面可能一样，恢复决策应由实际证据区分。

上一篇：[MCP 生命周期](/writing/harness-foundations-mcp-lifecycle/)。

下一篇：[故障实验](/writing/harness-foundations-lab/)。
