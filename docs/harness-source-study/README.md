# 从开源项目补充 Harness 知识

发布授权补记：2026-09-07 用户要求推送，本研究随 58 篇文章批次发布；下文未发布字样保留为研究阶段记录。

日期：2026-09-07。已发布基线：`0dce1cc`。本轮本地修改，未发布。

## 文章与证据

| 文章 | 处理 | 核心问题 | 证据级别 |
| --- | --- | --- | --- |
| LangGraph | 深化已有一篇，保留原审核案例和发表日期 | DAG / 一般执行图、超级步、汇合、动态派发、Reducer、持久恢复 | 锁定源码 + 本轮发布包实验；原审核实验有前一轮记录 |
| Temporal | 新增一篇，以 Python SDK 为入口 | 历史、重放、Activity、调度容量、取消与版本兼容 | 锁定 SDK 源码 + 本轮本地服务实验；未审计 Server 内部 |
| OpenHands Software Agent SDK | 新增一篇 | Agent / Conversation、事件与视图、工具资源锁、终端、Workspace 生命周期 | 锁定源码；未运行完整 SDK、模型或 Docker |

每个项目只有一篇文章，各自按真实边界研究。文章引用控制流、上下文、并发、任务服务、安全、恢复与选型文章；没有新建一篇介绍写作体系的总论，也没有按功能框拆出一批薄文章。本地共 57 篇、22 分组、8 方向；旧 `docs/object-research/manifest.json` 保留为上一轮发布重组记录。

`sources.json` 保存仓库、完整提交、逐文件永久链接和 SHA-256。Git 克隆在 `/tmp/harness-source-study-20260907/`，不纳入仓库。该临时目录不是复现所必需的依赖：按清单从 GitHub 检出提交即可。

## 声明与证据对应

| 声明 | 源码位置 / 符号 | 验证 |
| --- | --- | --- |
| 列表连边与独立连边不是相同的汇合契约 | LangGraph `graph/state.py`：`add_edge`、`attach_edge`；`channels/named_barrier_value.py` | 不等长 A / B1→B2 分支；前者汇总一次，后者两次 |
| 执行按超级步处理状态更新 | LangGraph `pregel/_loop.py`：`tick`、`after_tick`；`pregel/_algo.py`：`prepare_next_tasks`、`apply_writes` | 源码追踪；分支结果提供局部行为证据 |
| 动态 Send 可以共享节点定义而区分输入 | `graph/state.py` 路由编译；发布包 `Send` | 三来源一次汇总 |
| 已保存的成功任务写入可在新进程恢复时保留 | `PregelLoop._reapply_writes_to_succeeded_nodes` | SQLite checkpointer，新 Python 子进程；A 1 次、B 2 次 |
| Workflow 控制由 activation / Future 推进 | Temporal `_workflow_instance.py`：`workflow_start_activity`、`_apply_resolve_activity`、`workflow_wait_condition`、`_run_once` | 源码追踪 + 本地 Worker 更换 |
| Activity 重试与 Workflow 历史重放不同 | Temporal `_replayer.py`、运行历史 | 写入调用 2 次；重放后调用计数不变 |
| 业务去重不来自重放 | 本实验 `write_result` 的 SQLite 主键 | 响应丢失后仍然 1 行；固定值例子不包含同键异参检查 |
| 容量槽位不等于租户预算 | Temporal `_tuning.py` | 类型与实现分析；没有压力测试 |
| 事件和模型视图分离 | OpenHands `conversation/state.py`、`event_store.py`、`context/view/view.py` | 静态调用链分析 |
| 工具并行需要资源声明 | OpenHands `agent/parallel_executor.py`、`conversation/resource_lock_manager.py` | 静态实现分析；没有声称运行并发实验 |
| 会话暂停与容器暂停不同 | OpenHands `local_conversation.py`、Docker `workspace.py` | 对比两条实现路径 |
| LocalWorkspace 的 cwd 不是隔离边界 | OpenHands `workspace/local.py` | 宿主命令与文件操作实现 |
| Docker 清理前需确认成果保留 | Docker `_start_container` / `cleanup` 使用 `--rm` 与 stop | 源码事实 + 明确标注的设计推论；未验证容器行为 |

## 复现

本次 Python 3.12.13。LangGraph 1.2.11、SQLite checkpointer 3.1.1、Temporal SDK 1.32.0。`requirements-lock.txt` 记录发布包环境；不能把包版本相同写成已证明字节内容与源码提交相同。

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python langgraph_lab.py
.venv/bin/python temporal_lab.py
```

脚本不需要模型密钥，不连接真实业务。Temporal 首次启动会下载本地服务；本次是 CLI 1.8.3 / Server 1.31.2，自动下载版本未来可能变化，复现实验应记录实际版本。`WorkflowEnvironment.start_local()` 可配置已有二进制路径以固定服务版本。

LangGraph 的首次子进程故意让 B 失败，第二次子进程从同一 SQLite 状态继续。只有实验 B 的函数有按阶段改变的故障注入；输入、状态 schema 与图结构不变。A、B 使用独立文件记录调用次数。

Temporal 的写入首次故意抛错，终端出现该异常是预期。运行结果保存在 `temporal-results.json`，固定教学数据的历史保存在 `temporal-history.json`。这不是生产日志。

## 已完成与限制

- LangGraph 四个对照场景通过：显式汇合、独立边、Send、SQLite 跨 Python 进程恢复。
- Temporal 更换 Worker 后继续通过；读取 1 次、写入 2 次、业务行数 1；离线重放通过且没有调用 Activity 函数。
- Temporal 服务使用内存后端并始终存活。没有测试服务端宕机、跨主机或数据库损坏。使用 UnsandboxedWorkflowRunner 简化教学模块导入，不证明任意业务代码满足确定性要求。
- 本轮未运行 OpenHands SDK、容器、真实模型、外部 API 和压力测试。取消、子 Workflow、历史版本迁移、全局公平调度也没有专项运行证据。
- OpenHands 的成果保留要求、跨执行器协调要求，属于基于源码边界的设计推论，不冒充项目已实现的自动保证。
- 本轮是优先机制的项目入口补充，不宣称所有先前提出的 P0 / P1 研究已经完成。完整上下文对照实验、跨任务预算、跨主机执行隔离仍需后续证据。

公开实验包 `/labs/harness-source-study.zip` 包含本目录的脚本、锁定依赖、来源清单与结果，不包含第三方仓库、虚拟环境或缓存。修改实验结果后须同步重建该包。
