# Harness 工程基础与协议：第三批知识补全

站点入口：`/series/harness-foundations/`。五篇文章依次讨论并发、一致性、MCP 生命周期、断线恢复与故障实验。承接前两批共 13 篇文章，本批完成后共新增 18 篇。

## 运行

Python 3.10+，只使用标准库，无需密钥。解压后在本目录运行：

```sh
python3 lab.py
python3 -m unittest discover -p 'test_*.py' -v
```

仓库根目录运行时，将路径改为 `docs/harness-foundations/lab.py`；测试使用 `python3 -m unittest discover -s docs/harness-foundations -p 'test_*.py' -v`。

站点下载：`/labs/harness-foundations.zip`，含本说明、`lab.py`、`test_contracts.py`。

## 观察结果

演示临时创建 SQLite 数据库，两个线程在屏障前读到同一版本，再竞争更新；只有一次被接受，文档版本变为 2。之后先提交工单，再模拟响应丢失、重连和旧响应到达。最终实际工单数为 1，迟到响应被忽略。

`needs_reconciliation` 保留业务操作键。独立读取工单不会自动清除此集合：本包没有实现任务级验收和完成状态回写。

16 项测试：5 项并发与业务状态、4 项初始化与能力、4 项关联与取消、3 项目录与错误。测试检查契约，不提供吞吐基准或 MCP 兼容性评分。

## 保证范围

- `Store` 使用真实 SQLite、独立连接、条件更新、唯一约束和事务。两个线程的竞争通过屏障控制，不依赖休眠猜测顺序。文档获胜者不固定。
- `SessionModel` 是字典消息驱动的教学状态模型，没有网络；只覆盖初始化、工具请求和少量通知。它不是 MCP 客户端、服务端、SDK 或完整一致性测试。
- 协议依据固定为 MCP 2025-11-25，核对日期 2026-09-05。初始化完成前禁用工具、目录失效后暂停调用、用本地修订号拒绝旧目录响应是本模型的明确策略，不能全都当成规范强制条款。
- 请求 ID 的“代次:序号”是实现选择。业务操作键只存在于应用等待记录中，不是额外的 MCP 标准字段。真实工具必须另行约定业务去重能力。
- 等待表、取消和待对账集合都在内存中。SQLite 资源可重新读取，不代表协议状态支持进程崩溃恢复。第一批双库持久化实验目前独立存在。
- 工单去重仅覆盖单用户本地场景；没有多租户身份、去重过期、权限、远端一致性或跨服务事务保证。
- 不实现完整 JSON-RPC/Schema 校验、分页、双向服务端请求、OAuth、stdio、HTTP/SSE、Tasks、真实模型、多机器调度或生产故障恢复。

## 依据与后续验证

- 生命周期：<https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle>
- 传输：<https://modelcontextprotocol.io/specification/2025-11-25/basic/transports>
- 取消：<https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/cancellation>
- 工具：<https://modelcontextprotocol.io/specification/2025-11-25/server/tools>
- JSON-RPC：<https://www.jsonrpc.org/specification>
- Python 同步原语：<https://docs.python.org/3/library/asyncio-sync.html>
- PostgreSQL 隔离级别：<https://www.postgresql.org/docs/current/transaction-iso.html>

后续应固定实际 SDK 版本，在测试服务器上验证编码、分片、异常退出、HTTP 会话失效和认证失败；接入实际工具的去重和权威查询，再接真实模型做任务级验收。SQLite 的测试结果不外推为其他数据库或生产协议兼容性结论。

## 后续进展

第四批 `/series/harness-integration/` 已补充 SDK stdio、本机 HTTP 正常路径和真实进程退出恢复实验，下载 `/labs/harness-integration.zip`。本包仍保留原有状态模型定位；HTTP 故障、认证、在线模型和生产能力仍未验证。
