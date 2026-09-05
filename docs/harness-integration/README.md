# Mini Harness：模块组装与运行实验

站点入口：`/series/harness-integration/`。阅读顺序：模块与选型 → 模型与循环 → 工具与策略 → 状态与验收 → 组装与运行。

这是单用户、单 Worker、单动作的本地教学 Harness。任务是根据给定来源和标题创建本地核验工单，不是完成资料检索或内容核验。默认模型使用固定响应；MCP 传输、子进程和 SQLite 写入真实执行。

## 安装与回归

本次实测 Python 3.11.9，建议使用 Python 3.11。解压后在本目录运行（macOS/Linux）：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m unittest discover -p 'test_*.py' -v
```

Windows 虚拟环境的解释器位于 `Scripts` 目录。requirements.txt 固定本次解析的依赖版本，包含 `mcp==1.29.1`；没有跨平台哈希锁定。SDK 1.x 为维护线，选择它是为了延续 2025-11-25 协议基线，不是推荐所有新项目都采用 1.x。客户端检查实际协商版本。

16 项测试会启动真实 stdio 子进程，并为 HTTP 正常路径临时启动回环服务；不调用外部模型 API。临时目录和测试服务自动清理。

## 普通运行

```sh
.venv/bin/python lab.py --state-dir ./state-demo
.venv/bin/python lab.py --state-dir ./state-demo --execute
```

第一条保存提案并查询资源，停在 waiting_execution；第二条允许本地创建，并用独立查询验收。演示的状态目录保留 runs.sqlite 和 tickets.sqlite，方便跨进程恢复。`--execute` 只是操作者选择，不是生产审批系统。

## 退出恢复

每种故障使用一个新的状态目录：

```sh
.venv/bin/python lab.py --state-dir ./state-crash --execute --fault server-after-commit
.venv/bin/python lab.py --state-dir ./state-crash
```

第一条预期非零退出；第二条查询已存在工单，成功后派发次数仍为 1。

另有 `client-after-intent`：工单为 0，恢复需要附加 `--execute`，最终派发次数为 2；`client-after-result`：工单为 1，恢复只查询验收，派发次数为 1。成功终态会直接返回，因此复用已成功的目录不会再次触发故障。

同一目录中，相同 run ID 必须保留目标、供应方和模型配置。默认 run ID 为 review-001，业务操作键由应用生成，不能由模型更换。

## 可选在线模型

在自己的终端设置 ANTHROPIC_API_KEY 和实际可用的 ANTHROPIC_MODEL，然后执行：

```sh
.venv/bin/python lab.py --state-dir ./state-live --provider anthropic --model "$ANTHROPIC_MODEL"
```

这会发送合成测试任务到 Anthropic Messages API，可能产生模型费用；默认不创建工单。检查提案后，保留相同参数并追加 `--execute`。恢复不能切换回 fixture，因为供应方属于已保存契约。

在线 API 本次未运行。提供的是非流式、单次提案适配器，没有开放式多轮循环、模型重试、流恢复或降级。已测试模型解析与缺配置不发送请求；未验证远端请求、真实模型输出、实际费用、限流或延迟。

## 文件分工

| 文件 | 责任 |
| --- | --- |
| lab.py | 单动作运行控制、MCP 客户端、派发前持久化与验收 |
| server.py | 官方 FastMCP 服务、查询与创建工具、测试退出点 |
| model.py | 固定响应、可选 Messages 适配器、严格提案解析 |
| store.py | 分开的工单库与运行库、事务和操作键去重 |
| test_contracts.py | 8 项模型边界与 8 项真实集成测试 |
| VERIFICATION.md | 实测环境、观察结果与未验证事项 |

## 从模块继续扩展

- 组装入口是 `lab.py: execute()`：依次连接任务契约、模型提案、执行策略、MCP 工具、运行存储和资源验收。
- 上下文组装目前内置在 `model.py: propose()`；执行策略内置在运行器，不要求八项职责各做成一个服务。
- 新增多轮任务时，先补消息历史、工具结果回传、轮数与总截止时间，再扩充工具。多轮循环设计见系列第二篇，当前实验包未实现。
- 替换业务系统时保留查询与创建契约，重新验证幂等键和写入后的查询可见性。

## 保证范围

- SQLite 副作用与运行记录持久化；真实进程退出后重启。没有机器断电、磁盘损坏、迁移或远端最终一致性测试。
- 运行状态和事件同事务提交；仅支持单 Worker。服务端资源去重不能替代多 Worker 的所有权、预算和事件顺序保证。
- 派发预算上限 2，重启后保留。模型提案尚未保存时，崩溃恢复可能再次请求模型；没有持久化模型请求预算或整个任务总截止时间。
- stdout 的 interrupted 是命令摘要；运行库可能保留 dispatching 等中间状态。下一次运行先查询资源，不推断回滚。
- HTTP 只测本机 JSON 响应正常路径；未测 HTTP 故障重建、SSE 重放、代理或负载均衡。
- 目录只读一次并检查所需名称，未覆盖分页、目录热更新、完整 Schema 兼容策略或所有协议能力。
- 没有 OAuth、租户隔离、沙箱、撤权、取消传播或防篡改审计；回环监听不是认证。
- 成功终态重读直接返回保存结果，不重新监测资源未来是否存在。

## 资料

- SDK 固定版本：<https://github.com/modelcontextprotocol/python-sdk/blob/v1.29.1/README.md>
- MCP 传输：<https://modelcontextprotocol.io/specification/2025-11-25/basic/transports>
- Anthropic 工具使用：<https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview>
- Anthropic 停止原因：<https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons>
