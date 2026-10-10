# Release notes — MedVault V1 + workspace authorization (incl. D6, A28, A29)

Status: the currently defined and authorized implementation scope is verified locally (47/47 backend tests green via `mvn -B verify`, frontend `npm ci` + `npm run lint` + `npm run build` green under supported Node `v24.21.0`, production runtime `npm audit --omit=dev` at 0 vulnerabilities, scratch-DB migration checks passed). This is not a production deployment approval or a claim that undefined D2–D4 requirements are complete. Production/shared deployment, backfill, and subsequent implementation phases are NOT authorized.

## Scope delivered

- V1 (baseline `157a7f1`): role-based medical records — patient self-registration,
  doctor approval workflow, single-active-assignment care model, atomic record/audit/
  notification/timeline writes, reviews, uniform-401 login, IDOR/ownership enforcement.
- Workspace authorization (D1 narrowed, access-control only): admin-managed workspaces
  and memberships; membership gate on scoped reads (non-member → 404, ownership
  failures → 403, no credentials → 401); nullable `workspace_id` (V17, additive only).
- D6 assignment policy: `workspaceId` mandatory on new assignments (400/404), legacy
  null-workspace reassignment blocked (409), scoped inheritance verified.
- A28 admin least-privilege remediation: direct admin clinical-record endpoint
  (`GET /api/admin/patients/{patientId}/records`) and admin UI screen removed (returns
  `404` rather than `500`); record-audit responses (`GET /api/admin/records/{recordId}/audit`)
  withhold `detailSnapshot` (`null`) while retaining metadata; Postman and docs updated
  and JSON-validated.
- A29 frontend dependency security & supported-Node verification: declared minimum
  supported Node engine (`^20.19.0 || ^22.13.0 || >=24.0.0`) in `frontend/package.json`;
  triaged all 22 `npm audit` findings (`1 low`, `4 moderate`, `17 high`) and applied
  compatible non-breaking fixes (`axios` `1.13.6 → 1.20.0`, `follow-redirects` `1.15.11 → 1.16.1`,
  `form-data` `4.0.5 → 4.0.6`, `react-router`/`react-router-dom` `7.13.1 → 7.18.4`,
  `vite` `7.2.4 → 7.3.7`, `postcss` `8.5.6 → 8.5.29`, `nanoid` `3.3.11 → 3.3.20`,
  `source-map-js` `1.2.1 → 1.2.2`, `@babel/core` `7.28.5 → 7.29.7`, `browserslist`
  `4.28.0 → 4.29.3`, `baseline-browser-mapping` `2.10.40 → 2.11.28`, `@humanfs/node`
  `0.16.7 → 0.16.8`, `js-yaml` `4.1.1 → 4.3.2`, `brace-expansion` `1.1.12 → 1.1.21` &
  `5.0.6 → 5.0.12`, `picomatch` `2.3.1 → 2.3.2` & `4.0.3 → 4.0.7`, `postcss-selector-parser`
  `6.1.2 → 6.1.4`, `tailwindcss` `3.4.18 → 3.4.19`). Production runtime audit
  (`npm audit --omit=dev`) is now **0 vulnerabilities** (`AUDIT.md` A29).

## Known-undefined decisions (explicitly deferred to post-release, 2026-10-10)

- **D2, D3, D4 — Accepted in principle; definitions TBD by user; explicitly deferred out of this release scope:**
  Their original definitions could not be recovered from `MedVault_Scope_v1.docx`, git
  history, or repository documentation, and no implementation requirements were inferred
  from their Accepted status. Per user decision (2026-10-10), D2–D4 are explicitly
  recorded as **deferred post-release items** until defined by the user. See
  `docs/DECISIONS.md`.

## Known limitations & accepted release dispositions

- **Legacy null-workspace rows are unscoped** (accepted compatibility boundary, no
  backfill). New unscoped creation is rejected (D6); legacy reassignment blocked (409).
- **Admin clinical-record access (A28) — REMEDIATED and verified:**
  record-contents endpoint removed (now `404`), clinical audit snapshots withheld from
  admin responses (`detailSnapshot: null`), admin screen removed. Historical audit
  snapshots remain stored at rest in `audit_log.detail_snapshot` (this remediation
  prevents disclosure through admin API responses; it does not erase historical clinical
  data).
- **Remaining build-time npm advisories (7 dev-only entries across 2 root advisories — ACCEPTED for this release per D7):**
  a successful `npm run build` does not prove all dependencies in `node_modules` are
  vulnerability-free. While `npm audit --omit=dev` has `0` vulnerabilities, full
  `npm audit` still reports `7 vulnerabilities (2 moderate, 5 high)` in the
  `tailwindcss@3.4.19` build-time dependency tree (`braces@3.0.3` `GHSA-vfj7-8cjw-p6xm`
  High → `chokidar`, `micromatch`, `fast-glob`, `tailwindcss`; and
  `postcss-selector-parser@6.1.4` `GHSA-rj75-hqrm-r3gf` Moderate → `postcss-nested`,
  `tailwindcss`). Fixing these requires a breaking major upgrade to `tailwindcss@4.3.3`
  (`npm audit fix --force`). None of these packages ship in the compiled `dist/` bundle.
  Per user decision D7 (2026-10-10), these 7 dev/build-time advisories are **accepted for
  this release** (`0` production runtime vulnerabilities) and the Tailwind CSS v4
  migration is **deferred to a future phase**. See `docs/AUDIT.md` §Frontend Dependency
  Security Audit and `docs/DECISIONS.md` D7.
- **No production demo credentials exist** (by design). First admin setup:
  `docs/FIRST_ADMIN_BOOTSTRAP.md`. Portfolio project: synthetic data only, no
  compliance claim.
- AgileTrack-owned domains (dependency graphs, release state machines, readiness
  gates, scope locking) are intentionally absent from MedVault.

## Verification evidence (executed 2026-10-10)

- Backend `mvn -B verify` (JDK 21, H2 test profile): 47/47 green (`BUILD SUCCESS`, exit
  code `0`; 26 V1 + 21 workspace/D6/A28, including `testAdminCannotReadRecordContents` and
  `testAdminRecordAuditOmitsClinicalSnapshot`).
- Frontend under supported Node `v24.21.0` (`npm 10.8.2`, satisfying
  `^20.19.0 || ^22.13.0 || >=24.0.0` with zero `EBADENGINE` warnings):
  - `npm ci`: clean install (`326` packages audited).
  - `npm audit --omit=dev`: `found 0 vulnerabilities`.
  - `npm audit`: `7 vulnerabilities (2 moderate, 5 high)` — all dev/build-time inside
    `tailwindcss@3.4.19` (`braces` / `postcss-selector-parser`), accepted for this release
    per D7.
  - `npm run lint` (`eslint .`): green (0 errors, 0 warnings).
  - `npm run build` (`tsc --noEmit && vite build`): green (`dist/` generated and
    git-ignored).
- V1–V17 applied on scratch `postgres:15-alpine`; unique + FK violations confirmed
  rejected; container removed. Packet: `docs/WORKSPACE_MIGRATION_V17.md`.

## Release disposition & remaining production deployment gates

- **Settled for this release (2026-10-10 user decisions):**
  - **Tailwind CSS v3 build-time advisories (D7):** **ACCEPTED for this release** (`0`
    production runtime vulnerabilities; 7 dev/build-time entries in `tailwindcss@3.4.19`
    do not ship in `dist/`); breaking migration to Tailwind CSS v4 is **deferred to a
    future phase**.
  - **D2–D4 disposition:** **DEFERRED out of this release scope** as explicit post-release
    items until defined by the user (`docs/DECISIONS.md`).
- **Remaining production deployment gates (CLOSED — do not execute without target-specific approval):**
  1. **V17 shared/production database deployment:** Per user decision (2026-10-10), `V17`
     remains limited to verified local/scratch status only. Do not run against any shared
     or production database until target database, verified backup/recovery path, and
     deployment window in `docs/WORKSPACE_MIGRATION_V17.md` are explicitly approved.
  2. **Release CI & first-admin bootstrap:** Green CI on the release commit and controlled
     execution of `docs/FIRST_ADMIN_BOOTSTRAP.md` on the approved target DB after backup.
