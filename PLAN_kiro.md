# PersonalWeb v2 — 项目规划文档

> 从静态 HTML 网站迁移到 React + ASP.NET Core + PostgreSQL 全栈架构，
> 通过 Cloudflare Tunnel 从 Mac mini 对外提供 API，前端部署到 Cloudflare Pages。

---

## 目录

1. [架构总览](#架构总览)
2. [目录结构](#目录结构)
3. [数据库 Schema](#数据库-schema)
4. [API 路由](#api-路由)
5. [部署架构](#部署架构)
6. [实施阶段](#实施阶段)
7. [环境变量](#环境变量)
8. [前提条件清单](#前提条件清单)

---

## 架构总览

```
用户浏览器
    │
    ▼
Cloudflare Pages          Mac mini (Gold Coast, QLD)
  React + TypeScript  ──► Cloudflare Tunnel ──► ASP.NET Core Minimal API
  (*.pages.dev)              (outbound only)          │
                                                       ▼
                                                 PostgreSQL 16
                                                 (本地运行)
```

**技术栈：**

| 层     | 技术                        | 托管           |
|--------|-----------------------------|----------------|
| 前端   | React 18 + TypeScript + Vite | Cloudflare Pages |
| 后端   | ASP.NET Core 9 Minimal API  | Mac mini (自托管) |
| 数据库 | PostgreSQL 16               | Mac mini (本地) |
| 隧道   | Cloudflare Tunnel (cloudflared) | Cloudflare (免费) |
| DNS    | Cloudflare DNS              | Cloudflare (免费) |

---

## 目录结构

```
personal-web-v2/              ← 新 Git 仓库根目录
├── frontend/                 ← React + Vite 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Work.tsx          ← 从 API 拉取项目数据
│   │   │   ├── Journey.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── Footer.tsx
│   │   ├── types/
│   │   │   └── project.ts        ← Project 类型定义
│   │   ├── hooks/
│   │   │   └── useProjects.ts    ← 数据获取 hook
│   │   ├── styles/
│   │   │   └── global.css        ← 移植自现有 styles.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── api/                      ← ASP.NET Core Minimal API
│   ├── Endpoints/
│   │   ├── HealthEndpoints.cs
│   │   └── ProjectEndpoints.cs
│   ├── Models/
│   │   └── Project.cs
│   ├── Data/
│   │   └── AppDbContext.cs       ← Npgsql 连接
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── PersonalWebApi.csproj
│
├── db/
│   ├── schema.sql               ← 建表脚本
│   └── seed.sql                 ← 初始数据（4 个项目）
│
├── .gitignore
└── README.md
```

---

## 数据库 Schema

### projects 表

```sql
CREATE TABLE projects (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(100)  NOT NULL,
  type          VARCHAR(50)   NOT NULL,  -- e.g. "FULL-STACK · 2025"
  year          INTEGER       NOT NULL,
  description   TEXT          NOT NULL,
  tags          TEXT[]        NOT NULL,  -- e.g. {"C# / .NET","React Native"}
  github_url    VARCHAR(255)  NOT NULL,
  display_order SMALLINT      NOT NULL DEFAULT 0,
  is_featured   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 初始数据（对应现有 4 个项目）

| display_order | title                    | is_featured |
|---------------|--------------------------|-------------|
| 1             | Blotz Task App           | true        |
| 2             | RenoPilot                | false       |
| 3             | Global Youth SDGs Summit | false       |
| 4             | AI Health Management     | false       |

---

## API 路由

Base URL（生产）：`https://api.你的域名.com`
Base URL（开发）：`http://localhost:5000`

| 方法 | 路径                  | 描述                         | 响应                    |
|------|-----------------------|------------------------------|-------------------------|
| GET  | `/api/v1/health`      | 健康检查                     | `{ "status": "ok" }`    |
| GET  | `/api/v1/projects`    | 获取所有项目（按 display_order 排序） | `Project[]`    |

### Project 响应结构

```json
{
  "id": 1,
  "title": "Blotz Task App",
  "type": "FULL-STACK · 2025",
  "year": 2025,
  "description": "A task management app pairing a .NET API and SQL Server backend with a React Native mobile experience.",
  "tags": ["C# / .NET", "React Native", "SQL Server", "AI features"],
  "githubUrl": "https://github.com/sol-wizard/Blotz-Task-App",
  "displayOrder": 1,
  "isFeatured": true
}
```

**MVP 阶段不实现：** 写操作（POST/PATCH/DELETE）、认证、联系表单、管理后台。

---

## 部署架构

### 前端（Cloudflare Pages）

- 触发方式：推送到 `main` 分支自动部署
- 构建命令：`npm run build`
- 构建输出目录：`dist`
- 根目录：`frontend/`
- 环境变量：`VITE_API_BASE_URL=https://api.你的域名.com`

### 后端（Mac mini 自托管）

- 运行方式：`dotnet run` 或发布后 `./PersonalWebApi`
- 监听端口：`5000`（仅 localhost，不直接对外）
- 进程管理：macOS launchd plist（开机自启，崩溃自动重启）

### Cloudflare Tunnel

- Tunnel 名称：`personalweb-api`
- 路由规则：`api.你的域名.com` → `http://localhost:5000`
- 配置文件：`~/.cloudflared/config.yml`（在 Mac mini 上）
- 进程管理：macOS launchd plist（开机自启）

### launchd 服务（Mac mini 上需创建）

| 服务                                | plist 路径                                              |
|-------------------------------------|---------------------------------------------------------|
| PersonalWeb API                     | `~/Library/LaunchAgents/com.georgelee.personalweb-api.plist` |
| Cloudflare Tunnel                   | `~/Library/LaunchAgents/com.georgelee.cloudflared.plist` |

---

## 实施阶段

### 阶段 0 — Mac mini 基础设施（优先，代码无关）

- [ ] 关闭自动睡眠（系统设置 → 电源适配器）
- [ ] 安装 Homebrew（如未安装）
- [ ] `brew install postgresql@16` → 启动 → 设置开机自启
- [ ] `brew install dotnet` → 验证 `dotnet --version`
- [ ] 注册域名并将 DNS 托管到 Cloudflare
- [ ] `brew install cloudflare/cloudflare/cloudflared`
- [ ] `cloudflared tunnel login` 完成授权

### 阶段 1 — 数据库

- [ ] 创建数据库：`createdb personalweb`
- [ ] 执行 `db/schema.sql` 建表
- [ ] 执行 `db/seed.sql` 插入初始数据
- [ ] 验证：`psql personalweb -c "SELECT title FROM projects ORDER BY display_order;"`

### 阶段 2 — 后端 API

- [ ] 创建项目：`dotnet new webapi -n PersonalWebApi -o api/`
- [ ] 添加 Npgsql.EntityFrameworkCore.PostgreSQL 包
- [ ] 实现 `Project` 模型和 `AppDbContext`
- [ ] 实现 `GET /api/v1/health`
- [ ] 实现 `GET /api/v1/projects`（从 DB 读取，按 display_order 排序）
- [ ] 配置 CORS（允许 `*.pages.dev` 和 `localhost:5173`）
- [ ] 连接字符串放入环境变量，不提交到 Git
- [ ] 本地验证：`curl http://localhost:5000/api/v1/projects`

### 阶段 3 — Cloudflare Tunnel

- [ ] 创建 Tunnel：`cloudflared tunnel create personalweb-api`
- [ ] 创建 `~/.cloudflared/config.yml`，配置路由
- [ ] Cloudflare DNS 添加 CNAME 记录（`api` → Tunnel ID）
- [ ] 启动 Tunnel：`cloudflared tunnel run personalweb-api`
- [ ] 外部验证：`curl https://api.你的域名.com/api/v1/health`
- [ ] 创建 launchd plist，注册 API 和 Tunnel 开机自启
- [ ] Mac mini 重启测试：验证两个服务自动恢复

### 阶段 4 — 前端

- [ ] 创建 Vite 项目：`npm create vite@latest frontend -- --template react-ts`
- [ ] 移植 `styles.css` 设计 token（CSS 自定义属性、排版、色彩）
- [ ] 实现各 Section 组件（About/Journey/Contact 内容硬编码）
- [ ] 实现 `useProjects` hook（fetch + loading + error 状态）
- [ ] 实现 `Work` 组件（渲染项目卡片，含加载骨架和错误提示）
- [ ] 响应式验证：375px / 768px / 1280px
- [ ] 无障碍检查：键盘导航、跳过链接、aria 属性、色彩对比度
- [ ] 本地验证：`npm run dev`，前端正常请求本地 API

### 阶段 5 — 部署前端

- [ ] 推送到 GitHub（新仓库 `personal-web-v2`）
- [ ] Cloudflare Pages 连接仓库，配置构建参数
- [ ] 设置 `VITE_API_BASE_URL` 环境变量
- [ ] 触发部署，验证 `*.pages.dev` 地址可访问
- [ ] 验证前端能从 Mac mini API 拉取数据
- [ ] 测试：断开 API → 前端显示错误状态而非白屏

---

## 环境变量

### API（Mac mini，不提交 Git）

```
ConnectionStrings__DefaultConnection=Host=localhost;Database=personalweb;Username=你的用户名;Password=你的密码
ASPNETCORE_URLS=http://localhost:5000
ASPNETCORE_ENVIRONMENT=Production
```

### 前端（Cloudflare Pages 环境变量）

```
VITE_API_BASE_URL=https://api.你的域名.com
```

### 本地开发（frontend/.env.local，不提交 Git）

```
VITE_API_BASE_URL=http://localhost:5000
```

---

## 前提条件清单

在写第一行代码前，以下必须就绪：

| 条件                          | 验证方式                                      |
|-------------------------------|-----------------------------------------------|
| 域名在 Cloudflare DNS 管理    | Cloudflare Dashboard 能看到该域名             |
| Mac mini 不自动睡眠           | 放置一夜后 SSH 仍可连接                        |
| PostgreSQL 运行中             | `pg_isready` 返回 accepting connections       |
| .NET 9 SDK 安装               | `dotnet --version` 显示 9.x.x                 |
| cloudflared 已授权            | `cloudflared tunnel list` 无报错              |
| GitHub 仓库已建               | `git remote -v` 显示正确远端地址              |

---

## 暂不实现（v2 之后）

- 项目管理后台（CRUD 界面）
- 登录 / 认证
- 联系表单（邮件转发）
- 博客或文章功能
- 自定义域名绑定 Cloudflare Pages（需要域名）

---

*最后更新：2026-10-04*
