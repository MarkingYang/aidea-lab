# Agent Harness 三种架构对照实验

同一业务契约，分别用显式循环、LangGraph 和 Temporal 实现运行控制与状态保存。默认使用确定性模型替身，不需要模型密钥，不访问外部业务系统。

## 任务与验收

公告 `notice` 在 2026-09-01 发布、2026-09-15 生效；目录 `catalog` 把生效日期记成 2026-09-01。运行器读取两份材料，提出日期冲突工单，等待批准，创建后查询并核对字段。

`source` 是公告 ID；`field=effective` 表示生效日期；`observed` 为公告值；`recorded` 为目录值。稳定操作键是 `review:ticket`。固定流程基线直接提供同一工单字段，省去模型替身决策。

验收看业务库中是否只有一条字段正确的工单；无效提案、预算耗尽、撤权和写入前取消应保持零条。取消发生在提交之后时，必须报告 `cancelled_with_effect`，不会自动删工单。

## 运行

已验证 Python 3.11.9。macOS/Linux：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m unittest discover -p 'test_*.py' -v
.venv/bin/python verify.py --output results-local.json --repeats 3
```

Windows 使用 `.venv/Scripts/python.exe`。安装依赖和首次启动 Temporal 本地测试服务需要网络；SDK 会下载 Temporal CLI。运行不需要 Docker。网络受限时需预先准备 SDK 支持的本地服务二进制并调整 `WorkflowEnvironment.start_local()` 的 `dev_server_existing_path`。

固定三个主要依赖版本；`requirements-lock.txt` 记录本次完整 Python 环境。SDK 自动下载的服务版本可能变化，本次记录为 Temporal CLI 1.8.3 / Server 1.31.2。做版本对照时应固定服务二进制并记录其版本，不能仅比较 Python SDK 号。

## 文件与状态归属

| 文件 | 职责 |
| --- | --- |
| `core.py` | 固定资料、模型替身、单步控制、资源查询、同事务幂等和策略检查 |
| `runners.py` | A 显式循环、B StateGraph + SqliteSaver、C Workflow + Activity |
| `verify.py` | 三种引擎运行八个共同场景，重复三次；另测 Temporal Worker 重建 |
| `test_contracts.py` | 资源边界反例、A/B 在新进程中恢复 |
| `results.json` | 本次原始结果；耗时只是测试观测，不是性能基准 |
| `ADR.md` | 默认方案、取舍与迁移决定 |

A 用 `.runs` SQLite 保存运行状态，B 用 `.graph` SQLite 保存检查点，C 通过 Temporal 事件历史保存步骤结果。业务库与这些状态分开。`op`、任务定义和状态版本由应用提供，模型不能改写。

八个共同场景：固定流程、资料核验、写入后响应丢失、无效提案、预算耗尽、批准前撤权、批准前取消、不支持的状态版本。

模型替身按已有观察决定读取公告、读取目录、生成提案，共三次固定决策。没有语言理解采样，三次重复用于发现运行契约不稳定，不能估计真实模型成功率。

## 验证结果与限制

2026-09-06：共同检查 72 次通过，资源与进程恢复测试 8 项通过，Temporal 等待期间更换 Worker 后恢复通过。

- A/B 恢复测试分别启动两个 Python 子进程；C 测试重建 Worker 对象，服务端保持运行。
- Temporal 本地服务使用内存后端。没有测试服务端数据丢失、跨机器恢复或生产数据库故障；生产必须配置可靠持久后端。
- Temporal 测试使用 `UnsandboxedWorkflowRunner` 简化教学模块导入。它不是操作系统隔离；生产需要另行验证工作流确定性和执行环境隔离。
- `ResponseLost` 在真实 SQLite 提交之后抛出，用于模拟响应丢失；不是本实验的真实网络断线。真实 MCP 子进程退出见本站 Mini Harness 实验。
- 两种恢复行为分开：检查点／历史用于恢复运行；业务查询和幂等用于确认外部资源。重复副作用的保护来自后者。
- 状态版本不支持时阻止执行。这里没有自动状态迁移、真实多租户身份、分布式租约、动态工具检索或长期记忆。
- 未测模型质量、Token 费用和规模吞吐；脚本中的本机耗时包括调度、SQLite 和测试轮询，不能用来给框架排快慢。
- 临时目录在验证后删除，JSON 结果保留。样例假设任务标识和初始契约由可信调用方管理；对外提供服务前需补任务身份绑定、权限入口和重入规则。
