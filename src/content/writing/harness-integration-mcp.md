---
title: 工具、执行策略与 MCP 怎样接线
description: 从直接函数到跨进程 MCP，定义查询与创建的工具契约，说明策略检查、结构化结果和传输模块的组合方式。
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

工具模块应先有清楚的业务接口，再选择传输方式。第一版 Mini Harness 如果所有能力都在同一个 Python 进程里，直接函数调用通常最容易调试。需要让多个客户端共享能力，或由独立进程维护资源时，再引入 MCP。

## 先定义两个业务工具

本实验只暴露两个工具，把读取和写入分开：

| 工具 | 参数 | 输出 | 副作用 |
| --- | --- | --- | --- |
| `lookup_review_ticket` | `operation_key` | `{"ticket": null}` 或工单对象 | 读取 |
| `create_review_ticket` | `operation_key, source, title` | `{"ticket": {"id": 整数, "action": {...}}}` | 创建，或返回同键的既有工单 |

同键同参数返回同一资源；同键不同参数拒绝执行。这条规则由服务端 `Tickets.create()` 和唯一约束落实，不能只写在工具说明里。

工具层不要顺便判断任务完成。创建接口可能成功创建了错误标题；是否符合任务仍由验收器对照原始目标判断。工具错误也要显式返回或抛出，不能把失败信息包装成看似成功的业务对象。

## 把本地函数包成 MCP 服务

`server.py` 使用官方 Python SDK 中的 `FastMCP`，将 `Tickets.lookup()` 与 `Tickets.create()` 包装成两个工具。返回值通过 `TicketEnvelope` 提供结构化 `ticket` 字段。

客户端的连接顺序是：启动传输 → 建立 `ClientSession` → `initialize()` → 读取工具目录 → 检查需要的工具 → 发起调用。实验的 `session_for()` 管连接生命周期，`call()` 管工具结果解析，`execute()` 管业务流程。这三层分开后，换传输不必改任务验收。

```python
# 在实验目录中使用的真实客户端接口片段
async with session_for(root) as (session, version):
    ticket = await call(
        session,
        'lookup_review_ticket',
        {'operation_key': 'review-001:ticket'},
    )
```

`root` 是状态目录的 `Path`；完整运行入口见[组装与运行](/writing/harness-integration-lab/)。调用返回后，`call()` 先检查 `isError`，再检查 `structuredContent` 中是否包含 `ticket`。MCP 的工具结果可以包含文本与结构化内容；本应用主动选择后者作为机器判断接口。[MCP 工具规范](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)

## stdio 与 HTTP 如何选择

| 条件 | 默认组合 | 应验证的边界 |
| --- | --- | --- |
| Harness 自己启动本地工具服务 | SDK stdio 客户端 + 子进程 FastMCP | 启停、退出码、标准输出不能混入普通日志 |
| 多个客户端访问共享工具服务 | Streamable HTTP + 服务身份与认证 | 会话、超时、代理、访问控制与资源归属 |
| 一次性同进程业务函数 | 直接调用函数 | 参数、错误、副作用与结果契约 |

实验固定 `mcp==1.29.1` 与 MCP `2025-11-25` 协商基线，用于复现已记录结果，不把这个固定版本称为所有新项目的最佳版本。[对应 SDK](https://github.com/modelcontextprotocol/python-sdk/blob/v1.29.1/README.md)

stdio 测试会真正启动服务进程；HTTP 测试使用本机回环地址。两者复用工具逻辑，但 HTTP 当前只覆盖正常路径。生产 HTTP 还需要认证、会话失效、撤权和代理环境测试。本机监听不提供身份认证。

## 执行策略应插在哪里

顺序是：校验模型动作 → 检查业务目标 → 检查执行许可 → 保存派发意图 → 调用工具。策略检查应紧邻实际派发；恢复后也要重新判断当前是否允许新增写入。

实验里，`--execute` 控制是否允许创建本地工单，查询不需要该开关。操作键由运行器根据 run ID 生成，数据库路径由命令行配置。模型只提供工单内容，没有通用 Shell，也不能指定任意文件路径。

这是一份小型业务白名单。将来增加文件或 Shell 工具时，需要同时加入路径限制、环境变量过滤、网络范围和操作系统隔离；仅在提示词里写“不要越权”不能限制进程权限。Hook 可以在配置匹配的调用路径执行检查，但不能替代服务端授权或沙箱。[执行安全篇](/writing/harness-engineering-security/)

## 怎样替换为真实业务系统

保留运行器面对的查询、创建和结果接口，在服务端替换 `Tickets` 的存储实现。接 CRM、任务系统或工单 SaaS 前，先确认四件事：是否支持业务幂等键；是否能按该键查询；写入后多久查询可见；冲突与限流怎样报告。
