---
title: Harness 运行与演进（二）：规划怎样帮助完成任务，而不是增加步骤
description: 比较固定工作流、局部探索和动态拆分，用依赖、前置条件、证据和重规划预算，让计划成为可修正的执行对象。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Harness
  - AI 工程
  - Agent 评测
featured: false
readingTime: 5 min
---

> Harness 运行与演进系列：[1. 全景与上下文](/writing/harness-operations-context/)｜[2. 规划与验证](/writing/harness-operations-planning/)｜[3. 观测与诊断](/writing/harness-operations-observability/)｜[4. 多 Agent 协作](/writing/harness-operations-multi-agent/)｜[5. 模型网关](/writing/harness-operations-model-gateway/)｜[6. 生产调度](/writing/harness-operations-production/)｜[7. 发布与演化](/writing/harness-operations-release/)

Agent 列出了八步核验计划，看起来覆盖完整。但第二份资料已经说明目标项目更名，余下六步仍按旧名称查询。计划越完整，错误路径反而可能被执行得越彻底。

规划的价值来自对未知的处理：哪些依赖已经确定，哪些需要先获取证据，什么新信息足以让后续步骤失效。计划文字本身不是完成度。

## 先选择最小可用的控制方式

| 方式 | 适用条件 | 需要付出的代价 |
| --- | --- | --- |
| 固定工作流 | 步骤已知，变化主要在输入 | 维护分支与异常路径 |
| 固定主干加局部探索 | 大部分步骤稳定，少数资料需要查找 | 约束探索出口与预算 |
| 动态规划 | 子任务数量和依赖要运行时发现 | 检验拆分、循环和计划更新 |

例如“读取资料、准备工单、创建、验收”可以固定；“发现资料引用缺失后寻找原始来源”适合局部探索。不必为了使用 Agent，把原本确定的每一步都交给模型重新决定。

Anthropic 的工作流分类区分了预先定义的并行任务与运行时由协调者拆分的任务。动态拆分适合子任务无法预先列全的场景，但这不意味着所有工作都会因此受益。[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

## 把计划节点写成执行契约

一个可执行计划节点至少要表达输入、依赖、完成证据和失败出口。下面是教学结构，不是任何 SDK 的原生 Schema：

```json
{
  "step_id": "verify-release-date",
  "plan_version": 3,
  "depends_on": ["resolve-project-identity"],
  "input_refs": ["source-001@v2"],
  "expected_evidence": ["primary-source-url", "publication-date"],
  "on_missing": "request-more-evidence",
  "write_allowed": false
}
```

任务状态可以区分待执行、进行中、等待、已验证、已失效与已取消。模型说“核验完成”只能提交候选结果；是否进入“已验证”，由节点的验收契约决定。

计划生成后也要检查基本结构：依赖是否存在、是否有环、每一步能否取得所需输入、工具是否在允许范围内，以及拆分是否仍然服务原目标。一个无法执行的计划应在派发前被发现。

## 重规划应由事实触发

值得重规划的事件包括：发现项目身份错误、必需数据不存在、工具持续不可用、用户改变目标，或剩余预算无法支撑原路径。

一个查询暂时超时，通常先进入工具层的有界恢复。若每次超时都让模型重写全部计划，既浪费成本，也可能丢掉已经确认的证据。相反，身份变更会影响后续全部资料选择，应使相关节点失效，而不仅仅是补写一句提示。

更新计划时保留旧版本、触发证据和受影响节点。已发生的写入继续按[副作用恢复契约](/writing/harness-engineering-recovery/)处理，不能因为计划不再包含该步骤就当它没有发生。

## 计划、执行与验证可以分工，不必各建一个 Agent

固定规则就能判断资料编号是否一致时，用确定性验收即可。需要语言判断的地方，再引入经过校准的模型评委或人工审核。把规划器、执行器、评估器分成三个角色，是责任分工；是否用三个独立模型会话，是另一个工程选择。

评估器与执行器如果共用同一份错误摘要，角色数量不会带来独立证据。应让验收访问固定目标、原始来源或实际制品，同时限制其改变目标和修改被验收结果的权限。已有[评委与数据集篇](/writing/agent-evaluation-datasets/)进一步解释了这类独立性。

## 防止规划过程耗尽任务预算

预算至少要区分准备计划、探索证据、执行和验收。分配不必僵硬，但应有总上限，并为收尾预留资源。否则，系统可能在生成最佳计划时耗尽全部时间，连现有结果都无法交付。

重复检测也应关注业务状态：是否总在同一组查询间循环，计划是否只换措辞，新增步骤是否真的获得新证据。达到边界时，交付已确认信息、未解决问题和推荐接管点，比继续生成更长计划更有价值。

## 用同一组任务比较三种策略

从资料核验中抽取简单完整、资料缺失、名称变化和证据冲突四类任务。固定模型、工具、数据快照和总预算，比较固定流程、局部探索与动态规划。

记录独立验收结果、完成时延、重规划次数、失效工作量和人工修正成本。多试次检查稳定性，不把一次幸运探索当成策略优势。若动态规划只在资料缺失切片有收益，就只在该切片启用。

本篇交付物是[工作簿中的计划卡](/labs/harness-operations-workbook.md)：一个依赖图、三个重规划触发条件，以及每种触发对既有证据和写入的处理规则。


---

上一篇：[全景与上下文](/writing/harness-operations-context/)。

下一篇：[观测与诊断](/writing/harness-operations-observability/)。
