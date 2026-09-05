---
title: Anthropic Agent Skills 研究（三）：复杂文档 Skill 如何组织产物链
description: 从 PDF、DOCX、PPTX 与 XLSX 参考实现，研究说明、脚本、模板、渲染检查和许可证如何共同构成复杂 Skill。
publishedAt: 2026-09-05
updatedAt: 2026-09-05
type: essay
status: growing
topics:
  - Agent Skills
  - Anthropic
  - AI 工程
featured: false
readingTime: 7 min
---

> 系列：[1. 全景](/writing/anthropic-skills-overview/)｜[2. 渐进加载](/writing/anthropic-skills-progressive-disclosure/)｜[3. 复杂产物](/writing/anthropic-skills-document-pipelines/)｜[4. 整体判断](/writing/anthropic-skills-synthesis/)

复杂 Skill 不能只告诉模型“生成一个文档”。它需要识别输入、选择工具、调用脚本、复用模板、生成文件、渲染预览并检查产物。SKILL.md 在这里更像工作流控制面，真正的确定性工作由脚本和格式库承担。

| 层 | 责任 |
| --- | --- |
| Instructions | 选择路径、说明约束 |
| References | 保存格式知识和检查清单 |
| Scripts | 执行可重复转换 |
| Assets | 模板、字体和示例资源 |
| Verification | 渲染、解析和视觉复核 |

这说明高质量 Skill 的输出不是一段回答，而是经过验证的 Artifact。模型负责在不确定输入中做判断，脚本负责可重复操作，渲染检查负责把文件存在与文件可用区分开。

许可证同样属于能力边界。仓库公开可读不代表所有目录都可以任意再分发；Skill Marketplace 和团队安装器需要把来源、许可和第三方依赖纳入清单。

---

上一篇：[渐进加载](/writing/anthropic-skills-progressive-disclosure/)。

下一篇：[整体判断](/writing/anthropic-skills-synthesis/)。

终篇从复杂示例返回标准，判断真正可移植的最小能力单元包含什么。
