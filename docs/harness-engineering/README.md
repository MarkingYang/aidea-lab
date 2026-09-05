# Agent Harness 工程：第一批知识补全

本轮把旧站的九层技术地图与 Blog 的架构、路由、记忆、评测系列连接成六篇工程文章。第二批已补充七篇运行与演进文章，第三批补充五篇工程基础与协议文章，第四批补充五篇接入与实战文章，累计新增 23 篇。下表区分内容覆盖和仍需完成的工程验证。

## 阅读路径

| 顺序 | 文章 slug | 读后交付物 |
| --- | --- | --- |
| 1 | harness-engineering-map | 任务、模块与责任地图 |
| 2 | harness-engineering-loop | 继续、等待、终止的状态契约 |
| 3 | harness-engineering-recovery | 中断点与副作用恢复表 |
| 4 | harness-engineering-tools | 工具输入、结果、错误与重试契约 |
| 5 | harness-engineering-security | 身份、动作审批与隔离边界表 |
| 6 | harness-engineering-lab | 可重复运行的故障实验与复盘 |

站点入口：`/series/harness-engineering/`。

## 全部知识缺口的跟踪

| 总纲模块 | 已有内容 | 下一步验证或补充 |
| --- | --- | --- |
| 统一架构 | 第一批第 1 篇与第二批全景 | 用第二种业务任务检验边界 |
| 工程基础 | 第三批并发与一致性两篇、真实 SQLite 竞争实验 | 在目标数据库验证隔离级别与多行约束 |
| Agent Loop | 第一批第 2 篇；固定动作实验 | 第四批已提供模型适配器与提案反例；在线模型及多轮纠错仍未测 |
| 规划与验证策略 | 第二批规划篇 | 对照固定流程、局部探索与动态规划 |
| 上下文工程 | 第二批上下文篇，承接记忆与架构系列 | 实测装配、压缩、撤权和缓存失效 |
| 工具与协议 | 第一批工具篇、能力路由系列；第三批 MCP 生命周期与状态模型 | 第四批已测 SDK stdio 与本机 HTTP 正常路径；继续验证 SSE 恢复、认证与升级兼容 |
| 长任务恢复 | 第一批故障实验；第二批调度篇；第四批真实进程退出恢复 | 验证多 Worker 接管、fencing 与状态迁移 |
| 安全与授权 | 第一批安全篇；第二批隔离与租户边界 | 接真实身份、沙箱、撤权与注入测试 |
| 可观测性 | 第二批观测篇 | 接入 OTel，验证跨服务传播、采样与诊断 |
| 多 Agent | 第二批协作篇 | 验证委派失联、共享状态和取消传播 |
| 模型与成本 | 第二批网关篇 | 接真实 Provider，验证适配、降级和总成本 |
| 生产服务 | 第二批调度篇 | 验证队列、资源清理、配额与容量 |
| 发布与演化 | 第二批发布篇 | 在隔离环境执行回放、灰度、回滚和消融 |
| 贯穿实战 | 第一批双库实验；第二批七张设计卡；第三批并发与协议状态实验；第四批 SDK 集成 | 接在线模型与生产服务，保留原有反例 |

第二批入口：`/series/harness-operations/`。站点工作簿下载路径：`/labs/harness-operations-workbook.md`。仓库中的配套文档位于 `docs/harness-operations/`。

第三批入口：`/series/harness-foundations/`，实验下载：`/labs/harness-foundations.zip`，配套文档：`docs/harness-foundations/`。协议状态模型不代表真实 MCP 传输已经验证。

第四批入口：`/series/harness-integration/`，实验下载：`/labs/harness-integration.zip`。真实 stdio、本机 HTTP 正常路径和三处进程退出恢复已测；在线模型、HTTP 流恢复与生产安全仍未验证。

P2 扩展：Computer Use、实时语音与多模态、企业数据接入、经验学习与自动优化。

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
