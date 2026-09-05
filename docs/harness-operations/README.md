# Harness 运行与演进：第二批知识补全

配套入口：`/series/harness-operations/`。衔接第一批 `/series/harness-engineering/`。

本轮提供七篇文章与 `WORKBOOK.md`，将已有项目知识整理为跨组件的设计方法。未实现新的模型服务、生产队列或多 Agent Runtime；各项实践仍需读者在自己的任务环境中执行。

## 文章与交付物

| 文章 | 核心补充 | 交付物 |
| --- | --- | --- |
| harness-operations-context | 运行全景、上下文装配、压缩与缓存边界 | 上下文卡 |
| harness-operations-planning | 固定主干、动态探索、依赖与重规划 | 计划卡 |
| harness-operations-observability | 跨运行关联、时延、故障诊断与采样 | 诊断卡 |
| harness-operations-multi-agent | 委派、汇总、共享状态、预算与取消 | 协作卡 |
| harness-operations-model-gateway | 能力适配、降级、重试与任务成本 | 路由卡 |
| harness-operations-production | 队列、租约、fencing、背压与租户隔离 | 生命周期卡 |
| harness-operations-release | 发布单元、隔离回放、灰度、回滚与消融 | 变更卡 |

站点下载文件 `/labs/harness-operations-workbook.md` 与本目录 `WORKBOOK.md` 保持字节一致。文章中的表格数值均为明确标注的教学示例，不代表真实实验结果。

## 资料与版本边界

核对日期：2026-09-05。正文注明官方机制和本文提出的设计建议；不复制未验证的 SDK 调用或假设所有厂商接口一致。

- Anthropic 上下文工程：<https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>
- Anthropic 工作流与 Agent：<https://www.anthropic.com/engineering/building-effective-agents>
- OTel Traces：<https://opentelemetry.io/docs/concepts/signals/traces/>
- OTel Sampling：<https://opentelemetry.io/docs/concepts/sampling/>
- OTel GenAI 字段：<https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/>
- Anthropic 多 Agent 研究：<https://www.anthropic.com/engineering/multi-agent-research-system>
- A2A 规范：<https://a2a-protocol.org/dev/specification/>，开发版文档会变化，实现时应固定所采用的发布版本。
- LiteLLM 可靠性：<https://docs.litellm.ai/docs/proxy/reliability>
- AWS SQS 可见性超时：<https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html>
- Hazelcast 5.5 FencedLock：<https://docs.hazelcast.com/hazelcast/5.5/data-structures/fencedlock>
- Google SRE 灰度发布：<https://sre.google/workbook/canarying-releases/>

## 后续范围

第三批已展开工程基础和 MCP 连接生命周期，入口为 `/series/harness-foundations/`，配套 16 项本地并发与协议状态测试。真实 MCP 传输仍未验证；真实模型与服务集成、调度与隔离测试未完成。P2 根据实际任务选择 Computer Use、实时语音与多模态、企业数据接入、经验学习与自动优化。
