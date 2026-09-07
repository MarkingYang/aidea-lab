# LiteLLM：路由、回退与预算边界

研究日期 2026-09-07。此前 58 篇文章已推送至 `origin/main`，提交 `d4acb13`，并确认线上更新。本研究是“推送，然后继续”的后续本地工作，新增一篇完整项目文章，现为 59 篇、22 组、8 个方向；尚未发布。

## 固定对象

- 仓库 BerriAI/litellm，标签 v1.100.0，提交 `e4f25265704e2b2c6cf6e81be2e4c5cffff896f4`。
- 实验包 `litellm==1.100.0`。分析 Python SDK 异步 Router、选路、回退、缓存与 Proxy 预算检查；不覆盖仓库全部服务。
- `sources.json` 保存 13 个文件的永久链接和 SHA-256，其中 11 个 Python 文件在运行前与安装包逐一核对。另两项为 pyproject.toml 和 LICENSE。
- 文章 `/writing/litellm-gateway-architecture/` 归入模型方向的现有分组，关联模型网关机制、工具契约和操作恢复。

## 复现

已在 macOS arm64、Python 3.12.13 执行：

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python lab.py
```

安装依赖需要联网；实验设置本地模型成本表、关闭遥测，并在导入包之前阻止 socket 网络连接。运行结果写入同目录 `results.json`，断言网络连接尝试为零。不要使用 `python -O`，它会关闭实验断言。

锁定列表保存本次安装的依赖版本，不保证不同平台使用同一个二进制 wheel。源码哈希检查约束本文分析的 Python 文件，不是所有依赖的供应链审计。

## 已运行的八组实验

| 场景 | 实际入口 | 结果 |
| --- | --- | --- |
| 别名与权重 | Router.async_get_available_deployment | 别名解析后选中权重 1 的部署，另一个为 0 |
| 全部零权重 | 同上 | 仍返回候选之一，不把随机样本用于概率结论 |
| 同组重试 | Router.acompletion | 一次受控 500 后第二次成功 |
| 跨组回退 | 同上 | primary → backup |
| 超窗专用回退 | 同上 | primary → long，不经过普通 backup |
| 禁止回退 | 同上，另设零重试 | 仅主组调用，原 InternalServerError 返回 |
| 禁用部署 | Router.async_get_available_deployment | blocked=true 的部署不被选中 |
| 内存缓存隔离 | DualCache.set_cache/get_cache | 第一实例读到 7，第二实例读到 None |

只在 `litellm.acompletion` 提供方函数边界替换固定响应／错误，没有替换 Router 的路由、重试或回退实现。直接选择实验走真实异步部署选择。缓存实验使用真实 DualCache 实例。

所有 Router 实验关闭冷却，以分离故障控制流；每个请求实验组只有一个部署，不能由两次同模型调用推导一般重试永远落到同一部署。`long` 只是配置组名；无真实上下文容量实验。

## 仅源码分析与未验证内容

- 同组 order、可选 weighted failover、least-busy、usage-based-routing-v2、冷却和流式回退条件仅阅读源码。
- Proxy 身份与预算链路、Redis 优先费用读取及不可验证时的可选拒绝策略仅阅读源码。
- 未启动 Proxy、Redis 或数据库，未验证多实例并发、费用写回、预算超调、故障恢复与 HTTP 传输。
- 未调用模型，不能推导质量、速度、费用或模型能力等价。
- 普通状态缓存与模型响应缓存分开；本实验没有测量生成响应的缓存命中。

对外实验包 `/labs/litellm-source-study.zip` 仅包含本目录五个文件：README、lab.py、results.json、sources.json、requirements-lock.txt，不附第三方源码或环境。
