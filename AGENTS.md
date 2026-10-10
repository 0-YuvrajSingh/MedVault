# AGENTS.md — MedVault

MedVault is a role-based medical-record management system (Admin / Doctor / Patient).
V1 stack (verified in-repo): backend Java 21 + Spring Boot 3.2.5 (`backend/pom.xml`),
PostgreSQL 15 + Flyway 10.10.0 (`backend/src/main/resources/db/migration/V1–V16`),
frontend React 18 + TypeScript + Vite + Tailwind + TanStack React Query (`frontend/package.json`).

## Repository layout

- `backend/` — Spring Boot app, `src/main/java/com/medvault` (controllers, services,
  entities, security), `src/main/resources` (application yml, `db/migration`),
  `src/test` (MockMvc + H2). Backend-only instructions stay here.
- `frontend/` — Vite + React app under `frontend/src` (`api`, `pages`, `components`,
  `routes`, `context`). Frontend manifests and tests stay here.
- `docs/` — planning and audit evidence: `PLAN.md`, `SCOPE.md`, `AUDIT.md`,
  `WALKTHROUGH.md`, `DECISIONS.md`, `BASELINE.md`, `api/medvault.postman_collection.json`.
- Root — `README.md`, `docker-compose.yml`, `.env.example`, `.github/workflows/ci.yml`,
  `LICENSE`. Keep shared tooling, CI, Docker, and genuinely root-level files at root.

## Commands (verified against manifests; do not run migrations to document)

- Backend tests (H2, Flyway disabled): `cd backend && ./mvnw test`
  (Windows: `mvnw.cmd test`). CI runs `cd backend && mvn -B verify` (`.github/workflows/ci.yml`).
- Backend local run (H2, no Postgres): `cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=local`
- Backend with Postgres: `cd backend && ./mvnw spring-boot:run`
- Frontend: `cd frontend && npm ci`, dev `npm run dev`, build `npm run build`
  (`tsc --noEmit && vite build`), lint `npm run lint`, preview `npm run preview`.
- Docker: `cp .env.example .env` then `docker compose up --build -d`.

## Conventions

- Code is the source of truth. Never assert behavior, files, tests, or status codes
  not verified in source. Mark unverified items `UNVERIFIED` / `PROPOSED`.
- Every test cited in `docs/` must match an actual `class#method` in `backend/src/test`.
- Keep `docs/` synchronized with implementation after each change.

## Migrations and seeds

- Flyway SQL only, sequential `V__` files under `backend/src/main/resources/db/migration`.
- `V6__seed_users.sql` is intentionally empty of user seeds; dev credentials come from
  `DatabaseSeeder` (`@Profile({"local","dev"})`, active only when `users` is empty).
- Production starts empty: no default users, no default `JWT_SECRET` (startup fails without it).
- Never run a migration during planning/bootstrap to populate docs. See `docs/PLAN.md`
  destructive-migration gate before any convert/drop/narrow migration.

## Security

- Stateless Bearer JWT (`JwtAuthenticationFilter` + `JwtUtil`, 30 min default via
  `JWT_EXPIRATION`). Every request re-checks `users.is_active` from DB.
- `SecurityConfig`: `/api/auth/**`, `/api/health`, `/error` public; everything else
  authenticated; method-level `@PreAuthorize` per controller. Uniform 401
  (`Invalid email or password`) for unknown email / wrong password / inactive account.
- IDOR/ownership enforced in services (`DoctorService.verifyAssignment`,
  `PatientService.getRecord`, `ReviewService`, `NotificationService`) mapping to 403
  via `AccessDeniedException`; missing entities map to 404 via `ResourceNotFoundException`.
- Never commit secrets, tokens, or personal data. `JWT_SECRET` (>=32 chars) via env only.

## Phase gate (binding)

> No implementation phase, application behavior change, or database migration may start
> without explicit authorization from the user. Planning and documentation work do not
> authorize phase execution.

Every phase in `docs/PLAN.md` needs prerequisites, scope, acceptance criteria,
verification commands, and a completion gate. Stop after bootstrap and wait for `GO`.

## Final reporting (required)

Report: changed files, commands run (read-only vs artifact-generating) and results,
unresolved issues, and deviations from this file.
