---
title: Pi Coding Agent 源码研究（五）：极简的价值是暴露责任
description: 综合最小内核、Session、扩展和持久任务，判断 Pi 删除了哪些意见，又把哪些生产责任交给部署者。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Pi
  - Coding Agent
  - Agent Harness
featured: false
readingTime: 5 min
---

> 系列：[1. 全景](/writing/pi-series-overview/)｜[2. 最小内核](/writing/pi-architecture-deep-dive/)｜[3. Session 与扩展](/writing/pi-session-extension-architecture/)｜[4. Durable Harness](/writing/pi-durable-harness-governance/)｜[5. 整体判断](/writing/pi-series-synthesis/)

Pi 没有消灭复杂度。它删除的是默认工作流意见，并保留模型消息、工具事件、历史事实和扩展时点这些难以绕开的机制。这样做的收益是内核容易观察和替换，代价是团队必须自行补齐权限、沙箱、审批、远端运行和扩展供应链。

最值得复用的不是“四个工具”，而是三条边界：Provider 差异在协议层收敛；Session 事实与模型上下文投影分离；Extension 明确被视为进程内受信代码。Durable Harness 又进一步说明，持久任务一旦跨进程，就必须把所有权、租约、恢复和事件顺序写成协议。

因此，Pi 更适合作为机制研究和定制底座，而不是默认完备的团队产品。极简真正的成熟不是配置少，而是没有用隐藏默认值掩盖责任。

---

上一篇：[Durable Harness](/writing/pi-durable-harness-governance/)。

本系列到此完成。回到[Pi 全景](/writing/pi-series-overview/)，可以用“机制是否稳定、策略是否外置、责任是否显式”重新检查每一层。更通用的执行与恢复问题可继续阅读 [Agent Harness 工程](/writing/harness-engineering-map/)。
