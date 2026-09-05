---
title: Addy Osmani Agent Skills 研究（四）：Skill 应编码决策点而非口号
description: 综合生命周期、路由、验证和分发，提炼生产级 Skill 的结构原则与运行时边界。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - AI 工程
  - Agent Harness
featured: false
readingTime: 1 min
---

> 系列：[1. 全景](/writing/addy-agent-skills-overview/)｜[2. 生命周期](/writing/addy-agent-skills-lifecycle/)｜[3. 验证与分发](/writing/addy-agent-skills-verification/)｜[4. 整体判断](/writing/addy-agent-skills-synthesis/)

这套仓库证明，Skill 的价值不在于收集更多最佳实践，而在于把“什么时候做什么、产出什么、凭什么继续”写成决策点。命令提供稳定入口，元 Skill 完成阶段路由，专业 Skill 处理局部方法，验证证据推动流程回退或前进。

它也暴露了边界：提示资产不能替代沙箱、权限、CI 和发布系统；跨 Harness 复制不能保证 Hook、资源与调用语义一致。生产级 Skill 必须与可执行证据组合，并拥有版本、兼容和退出路径。

因此，最值得继承的不是整包照搬，而是“过程而非散文、证据而非自信、渐进加载而非常驻全文”三条原则。

---

上一篇：[验证与分发](/writing/addy-agent-skills-verification/)。

本系列到此完成。回到[研发生命周期全景](/writing/addy-agent-skills-overview/)，可以按阶段重新组织自己的 Skills。关于大规模发现问题，可继续阅读 [能力路由发现](/writing/capability-routing-discovery/)。
