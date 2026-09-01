# 大飞随笔

使用 Astro 构建的个人 AI 研究博客。Markdown 保存在 GitHub，Astro 生成静态页面；自有服务器通过 Nginx 提供页面，并运行一个单文件 Artalk 服务。

## 本地运行

```sh
npm install
npm run dev
```

开发地址默认为 `http://localhost:4321`。生产构建使用：

```sh
npm run build -- --force
```

构建结果位于 `dist/`。

## 添加一篇内容

所有文章都放在 [`src/content/writing/`](src/content/writing/)；文件名就是文章 URL 的末段。例如新建 `agent-harness.md`：

```md
---
title: Agent Harness 正在进入什么阶段
description: 从产品能力、工程边界与工作模式观察 Agent Harness。
publishedAt: 2026-09-01
type: essay
status: seed
topics:
  - Agent Harness
featured: false
readingTime: 8 min
---

从这里开始写正文。
```

内容类型：`note` 短笔记、`essay` 长文、`weekly` 每周信号。内容状态：`seed`、`growing`、`evergreen`、`archived`。

提交并发布：

```sh
git add src/content/writing
git commit -m "content: add agent harness essay"
git push
```

服务器每两分钟轻量检查一次 `main` 的 Commit ID；发现变化后才拉取、构建并发布，通常两分钟内上线。

## Markdown 能力

支持标题、引用、表格、任务列表、脚注、数学公式、代码高亮、图片、视频、音频、折叠内容，以及 Mermaid 流程图、时序图、状态图、类图、ER 图、甘特图和思维导图。

图片放在 `public/images/`，文章中使用：

```md
![图片说明](/images/example.png)
```

Mermaid 使用标准代码围栏：

````md
```mermaid
flowchart LR
  Goal[定义目标] --> Context[提供上下文]
  Context --> Agent[Agent Harness]
  Agent --> Review{人工校准}
  Review -->|继续| Agent
  Review -->|完成| Result[交付结果]
```
````

完整示例见 [`docs/markdown-guide.md`](docs/markdown-guide.md)。

## 自动生成的信息

- 分类来自每篇 Markdown 的 `topics`。
- 最新记录按 `updatedAt` 排序，未填写时使用 `publishedAt`。
- 时间线和 53 周写作热力图来自文章发布日期。
- 每篇文章的累计阅读量、评论数和末尾评论区来自 Artalk，是真实访问数据，不是静态模拟值。

## 评论与阅读量

生产环境默认连接 `https://comments.ainoteatlas.com`。如需覆盖，复制 `.env.example` 为 `.env`：

```dotenv
SITE_URL=https://ainoteatlas.com
PUBLIC_ARTALK_SERVER=https://comments.ainoteatlas.com
PUBLIC_ARTALK_SITE=AINoteAtlas
```

访客无需 GitHub，也无需注册账号；填写昵称与邮箱即可评论。服务器直接运行 Artalk 官方二进制与 SQLite，不需要 Docker 或额外数据库。部署说明见 [`docs/community-and-analytics.md`](docs/community-and-analytics.md)。

## 目录

```text
src/components/       页面组件
src/content/writing/  Markdown 文章（从这里开始写）
src/layouts/          公共布局与元数据
src/pages/            路由页面
src/styles/           全局样式
deploy/               Nginx 与 Artalk 服务配置
```
