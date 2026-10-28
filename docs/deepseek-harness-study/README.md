# DeepSeek Harness 架构取舍研究

2026-09-20。用户要求一篇讨论 DeepSeek Agent Harness 架构设计优缺点的 Blog。在现有 `src/content/writing/deepseek-harness-composition.md` 上重写，保持 URL、2026-09-05 原发布日期及三个历史章节锚点，更新修订日期。没有增加第二篇同项目文章。

## 研究版本与边界

- 官方仓库：<https://github.com/deepseek-ai/deepseek-harness>。
- 固定提交：`ddefc45fbc7f8e46dd73185e68295696d1297887`，GitHub commit API 返回提交时间 `2026-09-17T13:19:19Z`，合并说明为 `release(dsh): 0.1.6-alpha.2`。
- `sources.json` 保存 25 份成功获取的官方文档、源码和许可证的 URL、字节数及 SHA-256，另保留旧 Worker Thread 路径的 404 记录。该旧路径未用于新版论证。
- 完整第三方响应暂存 `/tmp/aidea-deepseek-harness-ddefc45-sources/`，不纳入仓库。正文使用不可变提交链接，便于重新取得来源。
- 文档与关键源码静态核对；没有启动 Harness、模型、Provider、业务工具或操作系统沙箱，没有进行性能或安全实验。
- 修复登录超时、远端效果已发生但日志缺结果、多个 Agent 写同一文件，均为说明性假设。五项验收场景是未执行的建议。
- 本轮仅本地修改，未获新的发布授权；没有推送、部署或生成微信公众号改编。

## 论证结构

六节依次解释整体职责、插件组合、日志与恢复、工具与权限、PTC 与多 Agent、采用条件。一张原创 Mermaid 总览图表达宿主组合、会话配方、模型请求、受控工具执行和反馈；一张表汇总六项设计的收益和代价。图省略 UI、重试与取消分支，由文字限定。

采用判断是本文解释，不是官方性能结论：可替换能力有助于长期演进，但把理解、集成与治理责任转移给平台团队；小型固定任务可只借鉴其中契约。

## 关键修正与静态证据

| 核对项 | 固定提交中的证据 | 文章边界 |
|---|---|---|
| 插件退出 | `docs/cordis-tutorial/02-lifecycle-and-effects.md` | 受管资源清理不等于业务回滚；多个异步 disposer 不自动严格串行 |
| 请求来源 | `packages/core/agent-loop/src/invariant.ts` | 存在请求重建检查插件，不宣称任意自定义组合都会自动启用它 |
| 流式记录 | `packages/core/agent-loop/src/assistant-stream.ts` 的 `push`、`settle` | 增量在内存累积并广播，结算才追加对应事件；硬崩溃前未结算流不能保证恢复 |
| 存储范围 | `packages/core/agent-loop/README.md` 的 Persistence integration | 无存储 Provider 时是内存会话；日志提交与物理持久化边界需区分 |
| 工具授权 | `packages/core/tools/src/index.ts` 的 `createExecution`、`prepareExecution`、`serviceAsk` | 参数身份固定、审批缺失拒绝、Guard 无 force-allow；不隔离恶意同进程插件 |
| 并发 | `packages/core/agent-loop/src/tool-calls.ts` | 有界并发池及独占屏障落实工具分类，不证明分类本身正确 |
| 工具值 | `docs/subsystems/tools.md` | 规范值在执行期使用，持久投影不承诺保留全部程序中间值；展示脱敏不等于隐藏程序值 |
| PTC 更新 | `packages/ptc-runtime/ptc-runtime-node/README.md` 与 `src/index.ts` | 当前是新 Node 进程、所选文件沙箱与受管清理，取代旧 Worker Thread 描述；网络、进程树资源与逃逸后代仍有边界 |
| 团队协调 | `docs/subsystems/agent-team.md` | Experimental；writeScopes 是提示不是锁；消息交付不等于任务验收 |

`agent-loop/README.md` 的 Turn flow 仍有一句 chunk 在 durable frame settlement 后发布的措辞；本文对具体流式提交顺序以 `assistant-stream.ts` 实现及 `docs/architecture.md` 的 transient chunk / final settlement 描述为准，不扩大为逐片段落盘承诺。

历史版本 `76fda729799fe9b3848dbe2c211d4b231032b81e` 及其他研究记录不修改；新版不沿用旧版逐 chunk 持久化或 Worker Thread 的现状描述。

## 验证

验证结果写入 `validation.json`；页面显示检查另见 `browser-results.json`（如生成）。这些检查只验证文章、站点与图表，不验证 DeepSeek Harness 的运行行为。

最终验证通过：隔离快照采用原 package-lock.json 重新 npm ci 后执行完整 npm run build，生成 126 页面，内容 79 篇 / 24 分组 / 8 方向，图谱 149 节点 / 635 连线。桌面 1440px 与手机 390px、浅深色四种组合通过，Mermaid 无错误、页面无横向溢出、缩放复位正常、三个历史锚点存在。最终截图经人工式视觉检查，修正初版回边标签靠近问题。共享工作区另有并行任务修改其他文章，数量描述验证快照，不构成本次发布范围。原工作区构建卡在依赖文件读取；没有改动其依赖或锁文件。
