# 访问统计与评论配置

站点使用 Umami 统计阅读，使用 Giscus 承载评论。所有标识通过环境变量注入，源码中不保存 API Token。

## 1. 连接 Umami

### 创建站点

可以使用 Umami Cloud，也可以自行部署 Umami。在 Umami 后台添加正式域名，复制 Website ID，并创建 API Key。

### 填写环境变量

```dotenv
PUBLIC_UMAMI_WEBSITE_ID=your-website-id
PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
PUBLIC_UMAMI_DOMAINS=your-domain.example,www.your-domain.example
UMAMI_API_URL=https://api.umami.is
UMAMI_API_TOKEN=your-private-api-key
```

使用自托管实例时：

```dotenv
PUBLIC_UMAMI_SCRIPT_URL=https://analytics.your-domain.example/script.js
UMAMI_API_URL=https://analytics.your-domain.example
```

### 数据如何进入页面

浏览器中的 Umami 脚本负责记录页面访问。生产构建会调用 Umami 的 expanded path metrics API，读取最近 30 天的数据，只保留 `/writing/` 路径，并生成首页热门榜。

本地开发环境不加载跟踪脚本。热门数据读取失败时，构建不会中断，页面会显示数据积累状态。

## 2. 连接 Giscus

### 准备 GitHub 仓库

1. 仓库必须为公开仓库。
2. 在仓库 Settings 的 Features 中启用 Discussions。
3. 安装 Giscus GitHub App，并授权访问这个仓库。
4. 创建或选择一个 Discussion 分类，例如 `Announcements`。

### 生成配置

打开 [giscus.app/zh-CN](https://giscus.app/zh-CN)，完成以下选择：

- 页面与 Discussion 映射：`pathname`
- Discussion 分类：选定的评论分类
- 启用主帖子反应
- 评论框位置：评论上方
- 语言：简体中文

把生成代码中的值写入环境变量：

```dotenv
PUBLIC_GISCUS_REPO=owner/repository
PUBLIC_GISCUS_REPO_ID=R_kg...
PUBLIC_GISCUS_CATEGORY=Announcements
PUBLIC_GISCUS_CATEGORY_ID=DIC_kw...
```

站点会自动处理深浅主题同步，并通过 Giscus metadata 在文章元信息中显示评论数量。

## 3. 上线检查

- `SITE_URL` 是正式 HTTPS 域名。
- `PUBLIC_UMAMI_DOMAINS` 只包含正式域名，不包含 localhost。
- `UMAMI_API_TOKEN` 保存在部署平台的 Secret 中。
- GitHub Discussions 已开启，Giscus App 已获得仓库权限。
- 生产页面能看到 Umami 的 `/api/send` 请求。
- 第一次测试评论后，GitHub Discussions 中出现对应路径的讨论。
- 积累访问后重新部署，首页热门榜出现真实阅读数据。

## 4. 数据口径

- 最新：按照 `updatedAt` 或 `publishedAt` 倒序。
- 热门：最近 30 天文章 pageviews。
- 访客：Umami visitors，用于后台分析，页面暂不公开展示。
- 评论数：Giscus 对应 Discussion 的总评论数量。

访问量与评论数分开表达。热门榜只按照阅读量排序，避免高争议文章因为评论更多而占据榜首。
