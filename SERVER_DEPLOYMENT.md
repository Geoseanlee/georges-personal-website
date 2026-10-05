# Mac mini 服务器部署与更新

本文记录目前 PersonalWeb 的正式部署方式，以及日后如何把 Git 变更安全地同步到 Mac mini。当前生产环境不是 Cloudflare Pages：前端静态文件、FastAPI 和 PostgreSQL 均由 Mac mini 提供，Cloudflare Tunnel 负责 HTTPS 与公网入口。

## 正式地址与架构

- 网站：<https://pluckyravengeorgeli.eu.cc>
- API：<https://api.pluckyravengeorgeli.eu.cc>
- 健康检查：`GET /api/v1/health`
- 项目列表：`GET /api/v1/projects`

```text
浏览器
  ├── https://pluckyravengeorgeli.eu.cc
  │       Cloudflare Tunnel -> 127.0.0.1:4173 -> frontend/dist
  └── https://api.pluckyravengeorgeli.eu.cc
          Cloudflare Tunnel -> 127.0.0.1:5050 -> FastAPI -> PostgreSQL 16
```

Tunnel 只主动向 Cloudflare 建立出站连接。API、静态站点和 PostgreSQL 均只监听 loopback；**不要把 PostgreSQL 5432 加入 Tunnel 或路由器端口转发**。

## Mac mini 上的部署文件

| 用途 | 路径 |
| --- | --- |
| Cloudflare Tunnel 配置（含域名到 loopback 的 ingress） | `~/.cloudflared/config.yml` |
| Tunnel 凭据 | `~/.cloudflared/<tunnel-id>.json` |
| API 数据库 URL 与 CORS | 仓库 `backend/.env` |
| 本地前端 API 地址 | `frontend/.env.local` |
| 生产前端 API 地址 | `frontend/.env.production.local` |
| API LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-api.plist` |
| 静态站点 LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-site.plist` |
| Tunnel LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-tunnel.plist` |
| API 构建产物 | `frontend/dist/` |
| 服务日志 | `~/Library/Logs/personalweb-{api,site,tunnel}*.log` |

`.env`、Tunnel credentials、Cloudflare `cert.pem` 和包含密钥的配置均为私有文件；不要把它们复制进 Git、截图或聊天。当前 API 使用 `backend/.env`，由 FastAPI 配置读取；较早创建的 `~/.config/personalweb/api.env` 不是 LaunchAgent 当前使用的配置来源。

生产 API CORS 精确允许网站根域名，以及本地开发 origin `http://localhost:5173`。API 文档 `/docs` 已关闭。

## 日常更新：前端或后端代码

在 Mac mini 上更新生产服务时，使用仓库根目录执行：

```bash
cd ~/orca/georges-personal-website
git status --short
git pull --ff-only origin main
```

`git pull --ff-only` 只接受快进更新，避免覆盖本机提交。如果 `git status` 显示未提交修改，先确认属于什么工作；不要用 `git reset --hard` 清理。

### 更新前端、样式、图片或前端 API 调用

```bash
cd ~/orca/georges-personal-website
npm ci --prefix frontend
npm run test --prefix frontend
npm run build --prefix frontend
npm run lint --prefix frontend
npm run test:e2e --prefix frontend
```

构建会将新文件写入 `frontend/dist/`。LaunchAgent 静态服务器直接服务这个目录，成功构建后无需重启它或 Cloudflare Tunnel。确认新页面可用：

```bash
curl -fsS -o /dev/null -w 'site HTTP %{http_code}\n' https://pluckyravengeorgeli.eu.cc/
```

如果只改了 API URL 等 Vite 构建时环境变量，**必须重新运行 `npm run build`**；环境变量是在构建时打入静态 bundle 的。

### 更新后端 API

```bash
cd ~/orca/georges-personal-website/backend
.venv/bin/python -m pytest
.venv/bin/python -m compileall -q app tests
launchctl kickstart -k gui/$(id -u)/com.geoseanlee.personalweb-api
curl -fsS https://api.pluckyravengeorgeli.eu.cc/api/v1/health
```

API LaunchAgent 由 `backend/.env` 读取数据库 URL 和 CORS。只在必要时改精确允许的 origin；不可使用允许任意 origin 的 CORS 配置。

### 更新数据库 Schema 或种子数据

先审阅迁移，再在 Mac mini 应用：

```bash
cd ~/orca/georges-personal-website/backend
.venv/bin/python -m alembic current
.venv/bin/python -m alembic upgrade head
```

迁移完成后检查 API 与项目列表：

```bash
curl -fsS https://api.pluckyravengeorgeli.eu.cc/api/v1/health
curl -fsS https://api.pluckyravengeorgeli.eu.cc/api/v1/projects
```

如果需要重跑 `db/seed.sql`，数据库连接会要求 `personalweb_app` 密码；密码只从本机 `backend/.env`/受限本地配置取得，不要把密码写入 shell 历史或命令行参数。种子 SQL 使用 slug 幂等 upsert。

需要重新载入公开种子数据时，在 `backend/` 目录运行以下命令，并在提示时输入本机 `backend/.env` 中配置的数据库密码：

```bash
psql -h 127.0.0.1 -U personalweb_app -d personalweb -W -v ON_ERROR_STOP=1 -f ../db/seed.sql
```

## 检查与服务管理

查看三项 LaunchAgent：

```bash
launchctl list | grep personalweb
```

检查 API/静态站点的本机监听和 PostgreSQL：

```bash
lsof -nP -iTCP:4173 -iTCP:5050 -sTCP:LISTEN
/opt/homebrew/opt/postgresql@16/bin/pg_isready -h 127.0.0.1 -p 5432
lsof -nP -iTCP:5432 -sTCP:LISTEN
```

查看服务日志：

```bash
tail -n 80 ~/Library/Logs/personalweb-api-error.log
tail -n 80 ~/Library/Logs/personalweb-site-error.log
tail -n 80 ~/Library/Logs/personalweb-tunnel-error.log
```

确认 Tunnel ingress 匹配正确：

```bash
cloudflared tunnel --config ~/.cloudflared/config.yml ingress validate
cloudflared tunnel info personalweb
```

LaunchAgent 会在登录后启动并在进程退出时重启。数据库通过 Homebrew 服务在登录时启动；Mac mini 必须保持联网和不睡眠，停电、重启、网络中断期间网站会暂时不可用。机器重启后检查上述三个 LaunchAgent 以及两个 HTTPS URL。

## 回滚

静态前端可用上一版源码重建，不要只手动替换散落的构建文件：

```bash
cd ~/orca/georges-personal-website
git log --oneline -10
git switch --detach <已验证的提交号>
npm ci --prefix frontend
npm run build --prefix frontend
```

回滚后端时也应使用对应源码版本，并确认数据库 Schema 与该版本兼容；数据库迁移**不会**因代码回滚自动撤销。回到主分支时：

```bash
git switch main
```

不要在没有备份和明确评估的情况下运行 Alembic downgrade、删除 PostgreSQL 数据目录或修改 `pg_hba.conf`。

## DNS 与常见问题

- 若 API 健康检查成功、根域名打不开，分别查询 `pluckyravengeorgeli.eu.cc` 的 A 记录和 NS 记录；检查手机/路由器 DNS 缓存。公共递归 DNS 缓存可能暂时不一致，可临时用 Google DNS `8.8.8.8`、`8.8.4.4`，不要因解析缓存重建 Tunnel。
- 若网站返回 Cloudflare 502，先检查本机 `127.0.0.1:4173`、`127.0.0.1:5050`，再看 Tunnel LaunchAgent 与错误日志。
- 若前端页面打开但项目 API 失败，检查生产 `VITE_API_BASE_URL` 是否为 `https://api.pluckyravengeorgeli.eu.cc`、CORS 是否精确允许网站根域名，再重新构建前端。
- Cloudflare Tunnel 凭据失效或被泄露时，应在 Cloudflare 中轮换/撤销，并安全更新 Mac mini 的本地凭据；不要把凭据提交到仓库。
