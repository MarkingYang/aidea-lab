# 学习指南图示与本地阅读预览

正文源文件：[AI 产品与 Agent 系统学习指南](../ai-product-interview-study-guide.md)。图示与正文配套，所有金额、样本数和案例沿用正文的教学假设；未运行真实模型、Agent、训练或业务服务。竞品图仅归纳正文所引公开资料，不构成性能排名或对厂商内部动机的判断。

## 当前版本：普通 Markdown 与统一章节结构（2026-10-07）

根据读者反馈，已移除正文全部 143 个 HTML 折叠区块和自定义 HTML 锚点。所有问题与答案直接显示；目录使用普通标题链接。每章统一为“本章导读 → 知识讲解与技术选型 → 完整案例 → 本章复习”。88 组逐点问答从正文移至各章复习区，14 个完整案例使用独立标题；长案例索引移至附录 F。内容中的机制说明与推演步骤改为真正的下级标题，便于目录识别和阅读。

65 个外部来源、16 张图、10 个代码块、88 份逐点答案及 26 份面试参考回答保留。`plain-markdown-review.json` 和 `structure-validation.json` 记录当前正文哈希及保留检查；`anchor-map.json` 记录旧自定义锚点到原生标题链接的迁移。历史记录描述各自版本，不代表当前正文仍使用折叠答案。

阅读预览重新生成，案例区与复习区通过样式区分，均完整显示。`validation.json` 检查 1440、1280、390 像素页面、标题链接、图片、问答数量、重复 ID 与横向溢出；`preview-lesson-*.png`、`preview-point-answer-*.png`、`preview-workshop-*.png` 展示当前版正文、章末复习与案例。此次只修改学习指南及本地阅读资源，未发布。

## 图示资源

本次加入 16 张图：业务全景、KV Cache、RAG、工具调用、分层记忆、评测流程、裁判混淆矩阵、数据闭环、安全边界、Harness、幂等恢复、模型调优、完整成本、竞品对照、具身反馈、技术选型。

- `figures.json`：图示内容、标题、说明和插入位置。
- `sources/*.mmd`：12 张机制图的 Mermaid 源文件，由上述 JSON 导出。
- `figures/*.svg`：16 张可编辑矢量图。
- `figures/*.png`：16 张 2 倍分辨率图片，Markdown 直接引用。
- `render.mjs`：Mermaid 图、SVG 信息图及 ECharts 成本图的生成程序。修改图示时先更新 JSON 或生成程序，再重建。
- `preview.mjs`：从 Markdown 生成本地 HTML 阅读预览，并检查桌面/手机宽度、图片加载与页面横向溢出。
- `reading-preview.html`：可离线打开的阅读版，点击图片查看原尺寸。
- `contact-sheet.png`：全部图示的校阅总览。
- `validation.json`、`manifest.json`：渲染检查与图像尺寸记录。

## 重新生成

在仓库根目录执行：

```sh
node docs/ai-product-interview-study-guide-assets/render.mjs
node docs/ai-product-interview-study-guide-assets/preview.mjs
```

图示程序使用项目已有 Mermaid 和 ECharts，阅读预览使用项目已有 Marked 与 GitHub Slugger，以及 Codex 本地运行时的 Playwright、Sharp 和已安装 Chrome。其他机器可以通过 `GUIDE_NODE_MODULES` 指定提供 Playwright、Sharp 的依赖目录；不会自动安装软件。

分享 Markdown 时请同时复制此资产文件夹，保持两者相对路径不变。正文按 6 个单元、14 章组织，包含案例、选型讨论、65 个外部来源链接、16 张图及 26 道综合题与完整参考回答。每章提供核心结论、承接关系和学习路径；评测与数据闭环突出步骤，参考解答集中于章末并直接显示，图片源文件集中在附录 D。结构检查记录在 `structure-validation.json`。本次只在本地更新学习文档与预览。

## 历史修订记录

以下保留各轮编辑说明；当前结构以文首“当前版本”及 `plain-markdown-review.json` 为准。

### 逐点详解修订

14 章中的 88 个原有小节均补充了机制、例子、边界、取舍或验证步骤，并加入逐节跳转与 28 组易混概念索引。`depth-review.json` 记录逐节编辑覆盖；它不表示已经验证读者掌握或实测模型效果。新增工具 schema 仅检查 JSON 语法，教学数字仅做算术核对。新增引用与复核范围见 `depth-sources.md`。

### 逐点讲解与自测修订

在上述正文基础上，增加 16 个零基础前置概念、88 个与小节一一对应的追问及折叠解答、11 段因果与算例推演。正文讲机制，逐点追问检查边界，附录 A 的 26 道综合题练习跨知识点表达；三个层次按学习阶段使用。原有 16 张图、62 个外部来源链接和代码示例保留。

`teaching-review.json` 记录本轮覆盖与文件哈希；`teaching-arithmetic.json` 记录 19 项新增教学算术检查。`structure-validation.json` 记录每小节恰好对应一组追问与解答、链接和 JSON 语法检查。`preview.mjs` 还检查桌面和手机上的解答展开，相关截图为 `preview-point-answer-*.png`。这些检查不构成读者掌握度、模型效果或真实业务可靠性验证。此前 `depth-review.json` 保留上一轮编辑记录。

### 机制、案例与完整讲述修订

新增八步贯穿案例和 14 章的承接说明，深化 22 处机制，合并生成原理等六处重复解释。26 道综合题现在均有折叠参考回答及正文回链，题号可点击跳转。88 组逐点追问继续用于检查单一知识点，综合回答示范如何连接机制、业务、取舍与验收。

`explanation-review.json` 记录本轮章节、来源和哈希；`explanation-arithmetic.json` 保存 13 项新增算术检查。`preview-interview-*.png` 展示桌面与手机上的综合回答展开。历史编辑记录保留各自版本的哈希，该轮版本以该轮记录为准。没有执行真实模型、训练、Agent、业务或机器人任务。

### 逐章完整推演修订（2026-10-07）

新增 14 个章末完整推演及集中导航。推演依次覆盖模型采购、RAG 漏检、Agent 状态、记忆冲突、八任务评测账本、坏例分流、权限矩阵、崩溃恢复、训练立项、完整成本、竞品验证、具身分层验收、已填写决策卡与面试表达。每章保留原机制、逐点追问、图示与练习，完整案例默认折叠。

评测和数据章节沿用同一组 T5/T7 教学坏例，解释指标如何影响根因判断与修复选择。竞品推演只提供待执行的同题验证，不填写虚构厂商成绩。全部 65 个外部来源链接、10 个代码块及 16 张图保留；具身智能继续为独立学习单元。

该轮正文哈希与编辑范围见 `workshop-review.json`；16 项新增算术核对见 `workshop-arithmetic.json`。`structure-validation.json` 与 `validation.json` 对应当前版。`preview-workshop-*.png` 展示 1440、1280、390 像素宽度的完整推演展开；移动端宽表格有滑动提示并支持键盘聚焦。这里只核查文本结构、教学计算与本地页面，没有运行真实模型、训练、Agent、业务或机器人任务，未发布。
