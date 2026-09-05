---
title: OpenCode 系统研究（三）：Agents、Skills 与 Plugins 如何分工
description: 拆解 AGENTS.md、主从 Agents、按需 Skills、权限和生命周期 Plugins，理解 OpenCode 的扩展信任模型。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - OpenCode
  - Agent Skills
  - Agent Harness
featured: false
readingTime: 7 min
---

> 系列：[1. 全景](/writing/opencode-system-overview/)｜[2. 运行与状态](/writing/opencode-client-server-runtime/)｜[3. Agents 与扩展](/writing/opencode-agents-skills-plugins/)｜[4. 整体判断](/writing/opencode-system-synthesis/)

OpenCode 把扩展拆成不同粒度。AGENTS.md 提供项目长期说明；Agent 定义角色、模型、工具和权限；Skill 用描述参与发现，正文按需加载；Plugin 则运行 JavaScript 或 TypeScript 代码，接入生命周期事件。[Skills 文档](https://opencode.ai/docs/skills)与[Agents 文档](https://opencode.ai/docs/agents)分别说明了知识加载和执行角色。

| 扩展 | 改变什么 | 信任等级 |
| --- | --- | --- |
| AGENTS.md | 常驻项目上下文 | 提示级 |
| Skill | 某类任务的方法 | 提示级、按需加载 |
| Agent | 模型、工具、权限与角色 | 配置级 |
| Plugin | 生命周期与运行代码 | 进程代码级 |

开放带来的最大误区，是把这四者都称为“插件”。Skill 即使写得很强硬，最终仍由模型解释；Plugin 可以直接产生副作用，必须像依赖代码一样审查。权限应在工具和 Agent 边界执行，而不是只靠 Skill 文本约束。

OpenCode 也兼容多种 Skills 目录，这有利于迁移，却可能产生重复名称、覆盖顺序和版本漂移。生产使用需要维护来源、安装版本和冲突诊断，而不能只保证文件被发现。

---

上一篇：[运行与状态](/writing/opencode-client-server-runtime/)。

下一篇：[整体判断](/writing/opencode-system-synthesis/)。

终篇回到开放性本身：什么值得替换，什么必须成为稳定契约。
