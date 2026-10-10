# BASELINE.md — HISTORICAL V1 baseline (not a plan for future work)

This file is historical only. Future planned behavior lives in `PLAN.md` / `DECISIONS.md`.

- Date: 2026-10-09 (bootstrap). Commit: `157a7f1` —
  `157a7f19bca498b7ba8eec739159874b76328041` on `main` (clean except untracked
  `MedVault_Scope_v1.docx`).
- Stack (verified in manifests): Java 21, Spring Boot 3.2.5, Flyway 10.10.0,
  PostgreSQL 15, JJWT 0.11.5, Bucket4j 8.10.1, H2 (local/test only);
  React 18, TypeScript, Vite 7, Tailwind 3, TanStack React Query 5.
- Migrations: `V1–V16` present under `backend/src/main/resources/db/migration`
  (users, assignments, records, audit, indexes, empty V6 seed, profile fields,
  notifications, timeline, reviews, platform audit, active-assignment unique,
  review unique, two out-of-scope seed removals, review dedup safety net).
- Tests present (read-verified, 26 methods): 17 `FlowIntegrationTest` + 3
  `SecurityClaimsTest` + 5 `JwtUtilTest` + 1 `MedVaultApplicationTests`
  (full list in `WALKTHROUGH.md` §4).
- Measured in bootstrap: file inventory, config values, migration/constraint inventory,
  test-method inventory, `git` state. **Not measured:** no `mvn`/`npm` build or test
  execution was run during bootstrap (deliberately, to avoid artifacts/DB writes), so no
  pass/fail counts, timings, or coverage are claimed here. `README.md`'s "26 scenarios"
  statement is consistent with the 26 methods found but remains author-claimed until a
  future phase executes `cd backend && ./mvnw test` and records output.
- Known limitations (V1): no workspace/release/scope-lock/dependency-cycle/refresh-token
  implementation; no default users or JWT secret in prod; frontend has no automated tests
  in-repo (`package.json` has dev/build/lint/preview only).
