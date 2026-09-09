# Agent Runtime 技术选型

发布授权补记：2026-09-09 用户随后明确要求“推送”，本研究随 74 篇版本通过 origin/main 发布。下文未发布说明及 validation.json 保留编辑与验证当时的历史状态。

2026-09-09。上一批 73 篇文章已按用户“推送，然后补充”的授权推送到 origin/main，提交 `20c5f99f5a09ee1764fe2359fa1533703af5079c`。本目录对应推送后的新补充，仍仅在本地，需新的发布请求。

## 文章范围

新增一篇 `agent-runtime-selection.md`，分别比较执行内核、控制流与状态编排、持久任务执行、执行环境。候选包括应用自建循环、OpenAI Agents SDK、LangGraph、Temporal、OpenHands SDK，以及本地进程、Docker、E2B。按恢复对象、控制所有者和四类场景形成组合，附八类待执行故障验收与可推翻的决策格式。原 Runtime 与 Harness 选型文章只添加入口和修订日期，历史结果不改写。

本文是跨候选选型分析，不将各 GitHub 项目的完整机制文章合并成缩略综述。四张 Mermaid 图均是应用参考设计，状态不是协议或候选框架的标准枚举。

## 证据范围

- `sources.json`：当日获取的官方文档 URL、最终地址、响应字节 SHA-256、声明用途。网页为动态文档，不是锁定版本源码；未保存第三方整页正文。
- `baseline.json`：推送后编辑前的相关文章、导航和 Lu Qi 摘要。
- `historical-evidence.json`：引用的既有项目来源、实验与文章摘要。本轮只引用其原结果，不声称重跑过。
- `browser-results.json` 和 `validation.json`：本站构建、引用、图表与原文保留检查。

OpenAI Agents SDK 按 OpenAI Docs 的官方来源要求核对 developers.openai.com，未读取或执行 SDK 仓库；候选 Python / TypeScript 接口与目标安装版本仍需单独锁定。LangGraph / Temporal / OpenHands 的固定版本机制以已有研究记录为准，当前文档补充不能升级旧实验的版本口径。

## 明确未运行

没有新执行真实模型、SDK、Docker、E2B、Temporal 服务、LangGraph 引擎或多租户系统。文章中的八类故障是 PoC 计划；四类组合是基于约束的设计推论。3 × 3 × 3 = 27 为“各层最多三次尝试”条件下的算术反例，不是候选默认值或实测。没有价格、性能、稳定性或模型成功率排名，也未验证账户区域、隔离强度或生产 SLA。

历史 A/B/C 的 72 次固定响应契约检查、后续 16 次配对反例与数据篇的 16 项检查分别保留原始定义；不能相加成真实 Agent 成功率。OpenHands 与 Codex 保持静态源码研究边界。没有用新教学模拟替代实际候选的缺失证据。
