---
title: Anthropic Agent Skills 研究（二）：渐进披露如何控制上下文成本
description: 拆解名称、描述、SKILL.md 正文与资源目录的分层加载，理解 Skill 发现、触发和按需读取的协议价值。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - Context Engineering
  - Anthropic
featured: false
readingTime: 2 min
---

> 系列：[1. 全景](/writing/anthropic-skills-overview/)｜[2. 渐进加载](/writing/anthropic-skills-progressive-disclosure/)｜[3. 复杂产物](/writing/anthropic-skills-document-pipelines/)｜[4. 整体判断](/writing/anthropic-skills-synthesis/)

Agent Skills 的关键不是 Markdown 格式，而是渐进披露。宿主先读取名称和描述参与能力发现；匹配任务后才加载 SKILL.md 正文；脚本、参考和资产又在正文指引下按需读取。这样技能数量可以增长，而上下文成本不会与全文总量线性增长。

```mermaid
flowchart LR
    Q[任务] --> I[名称与描述索引]
    I --> C{匹配候选}
    C --> B[加载 SKILL.md]
    B --> R[按需读取资源]
    R --> X[执行与验证]
```

*图 1｜路由先使用低成本元数据，执行阶段才逐步展开高成本内容。*

描述因此是路由接口，不是营销文案。它需要同时写清“做什么”和“何时使用”，并与邻近 Skill 保持可区分。正文则应保存流程、边界和资源入口，避免把所有背景知识塞在第一层。

标准只定义可携带的能力单元，宿主仍决定发现目录、权限、脚本环境和递归规则。所谓可移植，首先是资产结构可理解，其次才是不同宿主行为完全一致。

---

上一篇：[全景](/writing/anthropic-skills-overview/)。

下一篇：[复杂产物](/writing/anthropic-skills-document-pipelines/)。

下一篇用文档 Skills 检查：当能力包含脚本、模板和渲染验证时，Markdown 如何成为真正的工作流入口。
