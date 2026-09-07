# Harness、模型 API 与身份协议研究

用户于 2026-09-07 明确要求每个协议一篇深度文章，并在完成后推送。本批从 `783945c` 出发：扩展现有 MCP 文章，新增九篇，形成十篇协议文章；全站 72 篇、24 组、8 个知识方向。MCP 原 URL 与 2026-09-05 发布时间保留，其他文章发布时间为 2026-09-07。Lu Qi 和其他已有文章正文未修改。

## 文章与研究范围

| 文章 | 固定基线／范围 | 主要问题 |
| --- | --- | --- |
| MCP：模型上下文协议 | 2025-11-25 | Host/Client/Server、原语、握手、传输、任务、授权、取消与对账 |
| A2A：Agent 协作协议 | 1.0.0 | Card、Message、Task、Artifact、绑定与版本、委派和终态 |
| AG-UI：Agent 前端交互协议 | 2026-09-07 文档及固定 core 源码；基础事件子集 | 运行输入、事件身份、消息/工具、快照与增量、恢复 |
| A2UI：Agent 界面描述协议 | v0.9 消息格式 | Catalog、Surface、组件图、数据模型、动作、增量渲染 |
| ACP：编辑器与 Agent 通信协议 | Agent Client Protocol v1 | 双向请求、会话、Prompt Turn、工具、审批、文件与终端 |
| Agent Skills：技能规范 | 2026-09-07 开放规范及固定源码 | 文件契约、渐进加载、兼容性、版本与工具执行边界 |
| OpenAI API：模型接口协议 | 2026-09-07 官方文档；Responses 为主 | Items、工具闭环、流、会话、Chat/Realtime 与兼容性 |
| Anthropic API：模型接口协议 | 2026-09-07 官方文档；直接 Messages API | 内容块、工具回传、停止原因、流、Thinking 与缓存 |
| OAuth：授权协议 | RFC 6749/7636/9700 等 | 授权码、PKCE、令牌、受众、刷新、委派 |
| OpenID Connect：身份认证协议 | Core/Discovery 1.0 含勘误 | ID Token 验证、身份映射、JWKS、会话与退出 |

六篇 Harness 协议归入 `/series/harness-protocols/`，两篇模型 API 加入既有模型接入分组，两篇身份文章归入 `/series/identity-authorization/`。没有迁移全站三类导航，没有新建研究方法总论。Skills 被明确标为资产格式规范，厂商模型 API 被明确标为接口契约，避免把所有内容都当作同一种网络协议。

## 来源与可复核性

- `repository-baselines.json`：五个官方仓库的检索时固定提交；仓库 HEAD 不表示某规范版本的发行标签。
- `source-files.json`：实际读取的 ten upstream files 的路径、固定 URL、SHA-256 和体积。未把上游源码全文复制进本站。
- `sources.json`：文章中官方引用的可达性、下载哈希、归属文章。网页是检索时快照，不能据此声称未来不变。
- `fetch-baselines.py`：下载固定源码到 `/tmp/aidea-protocol-sources/` 供核验。
- `check-sources.py`：验证新增来源；已有成功记录复用其原始哈希。重新核验全部来源可先将旧 `sources.json` 移出后运行，不能把缓存误称为新的下载。
- `manifest.json`：文章清单、最终 SHA-256、图表数量和发布时间。

A2UI Catalog ID 只是约定标识，不要求能从网络下载。ACP 的版本字段按 v1 Schema 使用整数。Anthropic 新文档中部分模型支持中途 system 消息，文章没有延续“所有 messages 仅允许 user/assistant”的过时泛化。MCP Tasks 保留其选定版本的实验性标注。

## 验证及限制

`check-examples.py` 需要 Python 3 与 jsonschema，先运行 `fetch-baselines.py` 获取固定文件。检查文章 JSON 语法，使用官方 ACP v1 Schema 检验 initialize 参数，使用 A2UI v0.9 envelope 和 basic catalog 检验两条示例，并用错误版本、错误参数类型和未知组件作为反例。另校验两篇模型 API 中自定义工具的参数 Schema。结果见 `example-results.json`。

这些检查不启动真实 MCP/A2A/ACP 服务，不建立 Agent 交互会话，不调用模型，不连接 OAuth/OIDC 提供商，不验证真实 JWT 签名。文章中的生产接入用例是待执行的验收设计；原 MCP 本地状态模型的实验限制原样保留。

每篇含四张 Mermaid 图，共 40 张；状态图中应用自定义状态均有明确说明。`check-browser.mjs` 检查十篇页面在 1440/390 像素、明暗主题下的图表、页面边界和缩放。运行方式：

```sh
BLOG_PLAYWRIGHT_ROOT=/path/to/node_modules BLOG_BASE_URL=http://127.0.0.1:4398 node docs/protocol-study/check-browser.mjs
```

结果见 `browser-results.json`。代表性架构、时序、状态截图已检查；图表原图无需上传。构建执行 `npm run build`，含目录、文章链接、阅读时间下限和知识图谱检查。结构检查不构成每个协议的端到端互通认证。

用户已授权推送本批内容到 origin/main；后续新内容仍需新的发布请求。
