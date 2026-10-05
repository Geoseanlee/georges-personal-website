# Cloudflare Pages 与 Mac mini 部署/更新

本文记录 PersonalWeb 的部署目标及自动更新方式。**迁移状态：**Mac mini API 和 PostgreSQL 已通过命名 Cloudflare Tunnel 运行；自动同步脚本正在设置。前端目前仍由 Mac mini 静态服务提供。Cloudflare Pages 项目授权与根域名切换尚待 Cloudflare Dashboard 完成，完成后 GitHub `main` push 才会触发 Pages 自动构建。

## 正式地址与架构

- 网站：<https://pluckyravengeorgeli.eu.cc>
- API：<https://api.pluckyravengeorgeli.eu.cc>
- 健康检查：`GET /api/v1/health`
- 项目列表：`GET /api/v1/projects`

```text
目标架构（Pages 自定义域名切换完成后）
  ├── https://pluckyravengeorgeli.eu.cc
  │       Cloudflare Pages <- GitHub main (frontend/)
  └── https://api.pluckyravengeorgeli.eu.cc
          Cloudflare Tunnel -> 127.0.0.1:5050 -> FastAPI -> PostgreSQL 16
```

Pages 读取 GitHub `main`，构建目录设为 `frontend/`，构建命令 `npm run build`，输出目录 `dist`。构建环境需设置 `VITE_API_BASE_URL=https://api.pluckyravengeorgeli.eu.cc`。

Cloudflare Dashboard 的 Pages 项目字段：Framework preset 选 Vite；Production branch `main`；Root directory `frontend`；Build command `npm run build`；Build output directory `dist`；Production environment variable `VITE_API_BASE_URL=https://api.pluckyravengeorgeli.eu.cc`。预览环境如启用，也应设置相同 API URL 或使用独立预览配置。

Mac mini 的 API 和 PostgreSQL 继续留在本机。Tunnel 只主动向 Cloudflare 建立出站连接；API 和 PostgreSQL 只监听 loopback。**不要把 PostgreSQL 5432 加入 Tunnel 或路由器端口转发**。

> **首次启用 Pages 的人工步骤：**在 Cloudflare Dashboard 的 Workers & Pages 中创建 Pages 项目，授权 GitHub 并选择此仓库，依上方填写 `main`、`frontend`、构建命令、输出目录与变量。先通过 Pages 提供的 `*.pages.dev` 地址验证前端/API，再把 `pluckyravengeorgeli.eu.cc` 绑定为 Pages 的 Custom domain。绑定前移除当前根域名指向 Tunnel 的 DNS route/CNAME，并从本机 Tunnel ingress 移除根域名路由；保留 `api.pluckyravengeorgeli.eu.cc`。确认正式域名已指向 Pages 后，检查浏览器项目数据和 CORS。`api` 域名与 API Tunnel 无需迁移。

## Mac mini 上的部署文件

| 用途 | 路径 |
| --- | --- |
| Cloudflare Tunnel 配置（含域名到 loopback 的 ingress） | `~/.cloudflared/config.yml` |
| Tunnel 凭据 | `~/.cloudflared/<tunnel-id>.json` |
| API 数据库 URL 与 CORS | 仓库 `backend/.env` |
| 本地前端 API 地址 | `frontend/.env.local` |
| 生产前端 API 地址 | `frontend/.env.production.local` |
| API LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-api.plist` |
| 迁移期间的本机静态站点 LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-site.plist` |
| Tunnel LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-tunnel.plist` |
| GitHub 同步 LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-git-sync.plist` |
| API 构建产物 | `frontend/dist/` |
| 自动部署状态 | `~/Library/Application Support/PersonalWeb/last-deployed-commit` |
| 服务日志 | `~/Library/Logs/personalweb-{api,site,tunnel,git-sync}*.log` |

`.env`、Tunnel credentials、Cloudflare `cert.pem` 和包含密钥的配置均为私有文件；不要把它们复制进 Git、截图或聊天。当前 API 使用 `backend/.env`，由 FastAPI 配置读取；较早创建的 `~/.config/personalweb/api.env` 不是 LaunchAgent 当前使用的配置来源。

生产 API CORS 精确允许网站根域名，以及本地开发 origin `http://localhost:5173`。API 文档 `/docs` 已关闭。

## 自动发布与同步

- **前端：**Cloudflare Pages 与 GitHub 仓库连接完成后，每次 push 到 `main` 都会自动构建并发布；Pages Build history 可查看结果。目前还需要完成本节开头的 Dashboard 授权、Pages 项目与域名切换。
- **Mac mini：**启用 `com.geoseanlee.personalweb-git-sync` 后，LaunchAgent 每 5 分钟执行 `scripts/deploy-macmini.sh` 检查 `origin/main`。有新提交时检查工作区、快进同步，再按改动运行前端检查/构建或后端测试/重启 API。
- 自动更新只接受 `main` 快进提交；遇到本机未提交改动、分支分叉、数据库 migration 或后端依赖清单变化时会停止并写日志，等待人工处理。**数据库 migration 不会自动执行。**
- 自动同步启动后，Mac mini 通常在 push 后 5 分钟内更新；Cloudflare Pages 在 GitHub push 后启动构建，完成时间以 Pages Build history 为准。Mac mini 离线时会在重新登录/联网后继续检查。

检查同步 agent 与日志：

```bash
launchctl list | grep -E 'personalweb-(api|site|tunnel|git-sync)'
tail -n 100 ~/Library/Logs/personalweb-git-sync.log
tail -n 100 ~/Library/Logs/personalweb-git-sync-stderr.log
```

手动立即检查/更新：

```bash
cd ~/orca/georges-personal-website
scripts/deploy-macmini.sh
```

脚本通过 `git fetch origin main` 检查更新，再使用 `git pull --ff-only`；发现工作区未提交修改时会拒绝覆盖。不要用 `git reset --hard` 清理。

### 前端发布

```bash
npm run test --prefix frontend
npm run lint --prefix frontend
npm run test:e2e --prefix frontend
npm run build --prefix frontend
```

前端改动 push 到 `main` 后，Cloudflare Pages 会自动构建；Mac mini 同步脚本也会检查并构建 `frontend/dist/`，供 Pages 域名切换前继续服务或作本地预览。确认正式页面：

```bash
curl -fsS -o /dev/null -w 'site HTTP %{http_code}\n' https://pluckyravengeorgeli.eu.cc/
```

如果只改了 API URL 等 Vite 构建时环境变量，必须在 Cloudflare Pages 环境设置中修改并重新部署；变量在构建时打入静态 bundle。

### Mac mini 后端 API 发布

只改 `backend/app/` 或兼容的代码/测试后，自动同步脚本快进到最新 `main`、运行 pytest 与语法检查，随后重启 `com.geoseanlee.personalweb-api` 并检查 loopback 健康端点。

API LaunchAgent 从 `backend/.env` 读取数据库 URL 和 CORS。生产 CORS 精确允许站点根域名和本地开发 origin；不可允许任意 origin。

后端依赖文件有变化时，自动同步会暂停，提示人工安装/检查依赖，然后测试并重启 API。可按下文数据库/后端升级步骤处理。

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

查看 PersonalWeb LaunchAgent：

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

服务 LaunchAgent 会在登录后启动并在进程退出时重启；Git 同步 LaunchAgent 登录后运行，并每 5 分钟检查一次。数据库通过 Homebrew 服务在登录时启动；Mac mini 必须保持联网和不睡眠，停电、重启、网络中断期间网站会暂时不可用。机器重启后检查上述 LaunchAgent 以及两个 HTTPS URL。

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
- Pages 自定义域名尚未切换完成前，根域名仍由 Mac mini 静态服务提供；Cloudflare Tunnel 本身不会从 GitHub 拉取代码。
- 若网站返回 Cloudflare 502，先检查本机 `127.0.0.1:4173`、`127.0.0.1:5050`，再看 Tunnel LaunchAgent 与错误日志。
- 若前端页面打开但项目 API 失败，检查生产 `VITE_API_BASE_URL` 是否为 `https://api.pluckyravengeorgeli.eu.cc`、CORS 是否精确允许网站根域名，再重新构建前端。
- Cloudflare Tunnel 凭据失效或被泄露时，应在 Cloudflare 中轮换/撤销，并安全更新 Mac mini 的本地凭据；不要把凭据提交到仓库。
