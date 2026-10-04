# PersonalWeb v2 — 实施规划（合并版）

> 将现有静态 HTML 网站迁移为 React + ASP.NET Core + PostgreSQL 全栈架构。
> 前端部署到 Cloudflare Pages；后端 API 与 PostgreSQL 运行在 Mac mini 上，
> 通过 Cloudflare Tunnel 对外暴露只读 API。

---

## 目录

1. [架构总览](#架构总览)
2. [目录结构](#目录结构)
3. [数据库 Schema](#数据库-schema)
4. [API 契约](#api-契约)
5. [环境变量](#环境变量)
6. [前提条件清单](#前提条件清单)
7. [实施阶段](#实施阶段)
8. [本地验证命令](#本地验证命令)
9. [成本说明](#成本说明)

---

## 架构总览

```
用户浏览器
    │
    ▼
Cloudflare Pages              Mac mini (Gold Coast, QLD)
  React + TypeScript  ──►  Cloudflare Tunnel  ──►  ASP.NET Core Minimal API
  (*.pages.dev)               (仅出站连接)                    │
                                                              ▼
                                                       PostgreSQL 16
                                                       (仅监听 127.0.0.1)
```

**技术栈：**

| 层     | 技术                                       | 托管               |
|--------|--------------------------------------------|--------------------|
| 前端   | React 18 + TypeScript + Vite               | Cloudflare Pages   |
| 测试   | Vitest + React Testing Library + Playwright | 本地 CI            |
| 后端   | ASP.NET Core 10 LTS Minimal API            | Mac mini（自托管） |
| 数据库 | PostgreSQL 16                              | Mac mini（本地）   |
| ORM    | EF Core + Npgsql                           | —                  |
| 隧道   | Cloudflare Tunnel (cloudflared)            | Cloudflare（免费） |
| DNS    | Cloudflare DNS                             | Cloudflare（免费） |

**全局约束：**

- MVP 只有一张表和只读公开路由；不实现认证、写操作、管理后台、联系表单。
- API 和 PostgreSQL 只监听 loopback；PostgreSQL 端口永远不通过 Tunnel 对外暴露。
- API 不可用时前端必须展示清晰错误状态，其余页面内容保持可用（不白屏）。
- 所有 secret 和本地 `.env` 文件不进版本控制。
- 在现有仓库（`PersonalWeb/`）内改造，保留 Git 历史。

---

## 目录结构

```
PersonalWeb/                          ← 现有 Git 仓库根目录
├── .github/
│   └── copilot-instructions.md       ← 迁移完成后更新为全栈结构说明
├── backend/
│   ├── PersonalWeb.Api/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── DesignTimeDbContextFactory.cs
│   │   │   └── Migrations/           ← EF Core 迁移文件（Schema 权威来源）
│   │   ├── Endpoints/
│   │   │   ├── HealthEndpoints.cs
│   │   │   └── ProjectEndpoints.cs
│   │   ├── Models/
│   │   │   └── Project.cs
│   │   ├── Dtos/
│   │   │   └── ProjectResponse.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── PersonalWeb.Api.csproj
│   └── PersonalWeb.Api.Tests/
│       ├── ApiFactory.cs
│       ├── HealthEndpointsTests.cs
│       ├── ProjectEndpointsTests.cs
│       └── PersonalWeb.Api.Tests.csproj
├── db/
│   └── seed.sql                      ← 幂等种子数据（4 个项目）
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SiteHeader.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── WorkSection.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── JourneySection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── SiteFooter.tsx
│   │   ├── data/
│   │   │   └── projectsApi.ts
│   │   ├── hooks/
│   │   │   └── useProjects.ts
│   │   ├── types/
│   │   │   └── project.ts
│   │   ├── styles/
│   │   │   └── global.css            ← 从现有 styles.css 迁移
│   │   ├── test/
│   │   │   ├── setup.ts
│   │   │   └── fixtures/projects.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── e2e/
│   │   └── responsive.spec.ts
│   ├── index.html
│   ├── playwright.config.ts
│   ├── vite.config.ts
│   └── package.json
├── .env.example                      ← 仅变量名和示例值，不含 secret
├── .gitignore
├── CONTEXT.md
├── PLAN.md                           ← 本文件
└── README.md                         ← 本地开发与部署指南
```

根目录现有的 `index.html`、`styles.css`、`script.js` 在 React 页面通过内容和响应式验证前**保持不动**，迁移完成后再删除。

---

## 数据库 Schema

使用 EF Core Migration 作为 Schema 权威来源；`db/seed.sql` 用 `ON CONFLICT (slug) DO UPDATE` 实现幂等插入。

```sql
CREATE TABLE projects (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          VARCHAR(80)   NOT NULL UNIQUE,
  title         VARCHAR(120)  NOT NULL,
  project_type  VARCHAR(60)   NOT NULL,
  year          SMALLINT      NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  description   TEXT          NOT NULL,
  tags          TEXT[]        NOT NULL DEFAULT '{}',
  github_url    TEXT          NOT NULL CHECK (github_url LIKE 'https://github.com/%'),
  display_order SMALLINT      NOT NULL DEFAULT 0,
  is_featured   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

**种子数据（按 `display_order` 排序）：**

| display_order | slug                       | title                    | year | is_featured |
|---------------|----------------------------|--------------------------|------|-------------|
| 1             | `blotz-task-app`           | Blotz Task App           | 2025 | true        |
| 2             | `renopilot`                | RenoPilot                | 2025 | false       |
| 3             | `global-youth-sdgs-summit` | Global Youth SDGs Summit | 2025 | false       |
| 4             | `ai-health-management`     | AI Health Management     | 2024 | false       |

---

## API 契约

- **生产 Base URL：** `https://api.<owned-domain>`（需要 Cloudflare 管理的域名）
- **本地 Base URL：** `http://127.0.0.1:5050`

| 方法  | 路径                   | 成功响应                                               | 失败响应                              |
|-------|------------------------|--------------------------------------------------------|---------------------------------------|
| `GET` | `/api/v1/health`       | `200 { "status": "ok" }`（API 和 DB 均可用）           | `503 { "status": "unavailable" }`     |
| `GET` | `/api/v1/projects`     | `200 ProjectResponse[]`，按 `displayOrder` 升序排列；空表返回 `[]` | `503` Problem Details（DB 查询失败）  |

**MVP 不实现：** POST / PATCH / DELETE、认证、联系表单、管理后台。

**ProjectResponse JSON（camelCase）：**

```json
{
  "id": 1,
  "slug": "blotz-task-app",
  "title": "Blotz Task App",
  "projectType": "FULL-STACK · 2025",
  "year": 2025,
  "description": "A task management app...",
  "tags": ["C# / .NET", "React Native", "SQL Server"],
  "githubUrl": "https://github.com/sol-wizard/Blotz-Task-App",
  "displayOrder": 1,
  "isFeatured": true
}
```

**CORS：** 只允许配置中指定的精确 origin（`AllowedOrigins__0`、`AllowedOrigins__1`），不使用 `AllowAnyOrigin`。

---

## 环境变量

### API（Mac mini，不提交 Git）

```
ConnectionStrings__DefaultConnection=Host=127.0.0.1;Port=5432;Database=personalweb;Username=personalweb_app;Password=<secret>
ASPNETCORE_URLS=http://127.0.0.1:5050
ASPNETCORE_ENVIRONMENT=Production
AllowedOrigins__0=http://localhost:5173
AllowedOrigins__1=https://<pages-project>.pages.dev
```

### 前端（Cloudflare Pages 环境变量）

```
VITE_API_BASE_URL=https://api.<owned-domain>
```

### 本地开发（`frontend/.env.local`，不提交 Git）

```
VITE_API_BASE_URL=http://127.0.0.1:5050
```

仓库中只提交 `.env.example`，包含变量名和占位示例值。

---

## 前提条件清单

**在写第一行代码前，以下必须全部就绪：**

| 条件                             | 验证方式                                           |
|----------------------------------|----------------------------------------------------|
| Mac mini 禁止自动睡眠            | 放置一夜后 SSH 仍可连接                            |
| Homebrew 已安装                  | `brew --version` 正常输出                          |
| PostgreSQL 16 运行中             | `pg_isready` 返回 `accepting connections`          |
| .NET 10 SDK 已安装               | `dotnet --version` 显示 `10.x.x`                  |
| Node.js 20+ 已安装               | `node --version` 显示 `v20.x` 或更高              |
| 域名在 Cloudflare DNS 管理下     | Cloudflare Dashboard 可看到该域名                  |
| cloudflared 已安装并授权         | `cloudflared tunnel list` 无报错                   |
| GitHub 仓库已推送                | `git remote -v` 显示正确远端地址                   |

---

## 实施阶段

### 阶段 0 — Mac mini 基础设施（先做，与代码无关）

> 参考：前提条件清单。基础设施未就绪，后续所有阶段都无法验证。

- [ ] 系统设置 → 电源适配器，关闭自动睡眠
- [ ] 安装 Homebrew（如未安装）：`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- [ ] `brew install postgresql@16` → `brew services start postgresql@16` → `pg_isready`
- [ ] `brew install dotnet` → 验证 `dotnet --version` 显示 `10.x.x`
- [ ] 注册域名并将 DNS 托管到 Cloudflare（**注意：需要付费**，见[成本说明](#成本说明)）
- [ ] `brew install cloudflare/cloudflare/cloudflared` → `cloudflared tunnel login`
- [ ] 确认 GitHub 仓库已推送：`git remote -v`

---

### 阶段 1 — 数据库

**产出物：** `db/seed.sql`；EF Core Migration；本地 `personalweb` 数据库含 4 行种子数据。

- [ ] 创建专用数据库角色和数据库：
  ```bash
  createuser --no-superuser --no-createdb personalweb_app
  createdb --owner=personalweb_app personalweb
  ```
- [ ] 创建 `backend/PersonalWeb.Api/` 项目并添加 EF Core + Npgsql 依赖
- [ ] 实现 `Project` 模型（字段见 Schema）和 `AppDbContext`
- [ ] 添加 `DesignTimeDbContextFactory`，使 EF 工具在无运行中 API 时也能生成迁移
- [ ] 生成初始迁移：`dotnet ef migrations add InitialCreate`
- [ ] 应用迁移：`dotnet ef database update`
- [ ] 编写幂等 `db/seed.sql`（使用 `ON CONFLICT (slug) DO UPDATE`），插入 4 个项目
- [ ] 应用种子：`psql personalweb < db/seed.sql`
- [ ] 验证：`psql personalweb -c "SELECT slug, title FROM projects ORDER BY display_order;"`
- [ ] 幂等验证：重跑 `seed.sql`，确认仍只有 4 行
- [ ] 约束验证：尝试插入 year=1999 和非 GitHub URL，确认 PostgreSQL 拒绝

---

### 阶段 2 — 后端 API

**产出物：** `GET /api/v1/health` 和 `GET /api/v1/projects`；集成测试全部通过。

- [ ] **先写测试**（`PersonalWeb.Api.Tests/`）：
  - 有序 ProjectResponse 及 camelCase 字段
  - 空数据库返回 `200 []`
  - DB 不可用时 health 返回 `503`、projects 返回 `503`
  - 运行测试，确认**红**（路由尚未实现）
- [ ] 实现 `GET /api/v1/health`：探测 DB 连接，返回 `200 ok` 或 `503 unavailable`
- [ ] 实现 `GET /api/v1/projects`：只读 EF 查询，按 `display_order` 升序，投影为 `ProjectResponse`
- [ ] 配置 CORS（精确 origin 从 `AllowedOrigins__*` 环境变量读取）
- [ ] 绑定 API 监听地址为 `http://127.0.0.1:5050`
- [ ] 运行测试，确认**全绿**：`dotnet test backend/PersonalWeb.Api.Tests/`
- [ ] 本地 curl 验证：
  ```bash
  curl -i http://127.0.0.1:5050/api/v1/health
  curl -i http://127.0.0.1:5050/api/v1/projects
  ```

---

### 阶段 3 — 前端 React

**产出物：** React 单页应用，内容和视觉与现有静态页面一致；单元测试全部通过。

- [ ] 创建 Vite 项目：`npm create vite@latest frontend -- --template react-ts`
- [ ] 安装依赖：Vitest、React Testing Library、Playwright
- [ ] **先写测试**（`src/components/*.test.tsx`）：
  - 导航链接存在且 href 正确
  - 从 fixture 渲染 ProjectCard
  - WorkSection 空状态（只显示标题，无卡片）
  - WorkSection API 错误（显示错误信息，其余 section 仍可用）
  - useProjects：成功、空数组、HTTP 错误、无效 JSON、缺少 env var、请求取消
  - 运行测试，确认**红**
- [ ] 将现有 `styles.css` 设计 token 迁移至 `frontend/src/styles/global.css`（保留暖色/绿色调、可见焦点环、reduced-motion 支持）
- [ ] 实现各 Section 组件，内容从现有 `index.html` 复制，保留 section ID：`home`、`about`、`work`、`journey`、`contact`
- [ ] 在 `SiteHeader.tsx` 实现移动端菜单：`aria-expanded`、点击链接关闭、Escape 关闭并归还焦点
- [ ] 实现 `projectsApi.ts` 和 `useProjects` hook；网络/HTTP/JSON 错误不静默转为空数组
- [ ] 将 hook 结果传入 `WorkSection`（loading、error、projects 三态）
- [ ] 运行测试，确认**全绿**：`npm run test`
- [ ] `npm run build` 通过
- [ ] 响应式目测：375px / 768px / 1280px，无水平溢出

---

### 阶段 4 — Cloudflare Tunnel + Mac mini 服务化

**产出物：** Mac mini 重启后 API 和 Tunnel 自动恢复；外部 curl 验证通过。

- [ ] 以 Release 模式发布 API：`dotnet publish -c Release -o /opt/personalweb-api`
- [ ] 创建权限受限的环境文件 `~/.config/personalweb/api.env`（`chmod 600`），存放连接字符串等 secret
- [ ] 编写本地启动脚本（不提交 Git），通过 `EnvironmentFile` 加载 secret 后启动 API
- [ ] 停止 PostgreSQL 验证 health 返回 `503`，恢复后再次验证返回 `200`
- [ ] 创建 Cloudflare Tunnel：`cloudflared tunnel create personalweb-api`
- [ ] 编写 `~/.cloudflared/config.yml`，路由 `api.<domain>` → `http://127.0.0.1:5050`
- [ ] Cloudflare DNS 添加 CNAME 记录（`api` → Tunnel ID）
- [ ] 外部验证：`curl https://api.<domain>/api/v1/health`
- [ ] 创建 launchd LaunchAgent（开机自启 + 崩溃重启）：
  - `~/Library/LaunchAgents/com.georgelee.personalweb-api.plist`
  - `~/Library/LaunchAgents/com.georgelee.cloudflared.plist`
- [ ] **重启 Mac mini**，验证两个服务自动恢复
- [ ] 建立 PostgreSQL 定期备份脚本，备份目录在 PostgreSQL data 目录之外
- [ ] 在 `README.md` 中补充服务管理、备份恢复、预期停机场景说明

---

### 阶段 5 — 部署前端 + E2E 验证

**产出物：** Cloudflare Pages 生产站点可访问；Playwright E2E 全部通过；现有静态文件删除。

- [ ] 编写 Playwright E2E（`frontend/e2e/responsive.spec.ts`）：
  - 三个视口（375px / 768px / 1280px）无水平溢出
  - Section 锚点跳转正常
  - 外部链接含 `target="_blank"` 和 `rel="noopener noreferrer"`
  - 移动端菜单：Escape 关闭并归还焦点、点击链接关闭、`aria-expanded` 正确重置
  - Mock API 失败：contact/navigation 仍可见
- [ ] 运行 `npm run test:e2e`，修复测试暴露的缺陷
- [ ] Cloudflare Pages 连接仓库，配置：
  - 根目录：`frontend/`
  - 构建命令：`npm run build`
  - 输出目录：`dist`
  - 环境变量：`VITE_API_BASE_URL=https://api.<domain>`
- [ ] 触发部署，验证 `*.pages.dev` 地址可访问
- [ ] 设置 API CORS 允许 Pages 生产 origin，重启 API
- [ ] 端到端验证：4 张项目卡片有序显示、外部链接、响应式布局、API 错误状态
- [ ] 内容和交互与现有静态页面对齐后，删除根目录 `index.html`、`styles.css`、`script.js`
- [ ] 更新 `.github/copilot-instructions.md` 和 `README.md` 为全栈说明

---

## 本地验证命令

```bash
# 前端（从 frontend/ 目录）
npm ci
npm run test
npm run test:e2e
npm run build

# 后端（从仓库根目录）
dotnet test backend/PersonalWeb.Api.Tests/PersonalWeb.Api.Tests.csproj
dotnet build backend/PersonalWeb.Api/PersonalWeb.Api.csproj

# 运行时检查
curl -i http://127.0.0.1:5050/api/v1/health
curl -i http://127.0.0.1:5050/api/v1/projects
```

---

## 成本说明

| 资源                      | 费用         | 备注                                           |
|---------------------------|--------------|------------------------------------------------|
| Cloudflare Pages 静态托管 | 免费         | 需确认当前用量和政策上限                       |
| Cloudflare Tunnel 服务    | 免费         | 需确认当前用量和政策上限                       |
| `*.pages.dev` 域名        | 免费         | 无需购买域名即可访问前端                       |
| 稳定 API 公开域名         | **需要付费** | 必须购买并在 Cloudflare 管理域名才有固定 Tunnel hostname |
| Cloudflare Quick Tunnel   | 免费         | `trycloudflare.com` 仅用于开发，hostname 每次重启都会变化，**不可用于生产** |
| Mac mini 自托管           | 电费         | 无 SLA，停电 / 重启 / 家庭宽带中断均会导致 API 不可用 |

---

## 暂不实现（v2 之后）

- 项目管理后台（CRUD 界面）
- 登录 / 认证
- 联系表单（邮件转发）
- 博客或文章功能
- 自定义域名绑定 Cloudflare Pages

---

## 参考资料

- 现有页面内容：`index.html`、`styles.css`、`script.js`、`CONTEXT.md`
- 原始草案：`PLAN_kiro.md`、`PLAN_ghcpl.md`
- [Cloudflare Tunnel 文档](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
- [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)
- [Cloudflare Pages React 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [.NET 支持生命周期](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)

---

*最后更新：2026-10-04*
