# Markdown 深度写作指南

站点文章统一放在 `src/content/writing/`。当前写作方向以 [Blog 写作规范](blog-rewrite/README.md) 为准；正文使用模型可直接理解的语言，Markdown 保持可移植。

## 1. 不使用图片，直接表达信息

Blog 文章不使用截图、课件图片、装饰插图或图片形式的图表。原有图片和画廊能力不再作为写作方式。

- 概念用文字定义，术语保持一致，指代明确。
- 架构用文字或 Markdown 表格说明模块责任、接口与依赖。
- 流程用有序步骤说明执行主体、输入、输出、分支、失败与恢复条件。
- 数据用 Markdown 表格保留数值、单位、口径和来源，并用文字解释结论。
- 原始资料中的图片信息应融入连续正文，保留来源链接，区分事实与推演。

以下 Mermaid 与 ECharts 章节记录现有技术能力。写作优先采用上述文本表达，核心信息必须能在不渲染图形的情况下完整理解，不将图形导出为图片插入文章。

## 2. Mermaid 流程图

````md
```mermaid
flowchart LR
  Goal[定义目标] --> Context[组织上下文]
  Context --> Harness[Agent Harness]
  Harness --> Tools[调用工具]
  Tools --> Review{人工校准}
  Review -->|继续| Harness
  Review -->|完成| Result[交付结果]
```
````

## 3. Mermaid 架构图

````md
```mermaid
architecture-beta
  group product(cloud)[AI Product]
  service user(internet)[User] in product
  service harness(server)[Agent Harness] in product
  service model(server)[Foundation Model] in product
  service memory(database)[Context and Memory] in product
  service tools(disk)[Tools] in product

  user:R --> L:harness
  harness:R --> L:model
  harness:B --> T:memory
  harness:B --> T:tools
```
````

同样支持 `sequenceDiagram`、`stateDiagram-v2`、`classDiagram`、`erDiagram`、`gantt`、`mindmap`、`C4Context` 等 Mermaid 图形。页面提供缩放、复位、全屏、复制源码和 SVG 导出。

## 4. ECharts 数据图表

`echarts` 围栏内必须是合法 JSON，不能包含 JavaScript 函数：

````md
```echarts
{
  "tooltip": { "trigger": "axis" },
  "legend": { "data": ["完成率", "返工率"] },
  "grid": { "left": 42, "right": 20, "top": 58, "bottom": 34 },
  "xAxis": {
    "type": "category",
    "data": ["对话", "工具", "工作流", "自治"]
  },
  "yAxis": { "type": "value", "max": 100 },
  "series": [
    {
      "name": "完成率",
      "type": "line",
      "smooth": true,
      "data": [32, 51, 68, 76]
    },
    {
      "name": "返工率",
      "type": "bar",
      "data": [42, 31, 22, 18]
    }
  ]
}
```
````

支持折线、柱状、饼图、散点、雷达、仪表盘、漏斗、热力、关系图、树图、矩形树图、桑基图和旭日图。页面提供全屏查看、配置复制和 PNG 导出。

## 5. 数学公式

行内公式：

```md
单次执行的期望价值可以写成 $V = P(s)R - C$。
```

独立公式：

```md
$$
P(s) = \prod_{i=1}^{n} p_i
$$
```

公式由 KaTeX 在构建阶段生成，不需要浏览器端计算。

## 6. Callout

```md
> [!NOTE]
> 用于补充背景信息。

> [!TIP]
> 用于给出实践建议。

> [!IMPORTANT]
> 用于指出核心判断。

> [!WARNING]
> 用于说明风险。

> [!CAUTION]
> 用于提醒不可逆或高风险操作。
```

## 7. 代码块

````md
```ts
const result = await harness.run({ goal, context, tools });
```
````

代码块自动获得深浅主题语法高亮、自动换行开关和复制按钮。

## 8. 视频、音频与网页嵌入

Markdown 允许直接写 HTML：

```html
<video controls>
  <source src="/media/demo.mp4" type="video/mp4" />
</video>

<audio controls src="/media/podcast.mp3"></audio>

<iframe
  src="https://www.youtube-nocookie.com/embed/VIDEO_ID"
  title="演示视频"
  loading="lazy"
  allowfullscreen>
</iframe>
```

本地视频和音频分别放在 `public/media/`。嵌入第三方网页前，应确认其允许 iframe 展示并填写准确的 `title`。

## 9. 表格、任务列表与折叠内容

```md
| 能力 | 当前状态 | 下一步 |
| --- | --- | --- |
| 工具调用 | 可用 | 增加恢复机制 |
| 长程任务 | 受限 | 优化状态管理 |

- [x] 定义目标
- [x] 提供上下文
- [ ] 校准结果
```

折叠内容使用标准 HTML：

```html
<details>
  <summary>查看实现细节</summary>
  <p>这里使用 HTML 编写折叠区域内的内容。</p>
</details>
```

## 10. 写作与检查

发布前运行：

```sh
npm run build
```

如果 Mermaid 或 ECharts 语法有误，页面会保留原始源码并显示错误信息。构建成功并不代表客户端图表语法一定正确，因此新图表建议同时在本地文章页面中检查一次。
