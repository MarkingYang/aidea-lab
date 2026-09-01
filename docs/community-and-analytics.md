# 评论与阅读量部署

本站只使用一个动态服务：Artalk。它同时负责文章累计阅读量、评论数、免登录评论和管理后台；数据默认保存在 SQLite，不需要再部署 Umami、MySQL、Docker 或 GitHub Discussions。

## 架构

```text
GitHub 仓库 ──构建──> Astro 静态文件 ──Nginx──> ainoteatlas.com
                                              └──────> comments.ainoteatlas.com ──> Artalk + SQLite
```

## 服务器目录

建议保持三个清楚的目录：

```text
/opt/aidea-lab/       Git 仓库
/etc/artalk/          Artalk 环境配置
/var/lib/artalk/      SQLite 数据
/srv/ainoteatlas/     Astro 构建后的静态文件
```

## 1. 启动 Artalk

服务器直接安装 Artalk 官方 Linux 二进制，并由 systemd 管理。仓库提供 `deploy/artalk/artalk.service` 和 `deploy/artalk/artalk.env.example`；实际部署固定使用与前端依赖一致的 Artalk 2.10.0。

```sh
sudo systemctl status artalk
sudo journalctl -u artalk -n 100 --no-pager
cd /var/lib/artalk
sudo -u artalk -H bash -c 'set -a; source /etc/artalk/artalk.env; set +a; exec /usr/local/bin/artalk admin'
```

最后一条命令用于交互式创建站长账号。普通访客不需要账号，填写昵称与邮箱即可评论。服务只监听服务器本机 `127.0.0.1:23366`，不会绕过 HTTPS 反向代理直接暴露到公网。

## 2. 域名与反向代理

添加 DNS 解析：

- `ainoteatlas.com` → `43.172.92.100`
- `www.ainoteatlas.com` → `43.172.92.100`
- `comments.ainoteatlas.com` → `43.172.92.100`

仓库中的 `deploy/nginx.conf` 让主域名读取 `/srv/ainoteatlas`，并把评论子域名反向代理到 Artalk。DNS 生效后再使用 Certbot 为三个域名申请和自动续期 HTTPS 证书。

部署只会新增一个 Nginx 配置文件，不会覆盖服务器现有的默认站点或 FRP 配置。

## 3. 构建静态站点

```sh
cd /opt/aidea-lab
git pull --ff-only
npm ci
SITE_URL=https://ainoteatlas.com npm run build -- --force
sudo mkdir -p /srv/ainoteatlas
sudo rsync -a --delete dist/ /srv/ainoteatlas/
```

以后发布新文章只需推送 Markdown，然后在服务器执行以上六条命令。后续可以再加 GitHub Actions 自动部署，但它不是博客上线的必要条件。

## 4. 统计口径

- 文章卡片和正文头部展示 Artalk 保存的累计 PV。
- 同一个访客刷新页面仍可能增加 PV，因此它是“页面浏览量”，不是严格去重人数。
- 评论数来自同一文章路径下的真实评论。
- 首页保持按时间排序；不为了一个热门榜再引入第二套统计系统。

## 5. 备份

需要备份的只有 `/var/lib/artalk/data/`。最省心的方法是开启腾讯云自动快照；在升级或迁移前，再额外执行一次：

```sh
sudo systemctl stop artalk
sudo tar -czf "/var/backups/artalk-$(date +%F).tar.gz" -C /var/lib/artalk data
sudo systemctl start artalk
```

停止容器后再复制 SQLite，可避免备份过程中数据库仍在写入。静态文章已经保存在 GitHub，不需要重复备份。

## 6. 上线检查

- `https://ainoteatlas.com` 可以打开，且 HTTPS 正常。
- `https://comments.ainoteatlas.com` 可以打开 Artalk 服务。
- 文章卡片和正文显示阅读量、评论数。
- 使用无痕窗口、不登录 GitHub也能发表评论。
- Artalk 后台能够审核或删除评论。
- 腾讯云防火墙只开放 SSH、HTTP 和 HTTPS，不开放 23366。
