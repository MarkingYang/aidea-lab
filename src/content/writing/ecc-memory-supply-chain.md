---
title: ECC 工程资产系统研究（四）：如何治理配置供应链与控制平面
description: 拆解 ECC 的配置安全、2.0 控制平面、结构性局限与借鉴顺序，判断工程资产怎样长期演进。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: evergreen
topics:
  - ECC
  - Agent Skills
  - Agent Harness
  - AI 工程
featured: false
readingTime: 8 min
---

> 系列：[1. 全景](/writing/ecc-series-overview/)｜[2. 安装编译](/writing/ecc-architecture-deep-dive/)｜[3. Hook 与记忆](/writing/ecc-hook-runtime-memory/)｜[4. 供应链治理](/writing/ecc-memory-supply-chain/)｜[5. 整体判断](/writing/ecc-series-synthesis/)

当 Skill、Rule、Hook 和配置开始影响未来行动，它们就成为软件供应链的一部分。ECC 的最后一层问题不是“再增加多少资产”，而是资产怎样更新、验证、回滚并安全退出。

## 安全模型：把 Agent 自己的配置也当作供应链

AI 编程工具的攻击面不只在生成的业务代码。一个恶意 Skill、过宽的 MCP 权限、一段被篡改的 Hook 或一个允许任意 Shell 的配置，都可能在模型真正开始写代码之前突破边界。

ECC 的安全模型分成四层：

| 层级 | 机制 | 处理的风险 |
| --- | --- | --- |
| 安装边界 | trusted root、路径包含校验、no-follow 读写、所有权记录 | 路径逃逸、符号链接、误删用户文件 |
| 执行边界 | GateGuard、PreToolUse 阻断、Profile | 危险 Shell、绕过校验、误操作 |
| 配置审计 | AgentShield | Prompt、Hooks、MCP、权限、Secrets 与 Agent 文件风险 |
| 演进治理 | 未审查 Memory、Instinct 晋升、Evaluator Gate | 污染长期上下文、错误经验扩散 |

其中 AgentShield 是独立发布的扫描器，不应与 ECC 主仓库中的 Hook 混为一谈。ECC 负责提供入口和安全工作流，AgentShield 负责静态与运行时安全检查；更完整的 Hosted Fleet 与 Enterprise Policy 仍属于路线图。主仓库的[安全说明](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/SECURITY.md)和[AgentShield 路线图](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/architecture/agentshield-enterprise-research-roadmap.md)必须结合阅读，才能区分已经存在的本地扫描能力与尚未完成的企业平台。

ECC 的安全取向不是声称“所有攻击都能检测”，而是尽量缩小每一步的权力：安装器只写受信根目录，Memory 不自动成为指令，MCP 不默认开放，强制门禁放在 PreToolUse，扫描器提供独立证据，未来的策略变更还要经过评估与晋升。

## ECC 2.0：Rust 控制平面是真实 Alpha，不是现有系统的同义词

仓库里最容易被误读的是 `ecc2/`。

ECC 2.0 的[参考架构](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/ECC-2.0-REFERENCE-ARCHITECTURE.md)规划了五层：Operator Surface、Harness Adapter、Worktree / Session / Queue Runtime、Observability / Evaluation Loop，以及 Security / Commercial Platform。它希望从“安装在现有 Harness 里的资产层”继续向上，形成多会话、多 Worktree、可观察、可评估的 Agent 控制平面。

当前 Rust 实现已经具备：

- 基于 SQLite 的 Session Store；
- Session start / stop / resume 与后台 Daemon；
- Worktree 感知的会话脚手架；
- 输出流、风险评分、通知与基础多会话状态；
- 上下文图谱、观察、召回与压缩原语；
- 候选 Harness 配置的摘要寻址、基线比较、晋升与回滚审计。

尤其值得注意的是 Harness Evaluation：候选配置先以 SHA-256 地址保存，再用相同 Seed 与基线做配对比较；只有满足样本数、均值增益、胜率和健康检查时才晋升，SQLite 事务同时更新 active pointer 与审计证据，失败则恢复原指针。

但 [`ecc2/README.md`](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/ecc2/README.md)明确写着 Alpha。当前评估器只读取操作者提供的测量结果，不调用网络、模型或 Shell；证据引用和分数也是操作者声明，不是经过认证的事实。更丰富的多 Agent 编排、可视化 Diff Review、完整跨 Harness 恢复语义和发布安装链仍在建设中。

因此，谈 ECC 时必须同时保留三条时间线：

| 层 | 当前成熟度 | 正确理解 |
| --- | --- | --- |
| Skills / Agents / Commands / Rules | 大规模可用 | 内容与工作流资产库 |
| Manifest Installer / Hooks / Memory CLI | 已有真实实现与测试 | 当前工程内核 |
| ECC 2.0 Control Plane / Hosted Platform | Rust Alpha 与路线图并存 | 方向成立，但不能按 GA 能力采购 |

ECC 2.0 也暴露了新的技术债信号：`ecc2/src/main.rs` 与 `ecc2/src/session/store.rs` 已分别增长到万行和数千行规模。Alpha 阶段快速验证可以接受，但如果 Operator Surface、Session Runtime、Context Graph、Evaluation 和通知继续进入同一 CLI 与 Store，未来会很难建立稳定边界。下一阶段需要围绕 Command Handler、Repository、Event Contract 与 Projection 拆分，而不是只按文件类型继续堆功能。

## ECC 的真正优势与结构性局限

### 五个真正的优势

**第一，工作方式与模型供应商解耦。** 模型可以升级，Harness 可以替换，团队积累的测试、审查、安全和发布方法仍以 Skill、Rule 与 Hook 的形式保留。

**第二，把软指导与硬门禁分开。** 模型负责判断，Hook 负责事件，安装器负责边界，Evaluator 负责证据；这比在一段超级 Prompt 里同时表达愿望和安全规则可靠得多。

**第三，安装拥有所有权与恢复语义。** ECC 知道自己写了什么、内容摘要是什么、用户是否修改过，因此 doctor、repair 和 uninstall 才有可能做到保守而可解释。

**第四，长期记忆有明确的信任降级。** 历史输出不会因为被保存就自动成为规则，跨 Harness 共享也不需要绑定某个厂商的 Transcript 格式。

**第五，路线图开始围绕证据，而不是围绕更多 Agent。** Scenario、Trace、Verifier、Promotion 与 Rollback 比“再加一个 Reviewer Agent”更接近可运营的自改进系统。

### 四个不可回避的局限

**第一，跨 Harness 只能共享意图，无法保证能力对等。** 原生 Hook、权限、Agent 隔离、MCP 和插件生命周期不同，薄适配器不可能凭空补齐底层能力。

**第二，资产规模正在制造治理成本。** 286 个 Skill 会带来描述冲突、重复能力、过期引用和选择噪声。目录数量本身不是护城河，检索命中率、任务完成率和回归评估才是。

**第三，单仓库同时承担了内容、运行时、安装器、实验控制平面与商业路线图。** 这便于统一迭代，也让发布边界与成熟度表达变得困难。用户必须读到具体模块，而不能把“ECC 支持”理解为所有平台拥有完整同等能力。

**第四，核心实现出现集中化趋势。** 安装生命周期、ECC2 CLI 和 Session Store 已成为大文件；如果不及早提炼协议与状态机，新增 Harness 和控制平面功能会快速放大回归范围。

## 如果要借鉴 ECC，应该复制什么，不应该复制什么

对正在建设内部 Agent Harness 的团队，最值得复制的不是 ECC 的目录数量，而是下面这组设计顺序：

1. **先定义资产类型。** 把常驻规则、按需工作流、执行门禁、未审查记忆与正式知识分开。
2. **再定义安装中间表示。** 不让每个平台安装器直接操作文件，而是先生成可预览、可验证的 Plan。
3. **把平台差异留在 Adapter。** 共享资产表达意图，Adapter 只负责路径、事件和能力映射。
4. **为每次写入保存所有权。** 没有 Install State，就没有安全的 Repair 与 Uninstall。
5. **只在确定性事件上做硬保证。** 安全、格式化、验证和审计不要只写进 Prompt。
6. **把记忆默认视为不可信输入。** 先检索和核验，再由人把稳定经验晋升为制度。
7. **让自我改进保留完整证据链。** 保存 Scenario、Trace、Candidate、Verifier 与 Rollback，而不是只保留“改好后的 Prompt”。

不应该复制的，是在没有评估体系时追求资产规模、为每种工具维护整套重复内容，或者在控制平面边界尚未稳定时把所有功能都压进一个 CLI 和数据库模块。

## 结语：ECC 正在把工程文化变成可执行基础设施

传统工程文化主要存在于人的经验、团队文档、代码审查和 CI 里。Agent 加入开发流程后，这些知识还需要被重新表达成模型能够发现的 Skill、Harness 能够执行的 Hook、安装器能够安全投射的配置、系统能够检索但不会盲信的 Memory，以及能够证明改进有效的 Evaluation Evidence。

ECC 的重要性正在于此：它尝试把“一个优秀工程师通常怎么做”从零散提示词，转成一套有加载策略、有执行边界、有状态记录、有跨平台后端、还能持续演进的基础设施。

它还没有完成自己的 2.0 愿景，跨 Harness 也远未实现完全等价。但它已经证明了一个值得长期关注的方向：**Agent 的能力上限不只由模型决定，也由组织能否把工程经验编码成可移植、可执行、可验证、可回滚的系统决定。**

当 Skills 是知识页、Hooks 是中断与系统调用、Manifest 是中间表示、Adapter 是后端、Memory 是低信任数据层、ECC2 是控制平面时，“Everything Claude Code”这个名字反而显得太窄了。ECC 真正想构建的，是一套跨模型、跨工具的 Agent Engineering Operating System。

## 参考源码

- [ECC Repository and README](https://github.com/affaan-m/ECC/tree/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e)
- [Cross-Harness Architecture](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/architecture/cross-harness.md)
- [ECC 2.0 Reference Architecture](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/ECC-2.0-REFERENCE-ARCHITECTURE.md)
- [Selective Install Architecture](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/SELECTIVE-INSTALL-ARCHITECTURE.md)
- [ECC Memory Vault](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/docs/design/ecc-memory-vault.md)
- [Hooks Runtime](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/hooks/README.md)
- [ECC 2.0 Alpha](https://github.com/affaan-m/ECC/blob/22e8cf01d0b54719b3a49002fab2ccbda4ff5b9e/ecc2/README.md)

---

上一篇：[ECC 运行](/writing/ecc-hook-runtime-memory/)。

安装、运行与供应链已经形成一条完整证据链。终篇回到 ECC 自身，判断它何时是工程资产层，何时开始承担平台责任。

下一篇：[ECC 整体判断](/writing/ecc-series-synthesis/)。
