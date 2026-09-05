---
title: ECC 工程资产系统研究（五）：跨平台复用必须保留能力差异
description: 综合安装、运行、记忆与供应链，判断 ECC 的工程价值、平台化边界和长期治理成本。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - ECC
  - Agent Skills
  - Agent Harness
featured: false
readingTime: 1 min
---

> 系列：[1. 全景](/writing/ecc-series-overview/)｜[2. 安装编译](/writing/ecc-architecture-deep-dive/)｜[3. Hook 与记忆](/writing/ecc-hook-runtime-memory/)｜[4. 供应链治理](/writing/ecc-memory-supply-chain/)｜[5. 整体判断](/writing/ecc-series-synthesis/)

ECC 最有价值的判断，是把团队工程经验当作需要安装、诊断、升级和卸载的软件资产。Skill 不只是提示词，Hook 不只是自动脚本，Memory 也不应成为没有来源的事实池；它们共同形成影响未来行为的配置供应链。

跨 Harness 复用的真正难点不是目录名称，而是能力不对等。某个平台有完整生命周期 Hook，另一个只有按需 Skill；某个平台能在运行前阻断命令，另一个只能提示模型谨慎。Adapter 必须显式表达降级，而不能让“安装成功”冒充“语义一致”。

ECC 正在接近控制平面，因此也承担更大的回归半径。它后续的成熟度，应更多由安装状态、能力矩阵、验证夹具和安全退出衡量，而不是资产数量衡量。

---

上一篇：[供应链治理](/writing/ecc-memory-supply-chain/)。

本系列到此完成。回到[ECC 全景](/writing/ecc-series-overview/)，可以看到它连接的是工程意图与执行表面，而非替代底层 Harness。关于能力发现与安装治理，可继续阅读 [万级能力路由](/writing/capability-routing-at-scale/)。
