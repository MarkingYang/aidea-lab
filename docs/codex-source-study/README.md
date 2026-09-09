# Codex 固定源码研究

2026-09-08，深化现有一篇 Codex 文章，保留 URL、标题与 2026-09-05 发布时间。本文修订日期为 2026-09-08。新增内容仅在本地，未授权发布。

基线：`openai/codex`，提交 `4b0d9669cc46ba97bf85fa6312431b630d80498d`，提交时间见 `sources.json`。本轮从公开 GitHub 克隆读取；研究缓存位于 `/tmp/aidea-codex-source-20260908`，复现不依赖该临时目录。

## 声明、实现与解释

| 声明 | 路径（省略 codex-rs/）与符号 | 性质与边界 |
| --- | --- | --- |
| App Server 向内核提交回合输入 | app-server/src/request_processors/turn_processor.rs: turn_start_inner | 静态调用链；不代表所有 CLI 都通过 App Server |
| 线程接口提供 start / steer / recover | core/src/codex_thread.rs: CodexThread | API 及委派实现；不把内核持续回合全部归到桌面 App |
| 操作与运行状态集中接纳 | core/src/session/handlers.rs: submission_loop；turn_input.rs: start_or_steer / start_if_idle | 读取了输入分支及锁内检查；未执行并发测试 |
| Session 与回合、步骤配置分工 | core/src/session/session.rs、turn_context.rs、state/session.rs | 阅读相关结构；不声称每个字段都持久化 |
| 一轮工作内多次模型与工具往返 | core/src/session/turn.rs: run_turn / try_run_sampling_request | 读取流程、流事件及继续判断；未调用模型 |
| 完成条目转换为工具调用 | core/src/tools/router.rs: build_tool_call | 选定 FunctionCall / CustomToolCall 路径；非全部 provider 审计 |
| 模型视图与历史不同 | core/src/context_manager/history.rs: for_prompt / normalize_history | 调用输出补齐、孤立输出处理及模态过滤 |
| 缺失结果补成 aborted 不证明未执行 | core/src/context_manager/normalize.rs: ensure_call_outputs_present | 合成结果是源码事实；不证明副作用是工程解释 |
| 运行恢复读取压缩及回合元信息 | core/src/session/rollout_reconstruction.rs: reconstruct_history_from_rollout | 读取恢复路径；未测摘要质量、损坏历史和版本迁移 |
| 工具声明与共享读写执行门 | core/src/tools/parallel.rs: handle_tool_call_with_source；router.rs: tool_supports_parallel | 不是资源名锁或全局分布式锁；未跑竞态测试 |
| 审批、沙箱与重试集中处理 | core/src/tools/orchestrator.rs: run | 检查升级条件、网络及严格审查分支；不是所有工具统一经过本地沙箱 |
| 挂起交接先后顺序与输入损失边界 | core/src/session/turn_suspension.rs: suspend_turn_and_shutdown | 首次 flush 后才取消；后续 flush/close 后报告成功；未处理输入会清理，后代检查是快照 |
| Rollout 刷新不构成断电测试 | rollout/src/recorder.rs: write_pending_once / write_pending_items_once | 读取 flush 与逐项写入路径，不推导断电耐久性 |
| Skills 进入输入与调用记录 | core/src/skills.rs；session/turn.rs: build_skills_and_plugins | 阅读配置输入与注入记录；未覆盖全部技能加载器、桌面 Memory / Automation |

正文对“为什么”的解释来自实现责任与反例，未把工程推论伪装成作者公开动机。并发、恢复、权限等机制的源码存在，不等于所有调用者、配置或平台都完成验证。

## 核验与复现

`sources.json` 保存 17 个所引用或用于理解结构的源码文件、完整提交、永久 URL、SHA-256 与行锚点；`verify-sources.py` 只检查来源身份与锚点，没有重写或执行上游算法。

```sh
# 独立下载固定提交中的文件并校验；需要访问 GitHub Raw
python3 verify-sources.py
# 或对照自行检出的固定提交
python3 verify-sources.py --source-root /path/to/codex
```

本轮实际使用本地固定提交完成校验，结果见 `source-verification.json`。没有编译 Rust、运行上游单元测试、启动 App Server、调用模型或测试沙箱。提供本地源码选项是为了不把网络可用性混为内容匹配。

官方 App Server 文档核对入口为 `https://developers.openai.com/codex/app-server/`，当次重定向到 `https://learn.chatgpt.com/docs/app-server`。正文仅以它解释公开 Thread / Turn / Item 概念；具体运行论断由固定源码支持。

## 与其他文章的连接

- Harness 主文：同一工单任务中的职责、源码参照及设计理由。
- Agent Runtime：用 Codex 区分线程接口、Session 与回合；补充挂起交接的责任。
- 架构选型：通用业务边界的 8 组反例由 `../architecture-rationale/` 独立记录。

工单实验没有运行 Codex，不能算作本项目实验。新内容不改变任何历史实验结果。发布包 `/labs/codex-source-study.zip` 仅含本目录说明、来源清单、校验脚本和校验结果，不含第三方源码或用户运行数据。
