# PersonalWeb

George Li's responsive one-page personal website. The React frontend and FastAPI API run locally, with project data stored in a local PostgreSQL 16 database. The frontend also includes sample project data for a quick UI-only preview.

The production site is self-hosted on a Mac mini behind a named Cloudflare Tunnel. See [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md) for service management, database migrations, and safe production updates.

## Requirements

- macOS
- Node.js 22.12 or newer
- Python 3.11 or newer
- Homebrew (for local PostgreSQL)

Docker is optional. The standard local setup uses PostgreSQL as a native macOS Homebrew service; an alternative Docker Compose setup for the API and a separate development database is below.

## Quick preview: frontend only

This starts the site without the API or database; projects come from `frontend/src/test/fixtures/projects.ts`.

```bash
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. Stop Vite with `Ctrl+C`.

## First-time setup: local PostgreSQL

Install PostgreSQL 16 and start it as a service for your macOS user:

```bash
brew install postgresql@16
brew services start postgresql@16
pg_isready -h 127.0.0.1 -p 5432
```

`pg_isready` should report that PostgreSQL is accepting connections. The service starts automatically when you log in. Start it again later with `brew services start postgresql@16`; stop it with `brew services stop postgresql@16`.

Create the application's local role and database (run once):

```bash
psql -d postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'personalweb_app') THEN
    CREATE ROLE personalweb_app LOGIN;
  END IF;
END $$;
SQL

if ! psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'personalweb'" | grep -q 1; then
  createdb -O personalweb_app personalweb
fi
psql -d postgres -v ON_ERROR_STOP=1 -c 'ALTER DATABASE personalweb OWNER TO personalweb_app'
```

Homebrew's initial local PostgreSQL setup may use trust authentication. The production Mac mini uses SCRAM password authentication for TCP connections; its application password is stored only in the ignored `backend/.env`. PostgreSQL listens on loopback; do not expose port 5432 to the internet.

## First-time setup: Python API and database schema

From the repository root:

```bash
cp backend/.env.example backend/.env
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
psql -h 127.0.0.1 -U personalweb_app -d personalweb -v ON_ERROR_STOP=1 -f ../db/seed.sql
```

The migration creates the `projects` table; `db/seed.sql` inserts the four portfolio projects. It is safe to run the seed again. `backend/.env` is local-only and ignored by Git. Any prior Supabase connection file is preserved as the ignored `backend/.env.supabase`; it is not needed for local development.

## Start the full local stack

Use two terminal windows from the repository root.

**Terminal 1 — FastAPI:**

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 5052
```

API endpoints:

- Health: <http://127.0.0.1:5052/api/v1/health>
- Projects: <http://127.0.0.1:5052/api/v1/projects>

The health endpoint should return `{"status":"ok"}`; the projects endpoint should return four records. Port `5052` avoids the production Compose API (`5050`) and development Compose API (`5051`).

**Terminal 2 — React:**

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:5173>. `.env.local` points React to the local API on port `5052`. Restart Vite after changing frontend environment variables. To preview only the UI, omit `.env.local` or remove `VITE_API_BASE_URL`; the bundled sample data will be used.

## Later starts

1. Start PostgreSQL if it is not running: `brew services start postgresql@16`.
2. In terminal 1, run the FastAPI command above (port `5052`).
3. In terminal 2, run the Vite command above.
4. Stop each foreground server with `Ctrl+C`. Stop PostgreSQL only if desired: `brew services stop postgresql@16`.

The backend Python environment stays in `backend/.venv`; npm dependencies stay in `frontend/node_modules`.

## Optional: Docker Compose for local API development

The development Compose overlay runs the API and a separate PostgreSQL database. It does not touch the production database or Mac mini services. Docker Desktop must be running. The host ports `5433` and `5051` avoid the native PostgreSQL (`5432`) and API (`5050`) ports.

From the repository root, create a private Compose environment file if one does not already exist. Use a local-only password consistently in the PostgreSQL and database URL values:

```bash
cp -n .env.compose.example .env.compose
```

Start the database, apply schema migrations, and seed the development database:

```bash
docker compose -p personalweb-dev --env-file .env.compose -f compose.yaml -f compose.dev.yaml up -d db
docker compose -p personalweb-dev --env-file .env.compose -f compose.yaml -f compose.dev.yaml run --rm api alembic upgrade head
docker compose -p personalweb-dev --env-file .env.compose -f compose.yaml -f compose.dev.yaml exec -T db psql -U personalweb_app -d personalweb < db/seed.sql
docker compose -p personalweb-dev --env-file .env.compose -f compose.yaml -f compose.dev.yaml up --build -d api
```

The API is available at <http://127.0.0.1:5051/api/v1/health>. To connect the local Vite frontend, set `VITE_API_BASE_URL=http://127.0.0.1:5051` in `frontend/.env.local` and restart Vite. The API source is mounted for reload-on-change development. This port differs from the native local API (`5052`) and production Compose API (`5050`).

Use the same `-p`, `--env-file`, and `-f` options with `logs -f api db` to inspect logs or `down` to stop the stack. Its named database volume survives `down`; do not add `-v` unless you intend to delete the development database. The development overlay is not the production deployment. Production service management and database backup/restore are documented in [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md).

## Tests and production build

Frontend, from `frontend/`:

```bash
npm test
npm run lint
npm run build
npx playwright install chromium  # one-time browser install for E2E
npm run test:e2e
```

Backend, from `backend/` with the virtual environment active:

```bash
python -m pytest
```

## Troubleshooting

| Symptom | What to check |
|---|---|
| `npm` reports a missing `package.json` | Run frontend commands from `frontend/`, not the repository root or `backend/`. |
| `brew` command not found | Install Homebrew first using its official instructions at <https://brew.sh/>. |
| `pg_isready` reports no response | Run `brew services start postgresql@16`, then check `brew services list` and port 5432. |
| `ValidationError: database_url Field required` | Copy `backend/.env.example` to `backend/.env`; run Uvicorn from `backend/`. |
| API health returns `503` | Confirm PostgreSQL is running and the `personalweb` database exists; verify the URL in the ignored `backend/.env`. |
| The projects page reports it cannot load data | Confirm API health and `/api/v1/projects` work, and that `frontend/.env.local` points to the selected local API (`http://127.0.0.1:5052` for native Uvicorn or `http://127.0.0.1:5051` for Compose development). |
| Browser console reports CORS | Set `ALLOWED_ORIGINS=http://localhost:5173` in `backend/.env` and restart Uvicorn. |
| Alembic cannot find the driver | Activate `backend/.venv` and install `requirements.txt` plus `requirements-dev.txt`. |

## Production deployment

See [SERVER_DEPLOYMENT.md](SERVER_DEPLOYMENT.md) for the Mac mini LaunchAgents, Cloudflare Tunnel, HTTPS domains, deployment/update commands, and troubleshooting.

## Project boundaries

- The API only reads projects and checks database health; it has no login, admin UI, or write routes.
- The database URL stays on the backend and is never exposed to the browser.
- The bio, journey, and contact sections remain available if PostgreSQL or the API is unavailable.
