# Hermes 架构取舍研究

2026-09-20，按用户“写一篇 Blog，Hermes 架构设计的优缺点”的请求，重写既有 `src/content/writing/hermes-agent-architecture-deep-dive.md`，保留原 URL、2026-09-04 发布日期、目录归属和三个历史锚点。本文仍为本地修订，未获新发布授权。

## 证据范围

官方仓库：<https://github.com/NousResearch/hermes-agent>。固定提交：`2ed6387d87b4db091af2f05db32faab6e0dbb9a2`（2026-09-20）。`sources.json` 记录官方原始文件的 URL、字节数与 SHA-256；`sources/` 保存实际响应。一次探测 `agent/tool_dispatch.py` 返回 404，已在清单中保留失败记录，未将其作为证据。

本轮只读取文档与源码，未安装或执行 Hermes，未调用模型、运行真实 Agent、终端隔离环境或业务服务。周报、工单重复创建、记忆失效和验收案例均为假设分析。网站构建和浏览器检查只验证博客，不证明 Hermes 的安全性、性能或可靠性。

## 核心论断与依据

| 论断 | 固定提交中的主要依据 | 结论范围 |
| --- | --- | --- |
| 多入口共享 AIAgent，当前循环已拆分 | `website/docs/developer-guide/architecture.md`、`agent-loop.md`、`run_agent.py`、`agent/conversation_loop.py` | 实现结构；维护负担是分析判断 |
| 工具 Schema、处理函数和可用性检查集中注册 | `tools/registry.py` | 工具接入机制，不等于后端授权 |
| Skills 索引在 volatile 层 | `agent/system_prompt.py::build_system_prompt_parts` | 以实际实现为准；`prompt-assembly.md` 有一处旧 stable 文字与同页列表及源码矛盾 |
| Memory 写入不等于当前缓存提示词立即更新 | `website/docs/user-guide/features/memory.md`、`agent/system_prompt.py::invalidate_system_prompt` | 新会话与压缩重建路径可以重载；不能笼统写成只在新会话更新 |
| 复盘在工具分发侧收窄能力 | `agent/background_review.py::_review_tool_whitelist` | Memory 还受触发条件限制，允许只读文件工具及配置扩展；工具定义可保留父级以复用缓存 |
| Memory / Skills 写入审批可选且默认关闭 | `memory.md`、`skills.md` 的 write_approval 配置 | 不把审批画成任何配置下都必经的路径 |
| 运行中子任务崩溃后为 unknown，完成结果可重新交付 | `website/docs/user-guide/features/delegation.md` 的 Lifetime and Durability | 明确区分结果交付与执行恢复；不将 cron/background shell 推导为任意执行点恢复 |
| 文件工具保护不约束全部 Shell 权限 | `website/docs/user-guide/security.md` 的 File Write Safety | 属于文档明确边界；未进行攻击实验 |

经验污染、协议兼容成本、SQLite 的部署取舍，以及幂等/对账接入建议，均是基于上述机制的工程分析，不能当作实测缺陷或上游性能结论。

## Graphify 检索边界

读取现有 `graphify-out/graph.json` 的 217 个节点及标签词汇；没有 Hermes 节点或 Hermes 专属词汇。本次选词为 `[]`，因此未进行泛词遍历或重建。图谱不足以支持该项目结论，改用官方固定源码。未调用 Graphify 的 LLM 提取，额外提取 Token 成本为 0；本次助手阅读/写作 Token 未单独计量。

## 验证

结果记录在 `validation.json`。文章含一个原创可编辑 Mermaid 概览、六节正文；没有新增文章或导航分组，没有修改其他项目文章、首页或 WeChat 文件。工作区同时存在其他任务的改动，整站数量为共享工作区快照。
