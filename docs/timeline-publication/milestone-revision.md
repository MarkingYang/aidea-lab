# 时间线的里程碑与写作风格修订

2026-09-16，用户要求把里程碑事件与技术结合，并提供“回望过去……”的开篇示范：有历史、有标志性事件、有技术深度，也有思考与沉淀。

保留原有 38 个节点、全部 38 个原始来源、每节点五项解释与 ReAct 图。新增 Copilot、GPT-4、AutoGPT、Devin、Deep Research、Manus、Codex 与 ChatGPT agent 八个节点，共 46 个。横轴选择十二个里程碑，事件与技术并列，支持跳转正文。开篇、年度衔接和结尾加强历史叙述与工程反思。用户编辑中的开头已保存在临时备份 `/tmp/llm-timeline-user-draft-before-style.md`，根据随后明确提供的写作示范完成整理；正式文章与 docs 正文一致。

## 新增事实与证据范围

每个节点直接链接官方公告或原始论文。补充核对如下：

| 节点 | 时间与来源 | 边界 |
| --- | --- | --- |
| Copilot | [2021-06-29 技术预览](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) | 描述当时的代码建议，不回填今天的 Agent 能力 |
| GPT-4 | [2023-03-14 发布](https://openai.com/index/gpt-4-research/) | 图像输入当时仍为研究预览 |
| AutoGPT | [v0.2.0 README](https://github.com/Significant-Gravitas/AutoGPT/blob/v0.2.0/README.md) | 文档保留 2023-03-30 演示与实验局限；不把后来的平台功能写回初版 |
| Devin | [2024-03-12 官方演示](https://cognition.com/blog/introducing-devin) | 厂商演示和自报评测，不声称独立复现或普遍替代工程师 |
| Deep Research | [2025-02-02 发布](https://openai.com/index/introducing-deep-research/) | 使用初始发布内容，区别于页面上的后续更新 |
| Manus | [2025-03 用户活动](https://events.manus.im/events/manus-meetup-provo)、[2025-07-18 工程回顾](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) | 只精确到首次亮相月份；7 月架构经验明确属于后续披露，不声称还原 3 月全部实现 |
| Codex | [2025-05-16 云端研究预览](https://openai.com/index/introducing-codex/) | 区别于 2021 年同名模型及 CLI 发布时间；保留初始联网限制 |
| ChatGPT agent | [2025-07-17 发布](https://openai.com/index/introducing-chatgpt-agent/) | 描述发布时研究、操作和交付的结合，不声称无条件自主运行 |

已有节点同时补强 GPT-2 的暂缓完整发布、ChatGPT 的对话入口、Generative Agents 的 25 人小镇聚会场景、o1 的推理计算与 R1 的开放权重/蒸馏。R1 日期由[官方更新记录](https://api-docs.deepseek.com/updates/)中 2025-01-20 条目核对；机制保留原始技术报告。本文未执行模型、Agent 或厂商基准实验。

## 本地验证

- 46 个节点按月份有序，每个仍包含五项解释；38 个原始来源 URL 全部保留。
- 十二个横轴链接均有正文目标；docs 与正式正文一致。
- `npm run build`、文章与图谱检查通过。工作区包含未发布访谈草稿，因此本地共 76 篇；这不是新的线上发布数量。
- 用户随后明确要求“发布”，本次修订获准通过 origin/main 发布。既有 `README.md` 与 `browser-results.json` 仍记录上次发布结果。
- 正式构建页面在 1440 / 390 像素、深浅主题下验证通过：十二节点单横轴、滚动与键盘导航、正文跳转目标、Mermaid 渲染、无页面横向溢出。结果见 `milestone-browser-results.json`。

## 发布前核对

2026-09-16，发布前同步了用户在 docs 源稿中最新精简的开篇、范围说明与阅读导览。独立发布工作区只包含本篇与相关记录，75 篇文章、24 个分组、8 个方向、142 个图节点、601 条关系；未纳入本地访谈草稿。
