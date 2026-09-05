---
title: Harness 接入与实战（三）：真实 MCP 接入：让工具跨过进程边界
description: 使用固定版本官方 SDK 运行真实 stdio 和本机 Streamable HTTP 工具调用，验证结构化输出并说明认证与恢复的剩余边界。
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

> Harness 接入与实战系列：[1. 链路全景](/writing/harness-integration-map/)｜[2. 模型适配](/writing/harness-integration-model/)｜[3. MCP 实接](/writing/harness-integration-mcp/)｜[4. 持久化恢复](/writing/harness-integration-recovery/)｜[5. 端到端实验](/writing/harness-integration-lab/)

上一批协议模型可以精确安排消息顺序，却没有让一条消息穿过标准输入输出。本批启动真正的 Python 子进程，由 SDK 完成初始化、工具发现和调用，再用独立的 HTTP 测试覆盖另一种传输入口。

这里使用官方 Python SDK 中的 `FastMCP`，不是另一个同名独立包。安装依赖时固定版本，避免名称相近造成误判。

## 让 SDK 负责协议，让应用保留业务契约

实验客户端使用 `ClientSession`，stdio 连接通过 `StdioServerParameters` 指向当前 Python 解释器及测试服务脚本。服务端注册查询和创建两个工具。[SDK v1.29.1](https://github.com/modelcontextprotocol/python-sdk/blob/v1.29.1/README.md)

初始化后，客户端检查协商版本，再读取目录，确认需要的工具存在。客户端没有实现通用工具路由，也没有把模型返回的任意名称转发给服务器。

| SDK 管理的边界 | 本实验应用管理的边界 |
| --- | --- |
| 消息编码与请求关联 | 同一业务操作的稳定身份 |
| 初始化与传输会话 | 允许使用哪些业务动作 |
| 工具调用返回结构 | 返回资源是否满足原任务 |
| 连接上下文清理 | 已提交副作用怎样恢复 |

使用 SDK 可以减少协议代码，但不能替应用决定业务成功、重试或授权。

## 结构化输出需要在服务端明确定义

接入时遇到的一个具体问题是：仅把 Python 返回值标注为宽泛的 `dict`，在本次固定版本运行中得到的是文本内容，`structuredContent` 为空。

实验改用明确的 Pydantic 返回模型 `TicketEnvelope`，其中包含 `ticket` 字段。客户端检查工具执行错误标记，再读取结构化结果，并要求存在该字段。

这项观察来自本地运行，不应外推为所有 SDK 版本的共同表现。升级依赖后，必须重新检查目录中的输出 Schema 和实际返回结构。不能把一段“看起来像 JSON”的文本无条件当成已验证结果。

## stdio 的进程边界是真实存在的

stdio 服务的协议消息经过子进程标准输入输出。普通日志不能混入标准输出，否则会干扰协议解析；这是[MCP 传输规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)定义的边界。

本地故障开关让服务端在 SQLite 提交后直接退出。客户端实际失去响应，运行库保留此前提交的意图。恢复时启动新服务进程，查询同一份工单库。

故障开关属于测试服务启动参数，不暴露为工具参数。模型无法要求服务端退出。

## HTTP 正常路径与流恢复不是同一个测试

集成测试还启动绑定到 `127.0.0.1` 的服务，通过 Streamable HTTP 完成初始化、查询、创建和验收。响应配置采用 JSON 模式。

它证明本机 HTTP 正常路径可运行，没有证明 SSE 事件重放、代理缓冲、会话过期后的重建或远程负载均衡都正确。本包的进程退出恢复测试走 stdio，不能把结果自动算到 HTTP 故障覆盖里。

HTTP 测试客户端仅为回环流量关闭环境代理，避免本机请求被送往外部代理。模型 API 请求不采用这项本地测试配置。

## 连通以后仍要补的生产问题

当前服务没有 OAuth、租户隔离、沙箱或业务撤权。回环监听减少了暴露范围，但本机其他进程仍可能访问它，不能把它当成认证措施。

工具存在也不代表目录兼容性已经充分检查。本实验只读取一次目录并验证需要的名称；分页、运行中目录变化、跨版本输入结构漂移和完整能力策略都需要独立测试。

继续参照[生命周期篇](/writing/harness-foundations-mcp-lifecycle/)与[安全篇](/writing/harness-engineering-security/)补反例时，每增加一个能力，都应写明它在真实传输上测过，还是仍停留在受控模型中。

上一篇：[模型适配](/writing/harness-integration-model/)。

下一篇：[持久化恢复](/writing/harness-integration-recovery/)。
