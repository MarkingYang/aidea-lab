---
title: Harness 接入与实战（五）：端到端实验：运行、复盘与下一步验证
description: 下载固定依赖的集成实验，运行真实 MCP 与进程恢复测试，区分已通过的本地契约和未实测的在线模型及生产能力。
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

本篇把安装、执行和复盘放在同一条路径上。先运行固定响应模式，确认协议和恢复行为，再按需要配置在线模型。

[下载集成实验包](/labs/harness-integration.zip)。包内提供运行器、模型适配器、MCP 服务、存储模块、测试和固定依赖清单。

## 使用独立环境运行

本次实测环境是 Python 3.11.9。解压进入 `harness-integration` 目录，建议使用 Python 3.11 创建环境：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m unittest discover -p 'test_*.py' -v
```

这些命令使用 macOS/Linux 路径；Windows 的解释器位于虚拟环境的 `Scripts` 目录。依赖安装需要网络，测试本身不调用外部模型服务。

依赖清单记录本次环境解析出的版本，不包含跨平台包哈希，因此不能宣称在所有操作系统上逐字节可复现。SDK 基线固定为 1.29.1，协商版本固定检查为 2025-11-25。

## 先观察，再允许本地写入

```sh
.venv/bin/python lab.py --state-dir ./state-demo
.venv/bin/python lab.py --state-dir ./state-demo --execute
```

第一条保存固定提案并查询资源，停在 `waiting_execution`。第二条创建本地工单，独立查询通过后返回 `succeeded`。

状态目录保存 `runs.sqlite` 与 `tickets.sqlite`。演示命令保留它们以便跨进程恢复；自动测试则使用会被清理的临时目录。两者的生命周期不同。

本包只创建“待核验工单”，没有自动检索或核验资料。成功意味着资源符合给定的创建目标。

## 重现提交后丢失响应

选择一个尚未使用的状态目录：

```sh
.venv/bin/python lab.py --state-dir ./state-crash --execute --fault server-after-commit
.venv/bin/python lab.py --state-dir ./state-crash
```

第一条预期非零退出，因为服务端在提交之后终止。第二条启动新连接，找到已存在工单，完成验收，不需要再次允许写入。

还可以使用 `client-after-intent` 和 `client-after-result`。每种故障都应使用新的状态目录；已经成功的运行会直接返回终态，不会再次触发故障。

客户端保存意图后退出的场景尚未创建资源，因此恢复命令还需要 `--execute`。测试检查最终工单数量和派发次数，而不是只匹配命令输出中的“成功”。

## 16 项测试怎样分布

| 组别 | 数量 | 覆盖 |
| --- | --- | --- |
| 模型边界 | 8 | 完整提案、截断、普通文本、多提案、错误工具、额外权限字段、空参数、缺配置不发送 |
| 默认与正常运行 | 2 | 默认不写入、stdio 成功及终态重读 |
| 真实退出恢复 | 3 | 服务端提交后、客户端意图后、客户端结果后退出 |
| 目标一致性 | 2 | 变更任务拒绝恢复、错误既有资源验收失败 |
| HTTP 接入 | 1 | 本机 Streamable HTTP 正常执行路径 |

编写时这 16 项全部通过。HTTP 测试会自动启动并清理测试服务，不要求手动保留后台进程。测试结果不代表所有 MCP 传输故障都已覆盖。

## 可选在线模型模式

在自己的终端设置 `ANTHROPIC_API_KEY` 与 `ANTHROPIC_MODEL`，模型标识应来自账号实际可用的列表，然后执行：

```sh
.venv/bin/python lab.py --state-dir ./state-live   --provider anthropic --model "$ANTHROPIC_MODEL"
```

该命令会向模型服务发送合成任务，并可能产生模型费用，但默认仍不会创建工单。检查已保存动作后，用相同参数附加 `--execute` 继续；不要切换回默认 fixture，否则会与原任务契约冲突。

当前没有执行在线调用，因此没有模型成功率、实际 token 费用或时延数据。适配器是非流式、单次提案接口，没有实现工具结果回传给模型后的多轮循环。

## 下一轮实验应增加哪些证据

优先保留这条已通过的基线，再增加：在线模型样本与脱敏诊断；HTTP 会话失效与 SSE 恢复；多 Worker 所有权和预算竞争；真实认证、撤权与隔离；任务级超时和取消传播。

这些都需要具体运行环境。不要把 SDK 的能力列表当成当前应用已经通过的测试清单，也不要把本地固定任务的成功当成真实业务质量。

本系列到此完成。回到[链路全景](/writing/harness-integration-map/)，现在可以把每条“已经接入”的说法对应到进程、协议、存储和验收证据。再结合[发布与演化](/writing/harness-operations-release/)，为下一次变化保留可重复的基线。

上一篇：[持久化恢复](/writing/harness-integration-recovery/)。
