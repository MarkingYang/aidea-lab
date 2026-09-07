# 阅读图表与知识星图性能优化

2026-09-07，用户已明确要求推送本轮优化，发布目标为 origin/main。本轮不修改文章正文、日期和知识关系。

## 修改

- Mermaid 默认尺寸同时适配宽度和高度，正文 SVG 高度最多 420 CSS px，宽度最多自然宽度的 85%。减小图框留白与桌面宽度；缩放在图框内滚动，全屏重新适配，退出后恢复正文尺寸，导出保留自然分辨率。
- ECharts 默认画布从 340–480 px 收缩到 300–380 px，手机端 320 px。目前正文没有 ECharts 块，此项只调整公共组件样式。
- 评论计数库在页面实际具有计数器时才动态导入，星图不再下载该库。
- 星图只传输视图需要的字段；保留全部 138 个节点和 554 条关系。源图和文章推荐仍使用完整元数据。
- 标题布局统一读取容器尺寸并缓存文本宽度，避免循环中写入 DOM 后反复读取布局；缩放沿用 Sigma 自带绘制调度。

## 验证

- `npm run build`：72 篇、24 专题、8 知识域、118 跳转，内容与星图检查通过。
- `check-diagrams.mjs`：29 篇、90 张图，1440 / 390 px，深浅主题，共 116 个文章／主题／尺寸组合。检查图高、页面溢出、渲染错误；另外检查 A2A 的放大、滚动边缘、复位、全屏、SVG 下载和窗口缩放。结果见 `diagram-results.json`。人工检查桌面及手机截图。
- `scripts/graph-browser-check.mjs`：星图节点、标题避让、关系过滤、布局间距、搜索、聚焦、缩放、主题、手机面板、旧链接和阅读跳转。旧测试使用的已退休文章／专题名称已更新。

## 性能测量边界

`measure.mjs` 使用本地静态 dist 服务、Chrome 无头浏览器、1440 × 1000、冷缓存，CDP 网络限制下载 200,000 B/s、上传 100,000 B/s、延迟 100 ms，CPU 4 倍减速，每版独立新页面测三次。终点是图谱已初始化且加载层隐藏；不是整个页面所有后台网络请求完成。`before.json` 对应基线 6a4eecc；`after.json` 对应本轮最终实现。

- 可操作时间：修改前 4.052 / 4.034 / 4.038 秒；修改后 2.674 / 2.666 / 2.661 秒。中位数约减少 34%。
- 已下载 JS 解码大小：380,692 → 188,947 字节，约减少 50%。
- A2A 四图默认图框高度：750 / 769 / 524 / 830 → 504 / 504 / 414 / 504 px。

本地 Python 静态服务不启用 HTTP 压缩；线上压缩、缓存、设备与网络不同，此处不是线上加载时间承诺。

运行示例：

```sh
BLOG_PLAYWRIGHT_ROOT=/path/to/node_modules BLOG_BASE_URL=http://localhost:4398 node docs/reading-performance/check-diagrams.mjs
BLOG_PLAYWRIGHT_ROOT=/path/to/node_modules BLOG_BASE_URL=http://localhost:4398 node docs/reading-performance/measure.mjs /tmp/reading-performance.json
BLOG_PLAYWRIGHT_ROOT=/path/to/node_modules BLOG_BASE_URL=http://localhost:4398 node scripts/graph-browser-check.mjs
```
