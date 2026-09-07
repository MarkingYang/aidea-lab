# Haystack：RAG、图执行与工具封装

发布授权补记：2026-09-07 用户要求推送，本研究随 58 篇文章批次发布；下文未发布字样保留为研究阶段记录。

研究日期：2026-09-07。新增一篇完整项目文章，不拆成组件系列。本地 58 篇、22 个分组、8 个方向，尚未发布。

## 固定范围

仓库：deepset-ai/haystack。提交：`82da3adc2fac4675b80ff5573b790ec07113697b`，提交时间 2026-09-04T17:03:40Z。包版本：`3.2.0rc0`，发布候选，不能套用到 2.x。

分析 Pipeline、组件输入与触发、连接校验、同步／异步调度、Router、Joiner、BM25、PromptBuilder、PipelineTool、Agent 边界及快照。源码永久链接和 SHA-256 见 `sources.json`；Agent 内部循环、快照恢复和分布式部署仅有源码分析，没有实测。

## 复现

已在 macOS arm64、Python 3.12.13 下安装固定提交源码及依赖运行。实验会先校验已安装包版本和清单中 16 个 haystack 源文件哈希；另记录 pyproject.toml 与 VERSION.txt 的源码哈希。依赖版本见 `requirements-lock.txt`，Haystack 源码归档 URL 带 SHA-256。

在解压后的本目录运行：

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python lab.py
```

也可以使用 uv 创建隔离环境并安装同一份 requirements。安装需要访问 GitHub codeload 与 Python 包源；实验本身不请求模型或外部存储。脚本关闭 Haystack telemetry 和内容 tracing，结果写入同目录 `results.json`。

锁定列表保存 Python 包运行依赖版本；构建后端由上游 pyproject 定义。不同操作系统可能选用不同 wheel，因此这不是所有平台二进制完全相同的保证。

## 十一组已执行实验

| 场景 | 验证对象 | 结果 |
| --- | --- | --- |
| 插口类型 | int 输出连接 str 输入 | 执行前拒绝 |
| 同步分支 | 两个独立分支再 Variadic 汇合 | 活跃峰值 1，汇合一次收齐 a/b |
| 异步上限 2 | 同一结构 | 活跃峰值 2，汇合一次收齐 a/b |
| 异步上限 1 | 同一结构 | 活跃峰值 1，汇合一次收齐 a/b |
| 互斥路由 | ConditionalRouter + BranchJoiner | 返回被选中的 positive，不等待未选路径 |
| 循环与上限 | join → increment → route → join | 从 0 迭代到 3；过低组件上限触发异常 |
| 排名融合 | 固定两路候选与不同尺度分数 | concatenate 为 a/b/c；RRF 为 b/a/c |
| 检索工具 | 真实内存 BM25 → PromptBuilder → PipelineTool | 仅返回 A 范围文档，模板含来源编号，工具只暴露 query |
| 过滤策略 | 初始化 A、同字段运行时 B | REPLACE 与 MERGE 都返回 B；显式 A AND B 返回空 |
| 原生异步清理 | 一项等待、另一项抛错 | 清理函数先完成，调用者后收到错误 |
| 同步线程取消 | 同步组件在线程等待，另一项抛错 | 流水线已失败后，线程仍可完成本地效果 |

并发实验用活跃计数而非墙钟耗时证明重叠；短等待只是创造可调度的重叠窗口。失败实验用事件门闩固定先后关系，没有外部写入。

## 一项被实验推翻的假设

原先预期 MERGE 会把初始化 A 和运行时 B 取 AND。真实运行返回 B，并给出初始化同字段被忽略的日志。检查 `document_stores/types/filter_policy.py` 确认同字段的运行时覆盖规则，已修正正文和断言；没有修改上游代码来满足原假设。显式逻辑 AND 作为对照返回空集。

这属于过滤配置语义研究，不是针对任何实际部署的鉴权测试。应用仍需可信身份、不可覆盖的范围与独立权限检查。

## 证据与限制

实验真实使用固定提交安装的 Pipeline、BM25、DocumentJoiner、BranchJoiner、ConditionalRouter、PromptBuilder、PipelineTool。自定义组件只提供整数递增、固定输出、等待、活跃计数与可控制错误，不替代调度器。

- 未调用 LLM、学习型 Embedding、Rerank 模型或外部向量库，不给出准确率或性能排名。
- 排名融合使用手工候选；不把融合后的名次解释为事实正确性。
- 查询工具限定过滤与参数，是教学宿主构造；不是完整认证、多租户或权限撤销验证。
- 未做真实 Agent 循环、快照续跑、进程崩溃或 Worker 接管实验。
- 实验以 Python 断言验收，不应使用 `python -O` 运行。

## 站点关联

正文 `/writing/haystack-pipeline-architecture/` 归入 Harness → 运行与编排框架；链接 LangGraph、Temporal、上下文组装与记忆检索。记忆检索篇补充排名融合与过滤覆盖事实，上下文篇补充从 Document 到模型输入的明确路径。

对外实验包 `/labs/haystack-source-study.zip` 包含 README、lab.py、results.json、sources.json 和 requirements-lock.txt。它不附带上游源码、虚拟环境或第三方依赖；安装时下载固定源码。
