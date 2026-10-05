# PersonalWeb

George Li's responsive one-page personal website. The React frontend and FastAPI API run locally, with project data stored in a local PostgreSQL 16 database. The frontend also includes sample project data for a quick UI-only preview.

## Requirements

- macOS
- Node.js 22.12 or newer
- Python 3.11 or newer
- Homebrew (for local PostgreSQL)

Docker is not required. PostgreSQL runs as a native macOS Homebrew service.

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

This config uses the local PostgreSQL trust authentication created by Homebrew on this Mac. PostgreSQL listens on the local machine; do not expose port 5432 to the internet.

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
uvicorn app.main:app --reload --host 127.0.0.1 --port 5050
```

API endpoints:

- Health: <http://127.0.0.1:5050/api/v1/health>
- Projects: <http://127.0.0.1:5050/api/v1/projects>
- Interactive docs: <http://127.0.0.1:5050/docs>

The health endpoint should return `{"status":"ok"}`; the projects endpoint should return four records.

**Terminal 2 — React:**

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

Open <http://localhost:5173>. `.env.local` tells React to fetch projects from the local API. Restart Vite after changing frontend environment variables. To preview only the UI, omit `.env.local` or remove `VITE_API_BASE_URL`; the bundled sample data will be used.

## Later starts

1. Start PostgreSQL if it is not running: `brew services start postgresql@16`.
2. In terminal 1, run the FastAPI command above.
3. In terminal 2, run the Vite command above.
4. Stop each foreground server with `Ctrl+C`. Stop PostgreSQL only if desired: `brew services stop postgresql@16`.

The backend Python environment stays in `backend/.venv`; npm dependencies stay in `frontend/node_modules`.

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
| The projects page reports it cannot load data | Confirm API health and `/api/v1/projects` work, and that `frontend/.env.local` points to `http://127.0.0.1:5050`. |
| Browser console reports CORS | Set `ALLOWED_ORIGINS=http://localhost:5173` in `backend/.env` and restart Uvicorn. |
| Alembic cannot find the driver | Activate `backend/.venv` and install `requirements.txt` plus `requirements-dev.txt`. |

## Project boundaries

- The API only reads projects and checks database health; it has no login, admin UI, or write routes.
- The database URL stays on the backend and is never exposed to the browser.
- The bio, journey, and contact sections remain available if PostgreSQL or the API is unavailable.
- Public hosting and Cloudflare Tunnel are follow-up deployment work; this guide covers the local MVP.
