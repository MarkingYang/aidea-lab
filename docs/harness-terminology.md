# Harness 术语与文章边界

本表是本站的教学口径。项目源码的同名对象可能有不同生命周期，研究文章应写明映射关系。

| 术语 | 含义 | 边界 |
| --- | --- | --- |
| Task／任务契约 | 目标、输入范围、允许动作与验收标准 | 用户修改目标时显式产生新版本 |
| Run／运行实例 | 执行某份任务契约的一次实例 | 可以跨进程重启；不等于一次模型请求 |
| Session／会话 | 保存交互历史与相关状态的容器 | 是否包含多个 Run 由宿主定义 |
| Turn／工作段 | 响应一次输入而展开的工作 | 不一定以任务成功结束 |
| Step／决策步骤 | 一次模型决策及关联工具处理 | 不直接等同框架的 super-step 或费用计量单位 |
| Proposal／提案 | 模型建议的动作或结果 | 无法自行授予权限或定义验收标准 |
| Operation／业务操作 | 有稳定身份的一次逻辑读写意图 | 重试保留操作身份；不同意图不能因参数相同而合并 |
| Checkpoint／检查点 | 恢复运行所需的状态记录 | 不自动回滚外部资源或证明外部写入结果 |
| Event／事件 | 提案、派发、结果与决定的已记录事实 | 记录完整性和访问权限仍需设计 |
| Business resource／业务资源 | 工单、文档等实际交付对象 | 验收需要核对它，不只看运行日志 |
| Context／上下文 | 本次模型请求实际可见的信息 | 是按规则装配的视图，不等于全部历史 |
| Memory／记忆 | 为后续任务保留的事实或经验 | 需要来源、适用范围、权限和纠错，不天然可信 |
| Reconciliation／对账 | 查询并判断业务操作实际结果 | 不能确认时保留未知，不能假定未执行 |
| Retry／重试 | 再次尝试同一意图 | 需满足幂等、预算与当前许可 |
| Compensation／补偿 | 处理已发生但不符合目标的影响 | 是新的操作，有自己的授权与验收 |

## 主文分工

- `prompt-context-harness-engineering`：工程范围与职责关系。
- `harness-engineering-map`：统一逻辑架构、模块接口和状态所有者。
- `harness-engineering-loop`：停止、等待、取消、预算和规划契约。
- `loop-graph-engineering`：局部循环与全局执行图的关系。
- `langchain-langgraph-frameworks-and-protocols`：具体框架与协议的分层。
- `harness-architecture-selection`：运行控制与持久化的 A/B/C 组合、对照实验和迁移。
- `multi-agent-architecture-selection`：协作拓扑、框架与部署选型。
- `harness-operations-multi-agent`：委派字段、预算、取消传播和汇总责任。
- `harness-integration-*`：已有单动作 MCP 实验的模块组装；不宣称实现自主资料研究。
- `harness-engineering-recovery`：业务副作用的恢复语义；`harness-foundations-concurrency`：共享资源的竞争控制。

选择顺序：先确定任务与模块，再确定运行控制和持久化，最后按收益选择多 Agent、记忆与协议适配。项目研究提供实现证据，不重复承担通用架构总论。
