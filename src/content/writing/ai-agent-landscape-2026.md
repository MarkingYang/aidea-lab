---
title: Agent 工作系统全景（一）：先把八款产品放回三条赛道
description: 先把工程 Agent、办公 Agent 与开源 Harness 放回三条赛道，建立整套系列的高层地图。
publishedAt: 2026-09-04
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - AI Agent
  - 竞品分析
  - Agent Harness
  - 产品战略
featured: true
readingTime: 7 min
---

> 系列：[1. 三条赛道](/writing/ai-agent-landscape-2026/)｜[2. 比较方法](/writing/agent-landscape-comparison-methods/)｜[3. 工程产品](/writing/coding-agent-harness-showdown/)｜[4. 开源路线](/writing/open-source-agent-harness-routes/)｜[5. 工程验证](/writing/coding-agent-harness-poc/)｜[6. 办公产品](/writing/china-work-agent-showdown/)｜[7. 组织落地](/writing/china-work-agent-adoption/)｜[8. 整体思考](/writing/agent-work-system-synthesis/)

把 Claude Code、Codex、Kimi、WorkBuddy、豆包、Hermes Agent、Pi 和 DeepSeek Harness 放进一张表里打分，看起来很完整，实际上很容易得出错误结论。

原因是：它们交付的不是同一种产品。

- Claude Code、Codex 首先在争夺“软件工程工作系统”；
- Kimi Work、WorkBuddy、豆包工作首先在争夺“知识工作入口”；
- Hermes、Pi、DeepSeek Harness 首先在争夺“谁来定义 Agent 的运行时”。

Kimi Code 又跨进了开发者战场，Claude Code 与 Codex 也正从代码仓库向研究、数据、文档和自动化外溢。真正发生的不是八款产品排成一列，而是三条战线逐渐互相吞并。

> [!IMPORTANT]
> **本文的核心判断：**截至 2026 年 9 月，Claude Code 与 Codex 是综合完成度最高的两套 Agent 工作系统。前者胜在可组合、可定制的工程 Harness，后者胜在本地—云端—多任务—审查—自动化的一体化操作系统。国内代表的优势不主要是“模型追平”，而是中文工作流、办公套件、组织连接和本地分发；开源代表的价值则是控制权、可研究性和新架构试验。

这篇只搭高层骨架：先判断产品在争夺什么，再列出贯穿后续七篇的比较问题。具体矩阵、工程产品、开源路线、办公落地和 PoC 分别留给后文。

## 先把八款产品放回正确的赛道

### 第一层：工程 Agent——把需求变成可验证的代码变更

Claude Code、Codex 和 Kimi Code 的核心工作对象是代码仓库。它们要完成的不是“写一段代码”，而是读取项目、修改多个文件、运行命令和测试、解释差异，并把结果交到人类可审查的位置。

[Claude Code 官方产品页](https://claude.com/product/claude-code)已经把入口扩展到终端、IDE、桌面、Web、GitHub、Slack 和移动端；[Codex App](https://openai.com/index/introducing-the-codex-app/)则明确把产品定义成并行管理多个 Agent 的 command center。两者都已超越单一 CLI。

[Kimi Code](https://www.kimi.com/resources/kimi-code-introduction)走的是模型与产品垂直整合路线：月之暗面既提供 Agentic 模型，也提供终端和 IDE Agent。它不再只是“国产模型接进第三方 CLI”，而是在补齐自己的执行层。

### 第二层：工作 Agent——把自然语言目标变成办公制品

Kimi Work、WorkBuddy 和豆包工作的用户通常不从 Git 仓库开始，而从本地文件、浏览器、企业知识库、聊天记录、表格、PPT 或一项模糊业务目标开始。

[Kimi Work](https://www.kimi.com/zh-hans/resources/kimi-work-introduction)强调本地桌面、开放网络、专业数据集与 Agent Swarm；[WorkBuddy](https://cloud.tencent.com/product/workbuddy)强调“办公、代码、设计”统一工作台、腾讯生态和 SkillHub；字节 Seed 团队则把豆包“办公任务”描述为面向真实生产力场景的通用 Agent，突出项目规划、文件处理、工具调用和多模态交付，参见[Seed2.1 发布说明](https://seed.bytedance.com/zh/blog/seed2-1-officially-released-advancing-ai-productivity)。

它们真正争夺的是：**用户愿不愿意把一项完整工作交出去，而不只是把一个问题问出去。**

### 第三层：开源 Harness——把 Agent 本身变成可改造的基础设施

Hermes、Pi 与 DeepSeek Harness 都开源，但哲学差异极大：

| 产品 | 核心主张 | 更像什么 | 默认取舍 |
| --- | --- | --- | --- |
| [Hermes Agent](https://github.com/NousResearch/hermes-agent) | “会记住、会沉淀技能的个人 Agent” | 电池齐全的自治助理 | 能力面广，部署与安全责任也更重 |
| [Pi](https://pi.dev/docs/latest) | “最小终端 Coding Harness” | 可编程的 Agent 内核 | 核心克制，把工作流和治理交给扩展 |
| [DeepSeek Harness](https://www.deepseek.com/harness/) | “Everything is a plugin” | Agent 运行时与插件实验场 | 组合自由度高，但仍是 developer preview |

它们不以“开箱即用的企业席位”取胜，而以源码可见、模型可换、运行时可改、部署可控取胜。

## 不要问谁功能最多，要问九个问题

一套 Agent 的实际价值，可以写成一个并不严谨但非常实用的乘法：

```text
有效产出 = 模型能力 × Harness 完成率 × 环境可达性 × 验证强度 × 可治理性
```

任何一项接近零，漂亮的模型基准都无法变成可靠交付。因此，本报告用九个问题取代“参数、上下文、功能数量”的罗列。

| 维度 | 真正要问的问题 | 常见误区 |
| --- | --- | --- |
| 任务地形 | 它最擅长代码、研究、办公还是跨应用操作？ | 把“能做”当成“稳定擅长” |
| Agent Loop | 遇到失败会不会继续观察、修正和验证？ | 只看第一次回答质量 |
| 上下文系统 | 项目规则、历史、文件和工具结果如何进入注意力？ | 把超长窗口等同于长期记忆 |
| 工具与环境 | 能触达哪些文件、命令、浏览器、SaaS 和设备？ | 用工具数量代替工具质量 |
| 结果验证 | 它如何证明工作真的完成？ | 接受“已完成”的文字声明 |
| 并行与长任务 | 如何隔离任务、协调依赖和恢复中断？ | 认为 Agent 越多必然越快 |
| 扩展性 | Skill、Hook、MCP、插件与 SDK 能改到哪一层？ | 把兼容协议当成完整生态 |
| 安全治理 | 权限、沙箱、凭证、审计、回滚如何组合？ | 只看是否弹确认框 |
| 所有权与成本 | 数据、模型、运行时、配额与迁移权归谁？ | 只比订阅月费 |

这九个维度也解释了为什么本文不提供一个“8.7 分胜过 8.5 分”的总榜。不同用户的权重完全不同：个人开发者看重速度和可塑性，研发负责人看重隔离、审查与吞吐，国内企业看重身份、数据边界和办公系统连接。

---

三条赛道解决了“它们是不是同一种产品”，但还没有解决“不同产品怎样公平比较”。下一篇建立不依赖统一总分的比较方法。

下一篇：[比较方法](/writing/agent-landscape-comparison-methods/)。
