# Pi 架构设计的优缺点

研究与修订日期：2026-09-20。

## 交付范围

用户要求“写一篇 Blog Pi 架构设计的优缺点”。站内已有独立 Pi 文章，因此在 `src/content/writing/pi-architecture-deep-dive.md` 原 URL 改写，保留 2026-09-04 发布日期与三个历史锚点，更新修订日期。沿用既有 Coding Agent 项目目录入口，没有新增重复文章。

正文为六节，围绕默认工具、分层、循环时序、会话状态、扩展与治理、适用条件展开；加入一张原创可编辑 Mermaid 架构图。优点和代价成对解释，模型效果与性能未作排名。原来的 durable 多进程长篇说明改为当前快照的公开导出边界。

## 固定来源

- 官方仓库：`https://github.com/earendil-works/pi`，旧 `badlogic/pi-mono` 地址会重定向。
- 固定提交：`19451accdeec671c1f4da9eafac8fc270f510ef4`，coding-agent 包版本 `0.86.1`。
- GitHub API 核对提交，摘要见 `commit.json`；所选 24 个文件通过固定提交 raw URL 获取，字节数、行数与 SHA-256 见 `sources.json`。
- 上游代码仅暂存在 `/tmp/pi-study-sources/`，不将第三方源码副本纳入文章仓库。
- 浅克隆尝试遇到 HTTP/2 网络错误；随后直接获取上述固定提交文件成功。本记录不声称完整克隆或全仓库审计。
- `docs/blog-rewrite/evidence/pi-source-index.json` 和 O01 历史记录仍对应旧 `e44d75c` 快照，未改写成新版本证据。
- 现有 graphify 图只用于检查站内主题关联；没有 Pi 节点，不能支持 Pi 架构结论。具体机制全部回到官方源码核验。

## 核心论断与核对路径

| 论断 | 固定提交中的依据 | 解释边界 |
| --- | --- | --- |
| 四个默认工具，其他工具另有定义 | `packages/coding-agent/src/core/tools/index.ts` | 默认集合不等于完整能力集合，更不等于最小权限 |
| 默认会话装配仍创建 Agent 与 AgentSession | `packages/coding-agent/src/core/sdk.ts` | 不把实验性包的设计承诺写入默认链路 |
| Provider 与 API、内部上下文与模型消息分开 | `packages/ai/src/models.ts`、`packages/ai/src/types.ts`、`packages/agent/src/agent-loop.ts` | 抽象可替换不代表跨模型效果相同 |
| 默认并行、批次串行降级、结果按调用顺序 | `packages/agent/src/agent.ts`、`agent-loop.ts` | 不是副作用依赖推断、事务或性能实测 |
| steering 与 follow-up 的时序、错误与截断处理 | `packages/agent/README.md`、`src/agent-loop.ts` | 纠偏不撤销已完成动作；循环结束不等于任务验收 |
| 会话树与摘要投影 | `session-manager.ts`、`docs/session-format.md`、`docs/compaction.md` | 会话分支不默认回滚文件；日志不提供业务 exactly-once |
| 扩展可组合，但存在顺序与信任边界 | `docs/extensions.md`、`src/core/extensions/runner.ts`、`docs/security.md` | 组合风险为机制推断，未实测冲突或安全绕过 |
| durable 公开导出边界 | `packages/durable/README.md`、`src/index.ts` | 记录类型和 MemoryStorage 不能证明默认 CLI 已具备持久执行保障 |

## 验证与限制

本次只执行内容、构建、知识图谱和页面渲染检查。没有安装或运行 Pi，没有调用模型、真实 Agent、付费接口、迁移脚本或业务工具；没有运行 Pi 上游测试。代码评审、并发写文件、数据库迁移、分支改文件和创建工单的场景均为假设。

页面检查脚本为 `check-page.mjs`，结果见 `browser-results.json`；站点汇总见 `validation.json`。截图写到 `/tmp/pi-architecture-*.png`，只用于本地质量检查，不作为文章内容。

本轮修改仅在本地，未获新发布请求。无关首页、采访文章、其他未提交文章、历史归档与 WeChat 内容保持原状。

## 最终验证结果

`npm run build` 在 `/tmp/pi-blog-validation-20260920` 的隔离副本通过，包含内容与知识图谱检查：79 篇文章、24 分组、8 方向，149 节点、635 连线。数量属于验证时的共享源文件快照，包含其他任务同时修订的文章，不是本次发布范围。待交付 Pi 源文件与构建副本逐字节一致。

原目录的系统 Node 与备用 Node 都在依赖读取处阻塞，已停止本任务的构建及只读预热进程。隔离构建复制当前源文件，并单独复制相邻 Hermes 验证任务已安装的可工作依赖；未改动共享 node_modules、package.json 或锁文件。Astro 7.2.9、Mermaid 11.17.2。

1440px / 390px、浅色 / 深色四种组合下，图表渲染、无横向溢出、三个历史锚点、放大与复位均通过。首次截图发现长连线标签重叠，缩短标签后重新构建、检查并目视复核；最终截图清晰，无重叠。手机端可使用既有放大控件阅读。外部评论组件的 fetch 错误单独保存在 browser-results.json，不计作正文/图表错误，也不宣称评论服务已通过检查。
