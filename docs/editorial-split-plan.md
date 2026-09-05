# 第一优先级六篇长文：即时修正与 Review 清单

执行日期：2026-09-05，Asia/Shanghai。

## 执行方式已修正

用户要求从当前立即开始。本轮已取消“9 月 6—11 日每天处理一个主题”的安排，相关每日自动化（id: automation）已暂停，改为同一任务中连续完成六批改稿。不会自动进入第二优先级，也不会自动提交、推送或部署。

六篇母文已改为六个总—分—总系列，共 31 篇：保留六个原 slug 作为首篇，新增 25 篇。首篇提供地图，分篇提供模块与实践，终篇讨论前文证据共同支持的系统判断。各篇都有全系列导航、前后链接与实质性引子。

本轮只修改指定六篇及其新分篇、本清单与 docs/editorial-labs/。原有 .gitignore、llm-agent-capability-landscape-2026.md 修改和 graphify-out/、templates/、writing/ 未跟踪目录保持原状。

## Review 顺序

建议先读每个系列的首篇和终篇，确认整体论证；再按目录检查中间篇的实践是否支撑最后的判断。

| 顺序 | 主题 | 篇数 | 状态 | 终篇核心问题 |
|---|---|---:|---|---|
| 1 | Agent 评测 | 5 | 质量校准通过 | 高分为何不能直接兑换更大的行动权？ |
| 2 | DeepSeek Harness | 5 | 质量校准通过 | 自由如何改变复杂度的归属？ |
| 3 | 产品分析框架 | 6 | 质量校准通过 | 框架何时帮助判断，何时掩盖未知？ |
| 4 | Claude Code 产品设计 | 5 | 质量校准通过 | 自动化怎样重新分配证据、风险与责任？ |
| 5 | Agent 记忆设计 | 5 | 质量校准通过 | 长期价值为什么依赖能够改变认识？ |
| 6 | AI 产品价值 | 5 | 质量校准通过 | 局部能力进步为何未必降低交付成本？ |

### 1. Agent 评测

1. [Agent 评测（一）：先搭一张从任务到上线决策的地图](../src/content/writing/agent-system-evaluation-research.md)
2. [Agent 评测（二）：成功率、稳定性与成本，不能揉成一个分数](../src/content/writing/agent-evaluation-metrics.md)
3. [Agent 评测（三）：先把题目和裁判做对，再谈排行榜](../src/content/writing/agent-evaluation-datasets.md)
4. [Agent 评测（四）：把一次打分变成可重复的回归系统](../src/content/writing/agent-evaluation-engineering.md)
5. [Agent 评测（五）：高分为何不能直接兑换更大的行动权](../src/content/writing/agent-evaluation-synthesis.md)

### 2. DeepSeek Harness 架构

1. [DeepSeek Harness 架构（一）：先理解能力组合与事实记录这两条主线](../src/content/writing/deepseek-harness-architecture.md)
2. [DeepSeek Harness 架构（二）：插件怎样出现、协作，并真正退出](../src/content/writing/deepseek-harness-composition.md)
3. [DeepSeek Harness 架构（三）：历史不能丢，模型又不能看全部历史](../src/content/writing/deepseek-harness-state.md)
4. [DeepSeek Harness 架构（四）：工具、PTC 和多 Agent，怎样不放大副作用](../src/content/writing/deepseek-harness-execution.md)
5. [DeepSeek Harness 架构（五）：自由不会消灭复杂度，它会改变复杂度的归属](../src/content/writing/deepseek-harness-synthesis.md)

### 3. 产品分析框架

1. [产品分析框架（一）：先知道要做什么决定，再选择框架](../src/content/writing/product-analysis-frameworks.md)
2. [产品分析框架（二）：从市场很大，到我们为什么能做](../src/content/writing/product-frameworks-market.md)
3. [产品分析框架（三）：从用户旅程到一次有边界的发布](../src/content/writing/product-frameworks-prioritization.md)
4. [产品分析框架（四）：用户真的得到价值，生意才有机会成立](../src/content/writing/product-frameworks-growth.md)
5. [产品分析框架（五）：让一次发布留下结果，也留下可复用的认识](../src/content/writing/product-frameworks-delivery.md)
6. [产品分析框架（六）：框架的终点，不是确定性，而是更好的判断](../src/content/writing/product-frameworks-synthesis.md)

### 4. Claude Code 产品设计

1. [Claude Code 产品设计（一）：先看任务、执行与证据三个闭环](../src/content/writing/claude-code-product-design.md)
2. [Claude Code 产品设计（二）：从一句需求，到一条可以干预的任务旅程](../src/content/writing/claude-code-task-experience.md)
3. [Claude Code 产品设计（三）：少一点确认，不等于少一点边界](../src/content/writing/claude-code-trust.md)
4. [Claude Code 产品设计（四）：并行和跨端，首先是状态管理问题](../src/content/writing/claude-code-session-collaboration.md)
5. [Claude Code 产品设计（五）：Agent 产品真正设计的是责任，而不只是操作](../src/content/writing/claude-code-product-synthesis.md)

### 5. Agent 记忆设计

1. [Agent 记忆设计（一）：先把记忆放回完整生命周期](../src/content/writing/agent-memory-design-competitive-analysis.md)
2. [Agent 记忆设计（二）：保留历史，还是维护当前事实](../src/content/writing/agent-memory-writing.md)
3. [Agent 记忆设计（三）：找到相关记忆，只完成了一半](../src/content/writing/agent-memory-retrieval.md)
4. [Agent 记忆设计（四）：一条记忆开始跨团队流动之后](../src/content/writing/agent-memory-governance.md)
5. [Agent 记忆设计（五）：长期记忆的价值，在于能够改变认识](../src/content/writing/agent-memory-synthesis.md)

### 6. AI 产品价值

1. [AI 产品价值（一）：先看交付结果，再给算法能力找位置](../src/content/writing/ai-capability-product-metrics.md)
2. [AI 产品价值（二）：测试通过之后，还需要哪些交付证据](../src/content/writing/ai-value-coding.md)
3. [AI 产品价值（三）：听懂一句话，不等于改对一个闹钟](../src/content/writing/ai-value-voice.md)
4. [AI 产品价值（四）：文件能打开，为什么仍然不能交付](../src/content/writing/ai-value-office.md)
5. [AI 产品价值（五）：能力进步，为什么未必等于交付变便宜](../src/content/writing/ai-value-synthesis.md)

## 不只拆篇：本轮的内容修正

| 原文 | 保留与迁移 | 修正、撤下或新增 |
|---|---|---|
| 评测报告 | 结果、轨迹、工具、记忆、成本、安全与回归职责分别进入五篇 | 修正 pass@k 公式与重复成功口径；不把可见理由当内部思维；撤下不可核查榜单、无实验依据的百分比和平台绝对化判断；增加可运行契约实验与零事故样本的解释边界 |
| DeepSeek | Cordis、Profile/Preset、Seam、Turn/Step、Session、Compaction、工具、PTC、多 Agent 与沙箱拆到对应分篇 | 首篇改为组合树与事件流的关系；锁定原源码快照；PTC 代码明确标伪代码；补充外部幂等、插件信任和有限配置的验证责任 |
| 产品框架 | 保留 MeetFlow、市场测算、RICE、ROI、旅程、漏斗和复盘案例 | 统一标注虚构数据；按决策阶段组织；增加反证条件、敏感性测试、责任人与关闭条件；终篇讨论重复证据与局部指标误导 |
| Claude Code | 保留任务、旅程、KANO、权限、验证、上下文、并行与跨端的产品分析 | 权限从线性升级阶梯改为决策关系；限定 Worktree 适用场景；区分 Cloud 与本地 Remote Control；隐私模式标明作者建议；不把使用研究统计当 UI 设计因果证据 |
| 记忆竞品 | 从按厂商介绍改为写入、演化、检索、装配、治理的跨产品比较 | 区分两个体系的 L0–L3 含义；撤下不可直接横比的成绩表；补充有效时间、服务端身份、撤权、缓存、删除传播和污染放大；增加本地反例测试 |
| 产品价值 | 完整保留编程、终端、办公的能力与指标映射，以及成功率、费用和人工成本口径 | 三场景各补验收表、异常样本与图例；终篇新增审核瓶颈、局部最优和交付承诺的讨论 |

以上撤下的旧内容仍可从 Git 历史恢复。本轮未提交；不要把“本地改稿完成”误认为 GitHub 或站点已发布。

## 资料与版本

- DeepSeek 继续以 `76fda729799fe9b3848dbe2c211d4b231032b81e` 为基线，相关链接改为固定快照；保留 developer preview 与安全边界声明。
- OpenViking 本次核查分支指向 `0c5147cae26aec8d6d93445ec6ad86d5faff4035`；TencentDB feat/server_team 指向 `2ee22397f6091b8cd3ea847bc1edb04d3bec0c94`，相关文章链接已固定。Mem0 v3 行为依据迁移文档，不能外推为云服务与开源库完全一致。
- 关键概念核对了 HumanEval、τ-bench、Anthropic 评测文章、Claude Code 权限与 Desktop/Remote Control 文档、Mem0 迁移与 OpenViking 分层/会话说明、腾讯团队分支文档。
- 产品框架补充 Intercom RICE、HBS 五力、Strategyzer 画布与 NN/g 用户旅程等来源。案例与延伸判断保留作者身份。
- 未在本机部署三家记忆服务或 DeepSeek Harness，也没有重新跑真实模型的性能基准。阅读时长和设计收益均不冒充实测。

## 验收记录

- [x] 六篇母文重组为 31 篇；保留原 slug。
- [x] 首篇高层总图、分篇实践、终篇系统思考；导航与引子完整。
- [x] 统一检查站内文章链接、代码围栏、图注和元数据。
- [x] 配套 25 项 Python 测试通过；固定月报正常样本通过，五个错误样本拒绝；记忆时间、跨身份、撤权、预算与冲突样本符合预期。
- [x] Astro 生产构建通过，生成 55 个页面；保留既有大于 500 kB 的打包警告，不为本轮改稿扩展重构。
- [x] 生产预览上的 31 篇图表与公式检查、六个入口移动端检查完成；28 张 Mermaid 图正常渲染，无公式错误或页面横向溢出。
- [x] 图表截图抽查完成，覆盖流程图、时序图与状态图。

浏览器验收使用本次构建的生产预览。既有开发服务出现过依赖缓存失效（504 Outdated Optimize Dep），未将该缓存问题误记为文章缺陷；原开发服务保持不变，本轮临时生产预览已停止。

阅读时长采用估计而非真人计时：计入正文汉字、英文词、代码和图表理解成本；当前标签为 5—10 分钟，动手实验另计。最长的 DeepSeek 执行篇靠近上限，Review 时可优先确认其认知负担。

## 配套实验与复核

见 [实验说明](editorial-labs/README.md)、[系列清单](editorial-labs/series.json)及 [检查脚本](editorial-labs/check-series.mjs)。

```sh
python3 -m unittest discover -s docs/editorial-labs -p 'test_*.py' -v
python3 docs/editorial-labs/evaluation_lab.py
python3 docs/editorial-labs/memory_lab.py
node docs/editorial-labs/check-series.mjs
npm run build
```

实验只验证契约，不调用模型、不联网、不操作真实业务数据；模拟证据、字符预算与删除状态的限制见实验说明。

## 质量校准结论

2026-09-05 的复核将第一优先级与第二优先级放入同一套内容契约：首篇建立地图，终篇闭合论证并回链入口；中间篇提供机制、案例或实践；主阅读路径不超过 10 分钟；标题、摘要、导航、图注、跨系列链接和知识目录顺序由构建检查持续约束。

第一优先级 6 个系列、31 篇已通过结构与渲染检查。本轮没有为了制造改动重写已经成立的论述，只校准了阅读时间与系列入口表达。发布仍等待用户明确要求；本地验证通过不等于已经推送。
