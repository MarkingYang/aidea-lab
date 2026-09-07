# OpenCode 与 Kimi Code：上下文和工具执行研究

发布授权补记：2026-09-07 用户要求推送，本研究随 58 篇文章批次发布；下文未发布字样保留为研究阶段记录。

核对日期：2026-09-07。深化现有两个项目文章，不新增分篇，不发布。本轮仍为 57 篇。上一篇补充见 `../harness-source-study/README.md`。

## 范围与版本

| 项目 | 固定提交 | 研究范围 |
| --- | --- | --- |
| anomalyco/opencode | e207624c48159b03dbe17dbc8e51bbcf23e72df5 | packages/opencode 的 Session 路径；单独测试 packages/core 的 run-coordinator |
| MoonshotAI/kimi-code | bb16383aa15f72954224d37ee0b9babb807e03b3 | TypeScript packages/agent-core-v2；不套用旧 Python kimi-cli 调用链 |

`sources.json` 保存文章所用源码／官方文档的永久链接、哈希及声明分组。`lab-sources.json` 是运行实验所需的原始源码文件及 SHA-256；运行器验证每个文件，并检查打包实际载入的项目源码是否全部在清单内。没有复制或重写待验证算法。

公开文章：

- `/writing/opencode-system-overview/`：会话循环、旧输出清理与完整摘要、工具终态、运行协调器、扩展取舍。
- `/writing/kimi-code-system-overview/`：历史投影、结果未知、压缩切点、批次与调度、取消、输出、委派。
- `/writing/harness-operations-context/` 和 `/writing/harness-engineering-tools/`：引用上述完整研究，补充具体实现边界。

## 复现

需要 Node >= 24.15、npm 以及访问 GitHub Raw 和 npm registry 的网络。首次运行从固定提交下载清单中的源码到 `.sources/`，校验哈希，再用 esbuild 编译原始 TypeScript 模块。下载的源码仅用于本地实验，压缩包不附带第三方源码或依赖目录。

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

Node v26.0.0、Effect 4.0.0-beta.83、esbuild 0.25.12 下已运行；依赖树见 `package-lock.json`。结果写入当前实验目录的 `results.json`。

如果网络必须经过代理，需要设置 `HTTP_PROXY`／`HTTPS_PROXY`，再用 `node --use-env-proxy run.mjs` 运行；Node 不会自动沿用 macOS 系统代理。首次直连下载在本研究环境超时，配置代理后从独立缓存校验运行通过。

研究环境也可设置 `STUDY_SOURCE_ROOT` 指向已有的 `opencode-files/` 与 `kimi-code-files/` 父目录，以及 `STUDY_JS_DEPS` 指向已经安装相同锁定版本依赖的目录。普通复现不需要这些变量。运行器仅删除自己创建的临时打包目录。

## 已运行的九组实验

| 场景 | 输入／干预 | 实际结果 |
| --- | --- | --- |
| Kimi 继承快照的未闭合交换 | 两个工具调用，只提供 a 结果，助手消息 partial | 补 b 的未知结果，清除复制对象 partial；原输入未变 |
| Kimi 压缩预算与切点 | 100000 窗口默认配置；七条消息，近期参数分别 4/5 | 阈值 50000；压缩前缀长度分别 6/2，未切开工具交换 |
| Kimi 参数解析 | 非法 JSON 与空字符串 | 非法 JSON 有 parseFailed，空字符串没有 |
| Kimi 批次缺失结果 | a/b 收齐后只返回 a | 执行器调用一次；b 收到明确错误 |
| Kimi 未收齐即取消 | 仅 a 到达就 abort | 返回错误，执行器调用零次 |
| Kimi 输出保留 | 写入 10000005 字符 | 保留 10000000，总量记为 10000005 |
| OpenCode 同 key 合流 | 运行中再次 run | drain 调用一次 |
| OpenCode wake 合并 | 运行中两次 wake | 原运行一次，后续运行一次 |
| OpenCode interrupt 清理 | 中断等待中的 drain | interrupt 返回前 finalizer 已完成 |

压缩切点实验特意注入每条 10 Token 的确定性估计器，以隔离边界算法；这不是实际 Token 测量，也不是摘要模型实验。最初“近期参数 4 会保留完整工具尾部”的假设被实际结果否定；已据源码和输出修正正文，不改变上游算法以迎合预期。

## 证据边界

- Kimi 工具执行器是确定性替身，仅验证 Machine Tools 适配器；完整 Schema、权限、ToolScheduler 与工具实现没有在本实验启动。
- Kimi 的一般 Projector、摘要服务并发应用检查、事件恢复和子任务创建以源码／文档为据；实验只运行继承快照辅助函数、策略、参数解析、适配器及输出累积器。
- OpenCode 的三个实验只验证 core 协调器模块；不能据此断言每条客户端路由均经过该模块。SessionPrompt、SessionProcessor 和 SessionTools 的分析是另一条明确标出的源码路径。
- 未启动完整应用、真实 LLM、跨进程服务或外部写入。没有摘要质量、任务成功率、性能排名或自动事务回滚结论。
- 取消后的晚到结果、进程崩溃恢复、跨客户端状态、多 Agent 写冲突仍需整机实验。

## 归档

`public/labs/context-tool-study.zip` 对外提供本目录的 README、两份源码清单、脚本、package/lock 文件及结果；不包含 `.sources`、node_modules 或临时产物。新增／修改正文遵守无图片原则，保留原发布日期和显式锚点。当前只做本地预览，等待新的发布请求。
