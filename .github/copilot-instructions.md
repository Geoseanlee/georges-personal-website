# Copilot instructions for PersonalWeb

## Project overview

This is a single-page personal portfolio for George Li. The frontend is React + TypeScript + Vite; the API is FastAPI; project-card data is stored in PostgreSQL 16. In the local MVP, all three run on the developer's Mac; PostgreSQL is installed as a native Homebrew service.

## Architecture and boundaries

- `frontend/src/components/` contains the page sections and project card; `frontend/src/hooks/useProjects.ts` retrieves public projects; `frontend/src/data/projectsApi.ts` owns the API request.
- `backend/app/` contains FastAPI configuration, SQLAlchemy models/database setup, Pydantic response schemas, and the health/projects routes. `backend/alembic/` owns schema migrations; `db/seed.sql` loads the four public portfolio records.
- The public API is read-only: `GET /api/v1/health` and `GET /api/v1/projects`. Keep the bio, journey, and contact content usable if the API is unavailable.
- The database URL belongs in ignored `backend/.env`; never expose it through a `VITE_*` variable or browser code. `backend/.env.example` documents the local connection URL.
- Keep the API bound to loopback for local development. Do not expose PostgreSQL or add public write endpoints, login, admin UI, GraphQL, or a contact form unless explicitly requested.

## Commands

Run frontend commands from `frontend/`:

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run test:e2e
```

Run backend commands from `backend/` with `.venv` active:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt -r requirements-dev.txt
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 5050
python -m pytest
```

See `README.md` for Homebrew PostgreSQL setup, schema seeding, two-terminal startup, and troubleshooting.

## Project-specific conventions

- Preserve the one-page content arc and section anchors: `home`, `about`, `work`, `journey`, and `contact`.
- Retain the established dark-purple visual direction, Manrope typography, responsive breakpoints, focus states, reduced-motion support, and WCAG AA contrast requirements.
- Social and GitHub links are external; use `target="_blank"` with `rel="noopener noreferrer"`.
- Keep the API response in camelCase to match the frontend `Project` type; order project records by `display_order`.
- Empty project data is a successful empty list; connection/API errors must remain distinct and must not be silently treated as empty data.
- Keep frontend and backend dependencies in their respective manifests. Avoid adding frameworks or services beyond the existing MVP architecture.
