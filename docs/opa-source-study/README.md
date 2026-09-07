# OPA：策略求值、执行边界与授权更新

研究日期：2026-09-07。新增一个完整 GitHub 项目研究，补充 Harness 的策略引擎与执行点分工。当前本地 60 篇、22 组、8 个方向；线上仍为 `d4acb13` 的 58 篇，LiteLLM 和本篇 OPA 均未发布。

## 固定对象与证据

- 仓库 `open-policy-agent/opa`，标签 `v1.20.2`，提交 `b2c26708e9d55645d7f837db495031f7e4152594`。
- 官方 `opa_darwin_arm64` 二进制 SHA-256：`54e7008e696d39e8e4f96594e2b71bcbe45fd9a4f838102bcf1240638bf3fbe1`，与 GitHub Release API 的资产 digest 一致。程序 `opa version` 报告相同版本及提交。
- 分析九个 Go 文件，源码永久链接和 SHA-256 见 `sources.json`。实验使用官方构建，不宣称自行编译或完成可重复构建验证。
- 正文 `/writing/opa-policy-architecture/`，归入技术架构 → 工具与能力路由；关联执行安全、故障恢复与并发文章。

## 复现

本次环境为 macOS arm64。Python 仅使用标准库。解压后进入本目录：

```sh
curl --fail --location --output opa https://github.com/open-policy-agent/opa/releases/download/v1.20.2/opa_darwin_arm64
chmod +x opa
OPA_BIN=./opa python3 lab.py
```

脚本在执行程序之前核验二进制哈希，然后确认版本。它为 macOS arm64 固定了对应资产；其他平台需要另行获取并核对官方同版本资产及记录，不能直接复用此哈希。

下载程序需要网络。实验仅使用本地文件和绑定到 `127.0.0.1` 随机端口的 OPA REST 服务；服务关闭遥测，未配置远程 Bundle 或日志接收器，Rego 不使用外部请求内置函数。测试 HTTP 客户端绕过系统代理。脚本在 finally 中结束服务并清理临时文件；结果写入 `results.json`。不应使用 `python -O`，它会禁用断言。

## 十二组已执行实验

八组授权输入：范围内读允许；其他团队资源拒绝；缺认证事实拒绝；无审批写拒绝；匹配审批允许；参数变化拒绝；审批到期拒绝；审批策略版本过旧拒绝。

四组机制实验：未组合的 allow／deny 可以同时成立；完整文档输出不同值产生 `eval_conflict_error`；分别构建加载 r1／r2 Bundle 后相同输入结果不同；真实 REST 查询的允许、拒绝、未定义均返回 HTTP 200，结果分别为 `true`、`false` 和缺少 result。

`policy.rego` 是教学策略。`pitfalls.rego` 刻意展示缺少组合与输出冲突，不能作为推荐的访问控制策略。Python 只构造输入、调用官方 OPA、断言返回值，没有模拟 Rego 求值。

## 明确未验证的范围

- `authenticated`、审批 `verified`、资源归属及当前时间均由可信测试驱动提供，没有真实认证或签名验证。字段为真不意味着 OPA 已完成验证。
- 审批对象绑定为示例规则；未执行工具写入、资源锁定、权限撤销、签名存储或沙箱实验。
- 两份 Bundle 由两个独立 CLI 加载。没有测试热更新、远程分发、激活失败、旧版本持久化、多实例传播或即时撤权。
- Bundle 插件的事务、服务端 Prepared Query 缓存、日志遮蔽仅来自源码分析。未跑嵌入 Go API、Wasm、性能压测或日志插件。
- Bundle 清单 revision 与 `data.policy.revision` 由脚本主动设置一致；后者是教学策略自定义数据，不是 OPA 自动维护的审批字段。

对外 ZIP 包含本目录六个文件：README.md、lab.py、policy.rego、pitfalls.rego、sources.json、results.json，不附二进制或上游源码。下载来源与校验值已记录在 sources.json 中。
