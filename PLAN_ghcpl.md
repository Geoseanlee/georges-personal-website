# Personal Website Full-Stack Implementation Plan

> **Status:** The repository's working MVP now uses the existing FastAPI backend with PostgreSQL 16 running locally through Homebrew. This plan records an earlier .NET/Mac mini/Tunnel target and is not the runbook for the current local setup; follow `README.md` for the implemented stack.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing personal website into a responsive React frontend backed by a small read-only ASP.NET Core API and PostgreSQL database hosted on the always-on Mac mini.

**Architecture:** Keep the project as one repository with separate `frontend/` and `backend/` applications. Deploy the static React build to Cloudflare Pages; run PostgreSQL and the ASP.NET Core API on the Mac mini, with Cloudflare Tunnel routing a public API hostname to the API's loopback listener. The MVP serves the existing portfolio content and reads project cards from PostgreSQL; it has no accounts, admin UI, write API, or contact form.

**Tech Stack:** React + TypeScript + Vite; ASP.NET Core Minimal API on .NET 10 LTS; PostgreSQL 16; EF Core with Npgsql; Vitest + React Testing Library; Playwright; Cloudflare Pages; Cloudflare Tunnel (`cloudflared`); macOS `launchd`.

**Spec:** User requirements in this conversation: React personal-introduction site; responsive for mobile and tablet; a complete but deliberately small frontend/backend project; free-first hosting; Mac mini self-hosting through Cloudflare Tunnel. Existing content and project conventions are in `index.html`, `styles.css`, `script.js`, `CONTEXT.md`, and the earlier architecture draft in `PLAN_kiro.md`.

## Global Constraints

- Preserve the current English personal-brand content, warm paper/green visual identity, existing section anchors, external profile links, and accessibility behavior described in `CONTEXT.md` and `.github/copilot-instructions.md`.
- The MVP has one database table and read-only public API routes only; do not add authentication, CRUD, an admin interface, GraphQL, a contact form, or a second database.
- The API and PostgreSQL must listen only on loopback/private interfaces; publish only the API through Cloudflare Tunnel and never expose the PostgreSQL port.
- Use .NET 10 LTS and PostgreSQL 16 for the initial implementation. Keep secrets and local environment files out of version control.
- Keep the production React site usable when the API is unavailable: show a clear project-list error state without blanking the rest of the page.
- A stable production Tunnel hostname requires a domain managed in Cloudflare; domain registration may cost money. Cloudflare Quick Tunnels provide temporary `trycloudflare.com` URLs for development only and are not a stable production substitute.
- The current directory is not a Git repository. Before connecting Cloudflare Pages, confirm the GitHub repository destination, initialize or connect Git, and push the project; do not assume a remote exists.

## Review Focus

- PostgreSQL is unavailable: health must report failure and the project section must show an error, not return a success-shaped empty list. Pin this in API integration and frontend error-state tests.
- The database contains no projects: `GET /api/v1/projects` returns `200` with `[]`, and the page still renders its other sections. Pin this in the API integration test and `WorkSection` test.
- A project has an invalid required field, year, or URL: database constraints must reject malformed data. Pin this in migration/seed verification.
- The API base URL is absent, unreachable, or returns invalid JSON: the frontend must present a useful nonfatal error and keep navigation/contact content usable. Pin this in `useProjects` tests.
- At phone, tablet, and desktop widths, layout must not overflow horizontally; the mobile navigation must remain keyboard-operable. Pin this in Playwright at 375px, 768px, and 1280px, including Escape and link-close behavior.

---

## Target Project Structure

```text
PersonalWeb/
├── .github/
│   └── copilot-instructions.md       # Update for the full-stack structure and actual commands
├── backend/
│   ├── PersonalWeb.Api/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── DesignTimeDbContextFactory.cs
│   │   │   └── Migrations/           # EF Core migration source of database schema
│   │   ├── Endpoints/
│   │   │   ├── HealthEndpoints.cs
│   │   │   └── ProjectEndpoints.cs
│   │   ├── Models/Project.cs
│   │   ├── Dtos/ProjectResponse.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── PersonalWeb.Api.csproj
│   └── PersonalWeb.Api.Tests/
│       ├── ApiFactory.cs
│       ├── HealthEndpointsTests.cs
│       ├── ProjectEndpointsTests.cs
│       └── PersonalWeb.Api.Tests.csproj
├── db/
│   └── seed.sql                      # Idempotent public portfolio project seed data
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── JourneySection.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── SiteFooter.tsx
│   │   │   ├── SiteHeader.tsx
│   │   │   └── WorkSection.tsx
│   │   ├── data/projectsApi.ts
│   │   ├── hooks/useProjects.ts
│   │   ├── types/project.ts
│   │   ├── test/
│   │   │   ├── setup.ts
│   │   │   └── fixtures/projects.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles/global.css
│   ├── e2e/responsive.spec.ts
│   ├── index.html
│   ├── playwright.config.ts
│   ├── vite.config.ts
│   └── package.json
├── .env.example                      # Names and example values only; no secrets
├── .gitignore
├── README.md                         # Local development and deployment guide
├── CONTEXT.md
└── PLAN_ghcpl.md
```

The existing root `index.html`, `styles.css`, and `script.js` remain untouched until the React page passes content and responsive checks. Remove those three legacy files only during the migration cutover; move CSS into `frontend/src/styles/global.css` and implement the existing menu behavior in `SiteHeader.tsx`.

## Data Schema

Use EF Core migrations as the authoritative schema history. `db/seed.sql` inserts the existing four public projects and can be rerun safely using `ON CONFLICT (slug) DO UPDATE`.

```sql
CREATE TABLE projects (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          varchar(80)  NOT NULL UNIQUE,
  title         varchar(120) NOT NULL,
  project_type  varchar(60)  NOT NULL,
  year          smallint     NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  description   text         NOT NULL,
  tags          text[]       NOT NULL DEFAULT '{}',
  github_url    text         NOT NULL CHECK (github_url LIKE 'https://github.com/%'),
  display_order smallint     NOT NULL DEFAULT 0,
  is_featured   boolean      NOT NULL DEFAULT false,
  created_at    timestamptz  NOT NULL DEFAULT now()
);
```

Seed rows, ordered by `display_order`:

| Slug | Title | Year | Featured |
|---|---|---:|---|
| `blotz-task-app` | Blotz Task App | 2025 | true |
| `renopilot` | RenoPilot | 2025 | false |
| `global-youth-sdgs-summit` | Global Youth SDGs Summit | 2025 | false |
| `ai-health-management` | AI Health Management | 2024 | false |

## API Contract

Production base URL: `https://api.<owned-domain>` after a Cloudflare-managed domain is configured. Local base URL: `http://localhost:5050`.

| Method | Route | Success | Failure |
|---|---|---|---|
| `GET` | `/api/v1/health` | `200 { "status": "ok" }` when API and database are available | `503 { "status": "unavailable" }`; do not include connection details |
| `GET` | `/api/v1/projects` | `200 ProjectResponse[]`, sorted ascending by `displayOrder`; an empty table returns `[]` | `503` Problem Details if the database cannot be queried |

`ProjectResponse` JSON uses camelCase: `id`, `slug`, `title`, `projectType`, `year`, `description`, `tags`, `githubUrl`, `displayOrder`, `isFeatured`. Do not return internal database or configuration details. Allow CORS only for the configured production Pages origin and `http://localhost:5173`; keep the allowed-origin list in API configuration/environment, not as `AllowAnyOrigin`.

## Runtime Configuration

| Variable | Used by | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Vite build | `http://localhost:5050` locally; `https://api.<owned-domain>` in production |
| `ConnectionStrings__DefaultConnection` | ASP.NET Core API | `Host=127.0.0.1;Port=5432;Database=personalweb;Username=personalweb_app;Password=<local-secret>` |
| `ASPNETCORE_URLS` | ASP.NET Core API | `http://127.0.0.1:5050` |
| `AllowedOrigins__0` | ASP.NET Core API CORS | `http://localhost:5173` |
| `AllowedOrigins__1` | ASP.NET Core API CORS | `https://<pages-project>.pages.dev` |

Store only variable names and placeholders in `.env.example`. On the Mac mini, load the actual API secret from a permission-restricted environment file using a local launcher script that is not committed to Git.

## Tasks

### Task 1: Scaffold the React app and repository tooling

**Files:**
- Create: `frontend/` Vite React + TypeScript app and its `package.json`, `vite.config.ts`, and `src/main.tsx`
- Create: `frontend/src/test/setup.ts`
- Create: root `.gitignore`, `.env.example`, and `README.md`
- Modify: `.github/copilot-instructions.md`

**Interfaces:**
- Produces: `frontend/` as the Cloudflare Pages project root; scripts `npm run dev`, `npm run build`, `npm run test`, and `npm run test:e2e`.

- [ ] **Step 1: Create the Vite React + TypeScript app and install Vitest, React Testing Library, and Playwright test dependencies.**
- [ ] **Step 2: Add the minimal test harness and a smoke test asserting the app renders its main landmark and skip link.**
- [ ] **Step 3: Run the smoke test and `npm run build`; both must pass from `frontend/`.**
- [ ] **Step 4: Add `.gitignore` entries for `node_modules`, `dist`, Playwright output, `.env*` except `.env.example`, .NET `bin/` and `obj/`, and local logs; document the approved env variable names only.**
- [ ] **Step 5: Update `.github/copilot-instructions.md` and `README.md` to describe the monorepo structure, commands, local preview, and secret-handling locations.**

### Task 2: Rebuild the existing one-page site as responsive React sections

**Files:**
- Create: `frontend/src/App.tsx`, `frontend/src/components/{SiteHeader,HeroSection,AboutSection,WorkSection,ProjectCard,JourneySection,ContactSection,SiteFooter}.tsx`
- Create: `frontend/src/types/project.ts`, `frontend/src/test/fixtures/projects.ts`, and `frontend/src/styles/global.css`
- Modify: `frontend/index.html`
- Test: component tests under `frontend/src/components/`
- Remove after parity checks: root `index.html`, `styles.css`, and `script.js`

**Interfaces:**
- Produces: `Project` type with `id`, `slug`, `title`, `projectType`, `year`, `description`, `tags: string[]`, `githubUrl`, `displayOrder`, and `isFeatured`; `WorkSection` accepts `projects: Project[]`, `loading: boolean`, and `error: string | null`.

- [ ] **Step 1: Add component tests for the current section links, rendering a project card from a fixture, the empty state (section heading remains and no cards render), and a nonfatal API error.**
- [ ] **Step 2: Run the selected component tests and confirm they fail because the React sections do not exist yet.**
- [ ] **Step 3: Implement the sections using the existing English copy and link targets from root `index.html`; preserve IDs `home`, `about`, `work`, `journey`, and `contact`, and open external links with `target="_blank"` plus `rel="noopener noreferrer"`.**
- [ ] **Step 4: Port the design tokens and responsive rules from root `styles.css` into `global.css`; retain warm paper/green styling, visible focus, reduced-motion support, and usable 375px/768px layouts.**
- [ ] **Step 5: Implement mobile menu open/close state in `SiteHeader.tsx`; retain `aria-expanded`, close on nav-link activation, and close on Escape while returning focus to the menu button.**
- [ ] **Step 6: Run component tests and `npm run build`; confirm all tests pass.**
- [ ] **Step 7: Compare the React page against the existing static site at 375px, 768px, and 1280px; remove the root static files only after content, anchors, keyboard behavior, and layouts match.**

### Task 3: Add PostgreSQL project schema and seed data

**Files:**
- Create: `backend/PersonalWeb.Api/PersonalWeb.Api.csproj`
- Create: `backend/PersonalWeb.Api/Models/Project.cs`
- Create: `backend/PersonalWeb.Api/Data/AppDbContext.cs`, `DesignTimeDbContextFactory.cs`, and initial EF Core migration
- Create: `db/seed.sql`

**Interfaces:**
- Produces: `Project` EF entity with fields matching the schema above and `AppDbContext.Projects: DbSet<Project>`.

- [ ] **Step 1: Add EF Core/Npgsql dependencies and configure the model constraints for unique slug, required fields, year range 2000–2100, GitHub HTTPS URL, tags array, and stable ordering.**
- [ ] **Step 2: Add `DesignTimeDbContextFactory` so EF tooling can construct the context without starting the API or opening a DB connection; generate the initial migration and verify the specified columns and constraints.**
- [ ] **Step 3: Write idempotent seed SQL for the four listed project rows with their current titles, descriptions, GitHub URLs, tags, years, display order, and feature flag.**
- [ ] **Step 4: Apply the migration and seed script to local PostgreSQL 16; verify four rows and expected ordering with `psql`.**
- [ ] **Step 5: Re-run the seed script and verify it leaves exactly four rows, then attempt an invalid year and non-GitHub URL and verify PostgreSQL rejects both.**

### Task 4: Implement and test the read-only ASP.NET Core API

**Files:**
- Create: `backend/PersonalWeb.Api/Dtos/ProjectResponse.cs`
- Create: `backend/PersonalWeb.Api/Endpoints/HealthEndpoints.cs`, `ProjectEndpoints.cs`, and `Program.cs`
- Create: `backend/PersonalWeb.Api.Tests/PersonalWeb.Api.Tests.csproj`, `ApiFactory.cs`, `HealthEndpointsTests.cs`, and `ProjectEndpointsTests.cs`
- Modify: `backend/PersonalWeb.Api/PersonalWeb.Api.csproj`, root `.env.example`

**Interfaces:**
- Consumes: Task 3 `AppDbContext` and `Project`.
- Produces: `GET /api/v1/health` and `GET /api/v1/projects`; `ProjectResponse` with camelCase JSON fields defined in API Contract.

- [ ] **Step 1: Add integration tests for ordered project response and camelCase fields, empty database response `[]`, healthy response, and database-unavailable `503` responses.**
- [ ] **Step 2: Run the tests against a dedicated local test database and confirm the route tests fail before endpoint implementation.**
- [ ] **Step 3: Implement `GET /api/v1/projects` as a read-only EF query sorted by `DisplayOrder`, projecting only to `ProjectResponse`; return `503` Problem Details if the database query fails.**
- [ ] **Step 4: Implement `GET /api/v1/health` to verify database connectivity and return only `{ "status": "ok" }` or `{ "status": "unavailable" }` with the matching `200`/`503` status.**
- [ ] **Step 5: Configure exact CORS origins from configuration and environment variables; bind local API to `127.0.0.1:5050`; keep the PostgreSQL port private and define no write endpoints.**
- [ ] **Step 6: Run `dotnet test backend/PersonalWeb.Api.Tests/PersonalWeb.Api.Tests.csproj` and `dotnet build backend/PersonalWeb.Api/PersonalWeb.Api.csproj`; confirm all pass.**

### Task 5: Connect the React projects section to the API

**Files:**
- Create: `frontend/src/data/projectsApi.ts`, `frontend/src/hooks/useProjects.ts`, and `frontend/src/data/projectsApi.test.ts`
- Modify: `frontend/src/App.tsx`, `frontend/src/components/WorkSection.tsx`, related component tests, `frontend/.env.example`

**Interfaces:**
- Consumes: Task 2 `Project`, `WorkSection` props; Task 4 API JSON contract.
- Produces: `fetchProjects(baseUrl: string, signal?: AbortSignal): Promise<Project[]>`; `useProjects(): { projects: Project[]; loading: boolean; error: string | null }`, reading `VITE_API_BASE_URL`.

- [ ] **Step 1: Write tests for successful project parsing, empty array, HTTP error, invalid JSON/shape, missing `VITE_API_BASE_URL`, and request cancellation.**
- [ ] **Step 2: Run those tests and confirm they fail before the API client and hook exist.**
- [ ] **Step 3: Implement the typed API client and hook; do not silently convert network, HTTP, or JSON errors to an empty project list.**
- [ ] **Step 4: Connect `App` to the hook and pass its explicit loading, error, and project values to `WorkSection`; keep all other sections rendered during an API error.**
- [ ] **Step 5: Run all frontend unit/component tests and `npm run build`; verify pass.**

### Task 6: Verify browser behavior and responsive layout

**Files:**
- Create: `frontend/e2e/responsive.spec.ts`, `frontend/playwright.config.ts`
- Modify: `frontend/package.json` and responsive styles/components only if tests expose a defect

**Interfaces:**
- Consumes: completed React page and API hook from Tasks 2 and 5.
- Produces: `npm run test:e2e` that starts Vite and tests the rendered page at 375px, 768px, and 1280px.

- [ ] **Step 1: Add Playwright checks for no horizontal overflow at each viewport, working section anchors, external-link safety attributes, mobile menu Escape-close/focus return and link-close/`aria-expanded` reset, and a mocked API failure that leaves contact/navigation visible.**
- [ ] **Step 2: Run `npm run test:e2e`; fix only defects revealed by the checks.**
- [ ] **Step 3: Run `npm run test`, `npm run test:e2e`, and `npm run build` together; confirm all pass.**

### Task 7: Prepare the Mac mini services and Cloudflare Tunnel

**Files:**
- Create on the Mac mini (not committed): `~/.config/personalweb/api.env`, API and `cloudflared` LaunchAgent plist files, and Cloudflare Tunnel configuration
- Modify: `README.md` with setup, update, backup, and recovery instructions
- Keep secrets outside the repository and database backups outside the PostgreSQL data directory.

**Interfaces:**
- Consumes: Task 4 API on `http://127.0.0.1:5050`; Task 3 PostgreSQL schema and seed.
- Produces: API and database available after Mac mini reboot; external hostname routes only to the local API; Postgres remains inaccessible from the public internet.

- [ ] **Step 1: Install and configure PostgreSQL 16 and the .NET 10 runtime/SDK on the Mac mini; disable system sleep while connected to power and verify `pg_isready`.**
- [ ] **Step 2: Create a dedicated local database role and `personalweb` database; apply the EF migration and seed rows; verify the role is not a PostgreSQL superuser.**
- [ ] **Step 3: Publish the API in Release mode and run it on `127.0.0.1:5050` with its connection string supplied by the permission-restricted environment file through a local, non-repository launcher script.**
- [ ] **Step 4: Test local API health and project routes with `curl`; stop PostgreSQL temporarily and verify health returns `503`, then restore service.**
- [ ] **Step 5: For development without a purchased domain, run `cloudflared tunnel --url http://127.0.0.1:5050` and use its temporary hostname only for tests; note that it changes when restarted and is not production-stable.**
- [ ] **Step 6: For stable public deployment, add an owned domain to Cloudflare, create a remotely managed Tunnel, route `api.<domain>` to `http://127.0.0.1:5050`, and do not add a Cloudflare Access login gate to the public read-only API.**
- [ ] **Step 7: Create LaunchAgents for the API and `cloudflared` with restart-on-failure; create and test a PostgreSQL backup/restore procedure; reboot the Mac mini and verify the API is reachable again.**

### Task 8: Deploy the React site to Cloudflare Pages and validate production

**Files:**
- Modify: `README.md`, `.github/copilot-instructions.md`, `frontend/.env.example`
- Cloud configuration: Pages project settings; no credentials or tunnel tokens committed to the repo.

**Interfaces:**
- Consumes: Task 6 tested frontend, Task 7 reachable API, chosen public domain or temporary development URL.
- Produces: deployed site on the Cloudflare Pages `*.pages.dev` hostname, with its API base URL set to the reachable API origin.

- [ ] **Step 1: Confirm GitHub repository destination and connect/push this project; the current working directory has no Git repository or remote.**
- [ ] **Step 2: Create the Cloudflare Pages project from the repository using `frontend/` as the root directory, `npm run build` as the build command, and `dist` as the output directory.**
- [ ] **Step 3: Set `VITE_API_BASE_URL` for the production build to the stable `https://api.<domain>` Tunnel hostname; use a Quick Tunnel URL only for a short-lived development deployment.**
- [ ] **Step 4: Set API CORS to the exact production Pages origin and local development origin; redeploy the API after configuration changes.**
- [ ] **Step 5: Verify the deployed site, API health, four ordered project cards, external links, responsive behavior, and the project-list error state by temporarily stopping the API.**
- [ ] **Step 6: Run the local frontend and backend verification commands one final time; document the production URLs, domain dependency, backup steps, and expected downtime when the Mac mini or home internet is unavailable.**

## Local Verification Commands

```bash
# Frontend
cd frontend
npm ci
npm run test
npm run test:e2e
npm run build

# Backend (from repository root)
dotnet test backend/PersonalWeb.Api.Tests/PersonalWeb.Api.Tests.csproj
dotnet build backend/PersonalWeb.Api/PersonalWeb.Api.csproj

# Local runtime checks
curl -i http://127.0.0.1:5050/api/v1/health
curl -i http://127.0.0.1:5050/api/v1/projects
```

## Deployment and Cost Gate

- Cloudflare Pages static hosting and Cloudflare Tunnel service are planned on their free offerings; usage and policy limits can change and must be rechecked at deployment.
- A `pages.dev` frontend hostname does not require buying a domain.
- A stable public Tunnel hostname requires a domain managed by Cloudflare, and registering/renewing that domain is not generally free.
- Cloudflare Quick Tunnels avoid the domain requirement only for temporary development; the hostname rotates and Cloudflare documents them as testing/development only.
- If the project must stay at exactly $0 with a stable API URL, pause the Mac mini production-Tunnel deployment and choose a different architecture before implementation; do not imply Quick Tunnel is a production substitute.
- Self-hosting avoids service sleep but does not provide an uptime guarantee: power, internet, Mac mini restarts, and maintenance can interrupt API availability.

## References

- Existing page and content: `index.html`, `styles.css`, `script.js`, `CONTEXT.md`
- Prior architecture draft: `PLAN_kiro.md`
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)
- [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)
- [Cloudflare Pages React deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core)
