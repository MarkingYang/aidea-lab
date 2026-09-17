# 当前版本：凝练协议范例与执行边界

2026-09-17，用户反馈“不够简洁凝练，重点突出”。在原 URL 重写，阅读时间由 33 分钟减为 11 分钟。

- 保留协议介绍与对照、OpenAI Responses / Anthropic Messages 各一组工具定义—调用—结果范例，共六个 JSON 块。
- 将交互聚焦为一张时序图，突出生成、执行、状态与完成判断四个问题。
- 删除重复 Chat Completions 报文、独立状态图、分层图、SSE 分片代码和 Runtime 伪代码；保留必要的严格输出、思考状态、托管工具边界与官方引用。
- 沿用原研究来源及核对日期，没有新增提供商能力结论或执行真实调用。`sources.json` 是原研究证据；下方记录是历史长稿范围，不能当作当前篇幅与范例数量。
- 当前范例验证在 `example-validation.json`；当前页面验证在 `browser-results.json`。历史长稿已通过的验证不替代当前检查。
- 当前构建、内容与图谱检查通过：79 篇文章、24 分组、8 方向，149 个节点、632 条连线。
- 用户随后明确要求“发布”，授权本篇精简版、目录入口和研究记录通过 origin/main 发布；下方“未发布”表述为此前历史记录。保留原发布日期与 URL。
- 发布范围不包含调用生命周期文章、杨植麟采访、首页改动或历史归档。79 篇为此前全本地口径；发布时从 origin/main 隔离构建。隔离版本构建通过：77 篇文章、24 分组、8 方向，146 个图谱节点、620 条连线，见 `publication.json`。

## 历史长稿研究记录

# 从模型 API 看 Agent Runtime 边界

2026-09-17。用户请求先介绍 OpenAI 与 Anthropic 协议并给出具体范例，再围绕协议支持的能力、模型内部与外部 Agent Runtime 的分工写一篇 Blog。

新增 `src/content/writing/model-api-agent-runtime-boundary.md`，加入现有“模型能力与接入”分组。本文是一个完整的边界问题研究，保留两篇原有厂商接口文章与调用生命周期文章。阅读时间按站点算法为 33 分钟。

## 研究范围

- 主路径为 OpenAI Chat Completions、Responses 和 Anthropic Messages 的普通同步客户端函数工具往返。Responses 和 Messages 各展示两个请求及响应投影；Chat 展示请求、工具调用与追加结果消息。
- 统一使用虚构订单 O-1042 和明确标注的 `MODEL_ID`、密钥与响应 ID 占位符。响应、SSE 事件为字段投影，不声称完整原始报文。实际推理状态必须按模型契约保留。
- 两个 OpenAI 请求通过 `previous_response_id` 续接并重发 `instructions`；Messages 保留 assistant 内容并通过下一条 user 的 `tool_result` 续接。工具参数严格生成不等于身份、业务权限或事实校验。
- 区分模型推理、厂商 API/托管编排、外部 Runtime、实际工具环境四类责任。三张原创 Mermaid 图分别解释客户端往返、责任分层和任务状态；不还原闭源厂商部署，不以图片承载论证。
- 托管工具与混合客户端/服务端调用用于解释“执行责任迁移”。Anthropic `pause_turn` 与等待客户端结果的 `tool_use` 分开处理；未配对结果的 `server_tool_use` 不标记为成功。
- 明确 Anthropic Strict tool use、现行 `output_config.format`、思考摘要和不透明续接状态。兼容性按端点/模型/渠道/功能版本判断，不给出模型质量排名或网关兼容率。
- MCP 是 API 服务到远端工具服务的另一段连接。保留 Anthropic connector 的 Beta/渠道限制，不将它等同于模型 API，也不将基础生成接口等同于托管 Agent 产品。
- Runtime 循环、验收条件、退款故障和幂等设计均为作者提出的解释性设计，未运行。未调用模型、付费 API、Agent SDK、订单服务或退款系统。

## 来源与证据

24 个官方页面的 HTTP 响应记录在 `sources.json`，含实际请求 URL、最终 URL、读取时间、响应字节数及 SHA-256。23 个为两家官方资料，1 个为 Astro 内容集合指南。原始页面暂存在 `/tmp/aidea-api-boundary-sources/`，不将整页第三方内容纳入仓库。哈希固定的是当次响应，不代表网页具有不可变版本。

| 来源 ID | 核查内容 |
| --- | --- |
| o-function / o-migration | Responses 工具定义、调用、结果、迁移与接口对象差异 |
| o-chat-reference | Chat 消息、function 包装、tool_call_id、finish_reason |
| o-response-reference / o-state | instructions 不自动继承、Response 链与 Conversations |
| o-structured / a-structured / a-strict | 最终 JSON、函数参数约束与 Schema 支持边界 |
| o-stream / a-stream | SSE 事件、参数分片、内容块、流内错误 |
| o-reasoning / a-thinking-current / a-thinking | 不透明推理状态、摘要、thinking 配置及旧配置范围 |
| o-tools / a-server | 工具执行位置、服务端循环、pause_turn、混合调用 |
| a-messages / a-tool / a-stop | 无状态基础消息契约、工具结果顺序、错误标记与停止原因 |
| a-overview | Messages 端点、仍支持的 x-api-key 和 API 版本头 |
| a-cache | 缓存前缀、请求历史与计量的不同职责 |
| o-background | 后台生成、查询与取消，不推导业务事务保证 |
| o-mcp / a-mcp | 平台与远端工具服务的连接，连接器支持范围 |
| astro-content | 沿用既有 Markdown 内容集合，不改站点实现 |

OpenAI 通用 create 路径的 Markdown 版本首次返回 404，已改为可读的 Chat 参考页及 CLI Response 创建参考页；后者明确给出 `instructions` 的续接语义。Anthropic 当前 Thinking 的 `.md` 路径返回 403，改读官方 HTML，记录成功响应。Web 工具不能读取 `text/markdown` 时使用只读 HTTP 下载；正文引用成功读取的官方页面。

## 验证边界

- `example-validation.json`：13 个 JSON 代码块解析通过；核对三家接口形状的调用 ID、订单参数、结果一致性及必要历史；两个 SSE 事件投影的外层 JSON 有效，参数分片按预期尚未构成完整 JSON。
- 以上仅为本地语法与范例一致性检查，不是提供商 Schema 全量验证、真实流重放或成功调用证明。没有执行伪代码循环。
- `npm run build` 通过：79 篇文章、24 分组、8 方向；149 个图谱节点、633 条连线。计数包含原有未发布采访稿和调用生命周期文章。
- 初次构建发现 `sse` 不是当前 Shiki 的语言标识，将两个事件代码块改为 `text`，保持报文内容。最终构建仅有既有大 chunk 提示。
- 首次浏览器检查发现运行中的开发服务返回 `504 Outdated Optimize Dep`，未完成 Mermaid 导入；按项目后台服务命令停止并重启，未修改依赖或渲染器。最终桌面/手机、浅色/深色结果见 `browser-results.json`。
- `git diff --check` 通过。来源校验与页面展示检查不证明模型质量、工具执行可靠性、真实权限隔离或业务完成率。

## 本地状态

本篇及研究记录保持本地，等待新的明确发布请求。未推送、未生成或同步微信公众号版本；保留既有采访、归档和其他未发布文章。
