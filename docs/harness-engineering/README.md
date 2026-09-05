# 业务写入与恢复实验

本实验属于“Agent Harness → 状态、并发与恢复”，集中说明页为 `/writing/harness-foundations-lab/`。它验证确定动作的持久化意图、业务去重和独立验收。真实 MCP 与模型适配的组装见 `/series/harness-integration/`。

## 本地实验

在仓库根目录运行，Python 3.10+，仅使用标准库：

```sh
python3 docs/harness-engineering/lab.py
python3 -m unittest discover -s docs/harness-engineering -p 'test_*.py' -v
```

默认演示在临时目录创建两份 SQLite 数据库。一份保存运行状态，一份代表独立工单服务；每次运行结束自动清理。演示先在外部写入提交之后注入异常，再新建 Harness 对象恢复。输出包含中断前状态、恢复终态、实际工单数与事件序列。

也可以下载站点提供的 `/labs/harness-engineering.zip`，解压后在目录中执行 `python3 lab.py` 与 `python3 -m unittest discover -p 'test_*.py' -v`。

### 实际验证范围

- 工单服务按租户与操作键做原子去重；同键不同参数拒绝。
- 工具执行前保存意图；不同提交边界中断后可重新加载。
- 新动作需要匹配的审批摘要和当前策略版本；恢复对账不重新执行写入。
- 固定验收器读取实际工单，并与独立任务目标比较。
- 调度前的取消、零预算以及验收失败不会被报告为成功。

模型由固定 `Action` 代替，身份和审批由可信测试驱动注入。实验不是完整自治 Agent，不包含模型推理、OAuth、网络沙箱、真实提示注入防御、多 Worker、分布式事务或防篡改审计。两库在同一机器上，故障由受控异常及子进程退出模拟；未验证机器断电、磁盘损坏或远端最终一致性。

模拟服务的查询是权威读取，且仅有一个 Worker。真实服务“暂时查不到”不一定代表没有执行。服务端去重记录的留存期必须覆盖恢复窗口；无法确认副作用时应停止写入并对账。

## 内容依据

核对日期：2026-09-05。正文区分官方机制、本文推荐契约与本地教学实现。

- 旧站：<https://www.aialtas.site/>，九层地图与 16 个项目。
- Anthropic：<https://www.anthropic.com/engineering/managed-agents>，Session、Harness、Sandbox 分离。
- LangGraph：<https://docs.langchain.com/oss/python/langgraph/interrupts>，恢复时节点重新执行。
- AWS Builders' Library：<https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/>，请求标识与不同参数的处理。
- Anthropic：<https://www.anthropic.com/engineering/writing-tools-for-agents>，工具说明与结果设计。
- MCP 2025-11-25 安全指南：<https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices>，令牌受众、代理与身份边界。
