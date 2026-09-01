# Markdown 深度写作指南

站点文章统一放在 `src/content/writing/`。Markdown 保持可移植，图表和增强交互通过代码围栏或标准 HTML 表达。

## 1. 图片、图注与画廊

图片建议放在 `public/images/`：

```md
![Agent Harness 结构](/images/agent-harness.png "Agent Harness 的核心模块")
```

- 方括号内容是无障碍替代文本，必须准确描述图片。
- 引号内的 title 会显示成图注。
- 点击图片会打开大图查看器。
- 图片自动启用懒加载和异步解码。

将两张图片写在同一个段落中，会形成双列画廊：

```md
![方案 A](/images/plan-a.png "方案 A") ![方案 B](/images/plan-b.png "方案 B")
```

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
<video controls poster="/images/demo-cover.jpg">
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
