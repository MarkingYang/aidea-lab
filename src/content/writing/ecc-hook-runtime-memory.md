---
title: ECC：规则如何在事件边界真正发生
description: 沿 Hook 运行时、Memory Vault 与持续学习，理解 ECC 如何分离确定性约束、历史事实和经验候选。
publishedAt: 2026-09-05
updatedAt: 2026-09-06
type: essay
status: evergreen
topics:
  - ECC
  - Agent Harness
  - Agent Memory
  - Agent Skills
  - AI 工程
featured: false
readingTime: 8 min
---

## 定位与价值

本篇追踪工具事件如何触发 Hook，以及会话观察如何成为候选经验。事件记录、动作阻断和批准新规则是不同步骤。

完整定位与安装见[项目总览](/writing/ecc-architecture-deep-dive/)。

研究基线：[affaan-m/ECC @ 22e8cf0](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/README.md)；源码与社区核对日期为 2026-09-06。

## 技术架构

```mermaid
flowchart TB
 U[入口：宿主工具事件] --> B[适配：Hook Bootstrap]
 B --> H[核心：开关解析与 Hook 脚本]
 H -->|同步阻断结果或反馈| U
 H --> D[基础设施：观察日志 / Memory Vault]
 D --> C[候选 Instinct 或 Skill]
 C --> R[审核、验证与晋升]
 R -->|新版本资产| D
```

*图 1｜职责与数据流；逻辑分层不要求分开部署。*

## 核心机制

### Hook 的事件与阻断语义

Skills 与 Rules 会影响模型决策，但它们无法证明模型一定运行了测试、一定没有执行危险命令，也无法保证会话结束时一定保存状态。

在指定提交 `22e8cf0` 中，Hooks 为配置匹配的事件提供程序检查；是否阻断仍取决于宿主支持、启用状态、超时和错误处理策略。

```mermaid
sequenceDiagram
  participant U as 用户
  participant H as Harness
  participant P as PreToolUse Hooks
  participant T as Tool
  participant O as PostToolUse Hooks
  participant L as Learning / State

U->>H: 提交目标
  H->>P: tool_name + tool_input
  P->>P: Profile / Disable List / GateGuard
  alt 高风险或不合规
    P-->>H: exit 2，阻断
  else 允许执行
    P-->>H: 继续
    H->>T: 执行工具
    T-->>H: 结果
    H->>O: tool_input + tool_output
    O->>O: format / typecheck / quality / metrics
    O-->>L: 观察、摘要、成本、会话状态
  end
```

*图 2｜ECC Hook 在确定性事件边界执行阻断检查、同步改写与异步反馈。*

ECC 在 `PreToolUse` 处理开发服务器、Git Push、提交质量、文档路径与危险 Shell 操作；在 `PostToolUse` 处理格式化、类型检查、构建分析和质量反馈；在 `SessionStart`、`PreCompact`、`Stop` 与 `SessionEnd` 处理上下文恢复、压缩前保存、模式提取和会话收尾。完整事件表见[Hooks 文档](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/hooks/README.md)。

这里有三个值得借鉴的设计细节。

#### 1. Hook 有统一的能力开关，而不是散落的环境判断

`hook-flags.js` 把控制收敛成三层：总开关、`minimal / standard / strict` Profile、单 Hook 禁用列表；环境变量优先于插件配置，插件配置再优先于受管安装配置。[源码](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/scripts/lib/hook-flags.js)让同一套 Hook 可以按组织风险偏好渐进启用，而不是只有“全开或全关”。

#### 2. Bootstrap 负责平台差异和输出卫生

Hook 本质上是 Harness 启动的子进程。Windows Shell、插件根路径、超时、标准输入输出和退出码都会影响可靠性。`plugin-hook-bootstrap.js` 统一解析插件根目录、校验路径不能逃逸、选择 Node 或 Shell 运行时，并处理 Windows PowerShell 与 Bash 的差异。

更细的一处优化很能说明 Harness 工程的特殊性：部分 Hook 会把原始输入原样输出，导致工具结果再次进入 Transcript。Bootstrap 会识别这种 byte-exact passthrough 并输出空内容，避免会话记录被几十到几百 KB 的重复 JSON 填满。[Bootstrap 实现](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/scripts/hooks/plugin-hook-bootstrap.js)把“上下文成本”当作运行时正确性的一部分，而不只是 Token 优化。

#### 3. 可阻断检查与异步反馈被明确区分

PreToolUse 可以用退出码 2 阻断工具；PostToolUse 只能观察和反馈；异步 Hook 不应承担强制门禁。这个边界避免把一个耗时的构建分析误放到每次工具调用之前，也避免团队以为某条事后警告已经提供了安全保证。

例如工具已修改文件，随后 PostToolUse 类型检查失败，文件不会因此自动回滚。Harness 必须记录失败并安排修复；事后检查既不能撤销既成副作用，也不能补发执行授权。

Hook 同时约束了 ECC 的跨 Harness 能力。Claude Code 拥有完整的原生事件能力，Codex 插件只打包满足其协议和信任模型的同步 Hook 子集，OpenCode 与 Cursor 则通过各自的事件适配层复用部分逻辑，其他平台还可能只能依靠说明性规则。**资产可移植不等于执行语义等价。** ECC 自己也在支持矩阵中承认这种差异；选型时应该验证关键门禁在目标 Harness 上究竟是 Hook-backed 还是 instruction-backed。


### 记录怎样成为候选经验

很多 Agent 系统会把完整 Transcript 塞回向量数据库，再把相似内容自动注入后续会话。这样做很方便，也混合了三个完全不同的问题：

- 当前任务如何在压缩或中断后继续；
- 跨 Harness 如何传递事实、决策与交接；
- 重复出现的做法何时应该升级为稳定流程。

ECC 分别使用会话状态、Memory Vault 与 Instinct / Skill Evolution 处理这三层。

#### Memory Vault：Markdown 是原始记录，索引是投影

Memory Vault 使用 `ecc.memory.v1` Markdown 文档保存 project、team 和 user 三种作用域的事实、决策、交接、经验与笔记，并同时提供确定性 CLI 和可选的本地 MCP 接口。[设计文档](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/design/ecc-memory-vault.md)规定了几条很克制的边界：

- 所有新记忆都是 `unreviewed`；
- 写入只允许创建，不覆盖旧 ID；
- 废弃关系用新文档显式链接表达；
- 默认检索只返回 active 的 project 与 team 记忆；
- user scope 需要显式请求；
- 记忆是数据，不是可执行指令；
- 人工认可的知识要晋升到 Rule、ADR、Runbook 或正式文档，而不是修改记忆里的信任标签。

这套设计把“可记忆”与“可信任”彻底拆开。即使某段上下文已经被团队提交进 Git，它仍然只是待核验的背景材料。一个同样拥有 Shell 权限的 Agent 不能充当自己的批准人。

MCP 也没有默认开启。每个 MCP 进程必须从服务端环境取得固定 Harness 身份，调用者不能在参数里伪装成另一个 Harness；user scope 还需要额外环境开关。这里的思路是：可写上下文面本身就是攻击面，不能为了“自动记忆”悄悄增加工具 Schema 与权限。

#### Continuous Learning：先观察，再形成 Instinct，最后才可能成为 Skill

持续学习 v2 的目标链是：Hook 捕获观察，后台 Observer 分析模式，Instinct 以置信度持久化，相关 Instinct 再聚类演化为 Skill 或 Command。它不是模型权重更新，也不是让 Agent 自动重写规则。

```text
Tool / Session Events
        ↓
结构化 Observation
        ↓ 多次证据与置信度
Instinct（候选经验）
        ↓ 聚类、评估、人工检查
Skill / Command（可复用工作流）
```

真正好的地方是中间保留了 Instinct 层。一次成功操作可能只是偶然；重复成功也可能只适用于某个项目；只有在证据、作用域和验证方式都清楚后，它才应该扩大影响范围。

这与 ECC 2.0 规划的“观察—提议—验证—晋升—回滚”循环一致：系统保存的不只是最后一份修改，还包括 Scenario、Trace、Candidate Playbook 与 Verifier Result。换句话说，**自我改进的产品不是会修改自己，而是能够证明为什么这次修改值得被保留。**

## 快速上手

先按[项目总览](/writing/ecc-architecture-deep-dive/#快速上手)准备运行环境；本篇的最小实验直接执行固定快照中的测试。另需按仓库贡献指南安装开发与测试依赖。

```bash
node tests/scripts/memory.test.js
```

检查记忆文件操作；此测试不评估模型形成经验的正确率。

模型、执行环境与存储等共用配置，以及安装常见问题，见[总览的三个配置项](/writing/ecc-architecture-deep-dive/#快速上手)。本轮在固定源码的独立副本中实际运行该命令：15 项通过、0 项失败。测试使用临时夹具，不代表真实模型或生产环境已通过验收。

## 生态与社区

许可证、官方集成、提交与 Issue 样本统一见[项目总览的生态与社区](/writing/ecc-architecture-deep-dive/#生态与社区)。

## 源码阅读路径

公共安装入口见项目总览。本篇沿相关模块追踪到具体实现与测试：

| 顺序 | 目录 → 文件 | 函数、对象或验证重点 |
| --- | --- | --- |
| 1 | [hooks/hooks.json](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/hooks/hooks.json) | 宿主事件到 Hook 的绑定 |
| 2 | [scripts/hooks/run-with-flags.js](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/scripts/hooks/run-with-flags.js) | main：运行开关和脚本分派 |
| 3 | [scripts/memory.js](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/scripts/memory.js) | 记忆 CLI 的参数与命令分派 |
| 4 | [tests/scripts/memory.test.js](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/tests/scripts/memory.test.js) | Memory CLI 边界测试 |
