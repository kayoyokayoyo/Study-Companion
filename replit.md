# QuizNET

Application web d'entraînement aux examens pour étudiants — QCM et questions directes, organisés par cours et type d'évaluation.

## Run & Operate

- `uvicorn main:app --host 0.0.0.0 --port 8080 --reload --app-dir artifacts/api-server` — run the API (auto-managed by workflow)
- `pnpm --filter @workspace/quiznet run dev` — run the frontend (auto-managed by workflow)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- **Frontend**: React + Vite + TailwindCSS + TanStack Query (artifacts/quiznet)
- **Backend**: Python 3 + FastAPI + SQLite + SQLAlchemy (artifacts/api-server)
- **Auth**: HMAC cookie session (`quiznet_auth` cookie, signed with SESSION_SECRET)
- **API codegen**: Orval (from lib/api-spec/openapi.yaml)
- pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/api-server/main.py` — FastAPI entry point
- `artifacts/api-server/models.py` — SQLAlchemy models (Course, EvalType, Quiz, Question, Choice)
- `artifacts/api-server/routers/` — route handlers (auth, courses, eval_types, quizzes, questions, stats)
- `artifacts/api-server/auth_utils.py` — HMAC session helpers + require_admin dependency
- `artifacts/api-server/seed.py` — sample data (seeded on first startup)
- `artifacts/api-server/quiznet.db` — SQLite database (created on startup)
- `artifacts/quiznet/src/` — React frontend
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)

## Architecture decisions

- SQLite chosen for zero-config local persistence (file at artifacts/api-server/quiznet.db)
- HMAC cookie auth: server generates token = HMAC(SESSION_SECRET, "quiznet_admin_v1"); no DB session store needed
- Admin guards enforced server-side via FastAPI `Depends(require_admin)` on all mutating endpoints
- Seed data auto-applied on first startup (checks if courses table is empty before seeding)
- Two study modes: Training (interactive, immediate feedback) and Reading (all Q&A visible at once)

## Product

- **Dashboard**: stats overview (courses, quizzes, questions, eval types), course cards
- **Mode Entraînement**: questions one by one, MCQ or direct answer, immediate correct/wrong feedback, final score
- **Mode Lecture**: all questions displayed with answers visible for study reference
- **Admin** (password protected): manage courses, eval types, quizzes, questions (add/edit/delete + JSON import)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- SQLite file is at `artifacts/api-server/quiznet.db` — delete it to reset data (seed runs on next startup)
- Admin password defaults to `admin123` — set `ADMIN_PASSWORD` env var in production
- SESSION_SECRET must be set in production for secure session tokens
- After OpenAPI spec changes, run codegen before building frontend

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
