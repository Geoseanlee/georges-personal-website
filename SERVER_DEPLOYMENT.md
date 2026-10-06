# Cloudflare Pages 与 Mac mini 部署/更新

本文记录 PersonalWeb 的部署目标及自动更新方式。**生产状态（2026-10-06）：**FastAPI 与 PostgreSQL 16 已迁移至当前 Mac 上的 Docker Compose；正式 API 容器只映射到 `127.0.0.1:5050`，生产数据库保存在 Docker 命名卷且没有发布主机端口。Cloudflare Tunnel 仍将 API 路由至该 loopback 端口。静态前端仍由 Mac 上原有服务提供；Cloudflare Pages 项目授权与根域名切换尚待 Dashboard 完成。n8n 与 Hermes AI 不属于本次迁移。

## 正式地址与架构

- 网站：<https://pluckyravengeorgeli.eu.cc>
- API：<https://api.pluckyravengeorgeli.eu.cc>
- 健康检查：`GET /api/v1/health`
- 项目列表：`GET /api/v1/projects`

```text
目前
  ├── https://pluckyravengeorgeli.eu.cc
  │       Cloudflare Tunnel -> 127.0.0.1:4173 -> frontend/dist 静态服务
  └── https://api.pluckyravengeorgeli.eu.cc
          Cloudflare Tunnel -> 127.0.0.1:5050 -> Compose API -> Compose PostgreSQL 16

Pages 自定义域名切换完成后
  ├── https://pluckyravengeorgeli.eu.cc
  │       Cloudflare Pages <- GitHub main (frontend/)
  └── https://api.pluckyravengeorgeli.eu.cc
          Cloudflare Tunnel -> 127.0.0.1:5050 -> Compose API -> Compose PostgreSQL 16
```

Pages 读取 GitHub `main`，构建目录设为 `frontend/`，构建命令 `npm run build`，输出目录 `dist`。构建环境需设置 `VITE_API_BASE_URL=https://api.pluckyravengeorgeli.eu.cc`。

Cloudflare Dashboard 的 Pages 项目字段：Framework preset 选 Vite；Production branch `main`；Root directory `frontend`；Build command `npm run build`；Build output directory `dist`；Production environment variable `VITE_API_BASE_URL=https://api.pluckyravengeorgeli.eu.cc`。预览环境如启用，也应设置相同 API URL 或使用独立预览配置。

API 通过 Docker Compose 连接容器网络中的 PostgreSQL；API 只映射到主机 loopback `127.0.0.1:5050`，PostgreSQL 不发布主机端口。Tunnel 只主动向 Cloudflare 建立出站连接。**不要把 PostgreSQL 5432 加入 Tunnel 或路由器端口转发**。

> **首次启用 Pages 的人工步骤：**在 Cloudflare Dashboard 的 Workers & Pages 中创建 Pages 项目，授权 GitHub 并选择此仓库，依上方填写 `main`、`frontend`、构建命令、输出目录与变量。先通过 Pages 提供的 `*.pages.dev` 地址验证前端/API，再把 `pluckyravengeorgeli.eu.cc` 绑定为 Pages 的 Custom domain。绑定前移除当前根域名指向 Tunnel 的 DNS route/CNAME，并从本机 Tunnel ingress 移除根域名路由；保留 `api.pluckyravengeorgeli.eu.cc`。确认正式域名已指向 Pages 后，检查浏览器项目数据和 CORS。`api` 域名与 API Tunnel 无需迁移。

## Compose 环境与服务管理

仓库以一个共用 `compose.yaml` 定义 API、PostgreSQL、健康检查与持久卷，再分别用 `compose.dev.yaml` 和 `compose.prod.yaml` 覆盖环境差异。开发环境挂载源码、启用热重载，并映射到 `127.0.0.1:5051` / `127.0.0.1:5433`；生产环境使用不含测试依赖的镜像、独立凭据与独立命名卷，API 只监听 `127.0.0.1:5050`，数据库不发布到主机端口。两个 Compose 项目和数据库卷互相隔离。

生产项目名固定为 `personalweb-prod`；以下命令从仓库根目录运行。生产机私有配置位于忽略文件 `backend/.env.compose-api`、`backend/.secrets/postgres-admin-password`，不得提交或复制到镜像。Docker Desktop 必须运行；请在其设置中启用登录时启动，以便 Docker daemon 恢复后按 `restart: unless-stopped` 启动服务。

检查生产服务、健康状态与日志：

```bash
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml ps
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml logs --tail=100 api db
curl -fsS http://127.0.0.1:5050/api/v1/health
curl -fsS http://127.0.0.1:5050/api/v1/projects
```

常规停止/启动用相同 Compose 参数加 `stop` / `start`；正常重建 API 用部署脚本或 `build api` 后 `up -d api`。**不要运行生产项目的 `down -v`**：它会删除包含正式资料的 PostgreSQL 命名卷。

### 生产数据库备份与恢复

迁移前已创建并验证过一次备份；之后仍需定期备份。下面命令从容器内导出 PostgreSQL 自定义格式备份，输出在主机用户私有备份目录，且不会把数据库密码放入命令参数：

```bash
umask 077
mkdir -p "$HOME/Library/Application Support/PersonalWeb/backups"
chmod 700 "$HOME/Library/Application Support/PersonalWeb/backups"
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml exec -T db pg_dump -U personalweb_admin --role=personalweb_app --format=custom --no-owner --no-acl personalweb > "$HOME/Library/Application Support/PersonalWeb/backups/personalweb-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

此次迁移前备份为 `~/Library/Application Support/PersonalWeb/backups/personalweb-pre-docker-20261005T221131Z.dump`；已检查 archive catalog，并在独立 PostgreSQL 16 测试容器中还原验证四笔项目记录与 schema `0001`。正式生产卷也从同一备份还原并通过 API 验证。恢复前先停止 API 并确认目标数据库/卷，不能将备份直接覆盖现有资料；旧 Homebrew 数据目录暂予保留，不要删除。

## Mac mini 上的部署文件

| 用途 | 路径 |
| --- | --- |
| Cloudflare Tunnel 配置（含域名到 loopback 的 ingress） | `~/.cloudflared/config.yml` |
| Tunnel 凭据 | `~/.cloudflared/<tunnel-id>.json` |
| Compose 生产 API 数据库 URL 与 CORS | 忽略文件 `backend/.env.compose-api` |
| Compose PostgreSQL 管理员密钥 | 忽略文件 `backend/.secrets/postgres-admin-password` |
| Compose PostgreSQL 持久资料 | Docker 命名卷 `personalweb-production-postgres-data` |
| 迁移前 PostgreSQL 备份 | `~/Library/Application Support/PersonalWeb/backups/` |
| 本地前端 API 地址 | `frontend/.env.local` |
| 生产前端 API 地址 | `frontend/.env.production.local` |
| 旧 API LaunchAgent（已卸载，留作回滚） | `~/Library/LaunchAgents/com.geoseanlee.personalweb-api.plist` |
| 迁移期间的本机静态站点 LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-site.plist` |
| Tunnel LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-tunnel.plist` |
| GitHub 同步 LaunchAgent | `~/Library/LaunchAgents/com.geoseanlee.personalweb-git-sync.plist` |
| API 构建产物 | `frontend/dist/` |
| 自动部署状态 | `~/Library/Application Support/PersonalWeb/last-deployed-commit` |
| API / PostgreSQL 日志 | `docker compose ... logs api db` |
| 静态网站、Tunnel 与 Git 同步日志 | `~/Library/Logs/personalweb-{site,tunnel,git-sync}*.log` |

`.env`、Compose 凭据、Tunnel credentials、Cloudflare `cert.pem` 和包含密钥的配置均为私有文件；不要把它们复制进 Git、截图或聊天。旧原生 API 的数据库 URL 位于 `backend/.env`；Compose API 使用独立的忽略配置 `backend/.env.compose-api`。

生产 API CORS 精确允许网站根域名，以及本地开发 origin `http://localhost:5173`。API 文档 `/docs` 已关闭。

## 自动发布与同步

- **前端：**Cloudflare Pages 与 GitHub 仓库连接完成后，每次 push 到 `main` 都会自动构建并发布；Pages Build history 可查看结果。目前还需要完成本节开头的 Dashboard 授权、Pages 项目与域名切换。
- **Mac mini：**启用 `com.geoseanlee.personalweb-git-sync` 后，LaunchAgent 每 5 分钟执行 `scripts/deploy-macmini.sh` 检查 `origin/main`。有新提交时检查工作区、快进同步，再按改动运行前端检查/构建，或运行后端测试、构建生产 API 镜像、更新 Compose API 并检查健康端点。
- 自动更新只接受 `main` 快进提交；遇到本机未提交改动、分支分叉、数据库 migration 或后端依赖清单变化时会停止并写日志，等待人工处理。**数据库 migration 不会自动执行。**
- 本次 Compose 部署已提交并推送至 `main`；已运行 `scripts/deploy-macmini.sh --accept-reviewed-changes`，依赖变更获人工确认，部署状态已同步。后续推送会由同步 LaunchAgent 按规则检查并部署。
- 处理 migration/依赖变更时，先审查提交并备份数据库，再手动快进同步；若依赖清单变更，先安装后端 `.venv` 依赖，再按新源码构建 API 镜像并执行 Compose migration。完成后在仓库根目录运行 `scripts/deploy-macmini.sh --accept-reviewed-changes`；它会重新测试、构建/更新服务并健康检查，成功后才更新部署状态：

```bash
git pull --ff-only origin main
backend/.venv/bin/python -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml build api
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml run --rm api alembic upgrade head
scripts/deploy-macmini.sh --accept-reviewed-changes
```
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

### Compose 后端 API 发布

只改 `backend/app/` 或兼容的代码/测试后，自动同步脚本快进到最新 `main`、运行 pytest 与语法检查，随后重建并更新 `personalweb-prod` Compose API，检查 `127.0.0.1:5050` 健康端点。原 API LaunchAgent 已卸载；Tunnel hostname 与 loopback `5050` 路由不变。

Compose API 从忽略文件 `backend/.env.compose-api` 读取数据库 URL 和 CORS。生产 CORS 精确允许站点根域名和本地开发 origin；不可允许任意 origin。Docker Desktop 退出时 API 和数据库不可用；容器重启策略只能在 Docker daemon 运行后生效。

后端依赖文件有变化时，自动同步会暂停，提示人工安装/检查依赖，然后测试并重启 API。可按下文数据库/后端升级步骤处理。

### 更新数据库 Schema 或种子数据

先备份数据库并审阅迁移，再在 Mac mini 检查并应用：

```bash
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml run --rm api alembic current
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml run --rm api alembic upgrade head
```

迁移完成后检查 API 与项目列表：

```bash
curl -fsS https://api.pluckyravengeorgeli.eu.cc/api/v1/health
curl -fsS https://api.pluckyravengeorgeli.eu.cc/api/v1/projects
```

如果需要重跑 `db/seed.sql`，种子 SQL 使用 slug 幂等 upsert：

```bash
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml exec -T db psql -U personalweb_app -d personalweb -v ON_ERROR_STOP=1 < db/seed.sql
```

## 检查与服务管理

查看 PersonalWeb LaunchAgent：

```bash
launchctl list | grep -E 'personalweb-(site|tunnel|git-sync)'
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml ps
```

检查 API/静态站点监听。Compose PostgreSQL 不发布主机端口；当前仍保留的 Homebrew PostgreSQL 监听 `127.0.0.1:5432` / `::1:5432`，供本机其他开发数据库或回滚使用，生产 Compose API 不连接它：

```bash
lsof -nP -iTCP:4173 -iTCP:5050 -sTCP:LISTEN
lsof -nP -iTCP:5432 -sTCP:LISTEN
```

查看静态网站/Tunnel 日志及容器日志：

```bash
tail -n 80 ~/Library/Logs/personalweb-site-error.log
tail -n 80 ~/Library/Logs/personalweb-tunnel-error.log
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml logs --tail=80 api db
```

确认 Tunnel ingress 匹配正确：

```bash
cloudflared tunnel --config ~/.cloudflared/config.yml ingress validate
cloudflared tunnel info personalweb
```

静态网站、Tunnel 与 Git 同步仍由 LaunchAgent 管理；API 和数据库由 Compose 管理。请在 Docker Desktop 设置中启用登录时启动，并检查容器使用 `unless-stopped` 重启策略。Mac 必须保持联网和不睡眠，停电、重启、网络中断期间网站会暂时不可用。机器重启后检查容器、剩余 LaunchAgent 以及两个 HTTPS URL。

## 回滚

若 Compose API 无法恢复，可回到保留中的 Homebrew PostgreSQL 与旧 API LaunchAgent。先停止 Compose 项目，再启动原生数据库和 API：

```bash
docker compose -p personalweb-prod --env-file backend/.env.compose-api -f compose.yaml -f compose.prod.yaml stop api db
brew services start postgresql@16
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.geoseanlee.personalweb-api.plist"
curl -fsS http://127.0.0.1:5050/api/v1/health
```

Compose 命名卷和迁移前备份会保留。回滚后旧数据库不会包含迁移后发生的任何写入；目前公开 API 为只读，因此检查 API 与公开项目资料后再恢复 Tunnel 流量。不要运行 `down -v`。

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
