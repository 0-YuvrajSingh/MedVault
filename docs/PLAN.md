# PLAN.md — MedVault planning (bootstrap, 2026-10-09)

> **Phase gate (binding):** No implementation phase, application behavior change, or
> database migration may start without explicit authorization from the user. Planning and
> documentation work do not authorize phase execution. Every phase below needs
> prerequisites, scope, acceptance criteria, verification commands, and a completion gate.
> GO was granted for the workspace authorization phase and its bounded D6/A28/A29 follow-up and local verification work. All other implementation phases and all production/shared database operations remain gated.

Status: planning bootstrap complete. Workspace authorization, D6, A28, and A29 are implemented and verified by measured local execution (`mvn -B verify`: `47/47` green, exit code `0`; supported-Node `v24.21.0` `npm ci`, `npm audit --omit=dev`, `npm run lint`, and `npm run build` green); Phases 2–6 and other future implementation phases remain `NOT STARTED`. Prior Phase 0/1 artifacts were unrecoverable — no contents are reconstructed here. V1 baseline: commit `157a7f1`, see `docs/BASELINE.md`.

## Conventions for all phases

- Each phase lists: prerequisites, scope, migration plan (where applicable), seed changes,
  tests, verification commands, acceptance criteria, completion gate.
- Labels: `VERIFIED` (in V1 code), `PROPOSED` (planned, not implemented), `UNVERIFIED`
  (needs a future run), `TBD` (needs user definition before any `GO`).
- Never run migrations during planning. Destructive work needs the gate in §0.

## 0. Destructive-migration gate (mandatory, all phases)

Before any migration that converts, drops, narrows, or backfills data executes, the user
must explicitly approve: (a) target database + backup/recovery path, (b) convert-then-drop
sequence with ordering, (c) irreversible data-loss implications, (d) rollback or
recovery procedure, (e) regression tests. Ask before any destructive migration — no
exceptions. Safe pattern required everywhere: add/convert data → verify → then drop/narrow
in a later step; never drop before conversion is verified.

V1 constraints every future migration must respect (verified): `users.email` unique;
FKs `patient_doctor_assignments→users`, `medical_records→users`, `audit_log→records/users`,
`platform_audit_log.actor→users ON DELETE SET NULL`; partial unique
`idx_assignment_unique_active_patient`; unique `idx_review_unique_patient_doctor`;
`reviews.rating CHECK (1–5)`; indexes in `V5`/`V8`/`V9`/`V10`/`V11`. Any phase touching
these tables must name the affected constraints and re-verify them post-migration.

## 1. Phases 2–6 scaffolds (scope TBD — do not start)

Phases 2–6 have no recoverable definitions; the per-phase entries below are the mandatory
plan skeleton the user must fill (or approve) before any `GO`. No specific `V17+` SQL,
columns, or behavior are asserted here.

### Phase 2 (TBD) — NOT STARTED

- Prerequisites: TBD + gate §0 if destructive.
- Scope: TBD (user to define).
- Migration plan: new `V__` file(s) TBD; tables/columns/FKs/indexes/checks affected: TBD
  (must list against §0 inventory); conversion sequence: convert + verify before any
  drop/narrow; ordering + rollback: TBD.
- Seed changes: TBD (local/dev seeder only; never prod secrets).
- Tests: migration test + regression of `AUDIT.md` A1–A12.
- Verify: `cd backend && ./mvnw test`; `cd frontend && npm run build`.
- Acceptance / gate: TBD + user `GO` required.

### Phase 3 (TBD) — NOT STARTED

Same skeleton as Phase 2: prerequisites / scope TBD; migration (convert-then-drop,
affected constraints listed); seed; migration + regression tests; verify commands above;
acceptance + `GO` gate.

### Phase 4 (TBD) — NOT STARTED

Same skeleton as Phase 2.

### Phase 5 (TBD) — NOT STARTED

Same skeleton as Phase 2.

### Phase 6 (TBD, incl. role mapping) — NOT STARTED

Same skeleton as Phase 2, plus mandatory role-mapping section before `GO`: every existing
authorization semantic preserved or explicitly changed — `ROLE_ADMIN` / `ROLE_DOCTOR` /
`ROLE_PATIENT` endpoint access (`SecurityConfig` + `@PreAuthorize`), assignment-ownership
checks (`DoctorService`, `PatientService`, `ReviewService`, `NotificationService`), and
any new workspace roles mapped to these with a before/after matrix. No silent widening
of access; D1 workspace membership checks defined here.

## 2. Access-token lifetime phase (PROPOSED) — NOT STARTED

- Prerequisites: `DECISIONS.md` D5 reviewed.
- Scope: confirm 30-minute access-token lifetime (`JWT_EXPIRATION=1800000`) with no
  refresh tokens; docs only unless user approves a value change (no auth code touched yet).
- Migration/seed: none. Role mapping: none (all roles share the lifetime).
- Tests: existing `JwtUtilTest` expiry/tamper tests remain green; any new lifetime needs a
  unit test (PROPOSED).
- Verify: `cd backend && ./mvnw test`.
- Acceptance: D5 recorded + `README.md` trade-off note present; completion gate: user approval.

## 3. Core-tests phase (PROPOSED, MedVault scope only) — NOT STARTED

Ownership boundary (per `MedVault_Scope_v1.docx` §2 and user decision 2026-10-10):
dependency graphs / cycle detection, release state machines, readiness gates / derived
readiness, and scope locking are **AgileTrack-owned and out of MedVault scope**. The
following items are therefore **removed/deferred from MedVault** unless independent
MedVault requirements establish their necessity: dependency-cycle rejection with path,
release-readiness gates (including empty releases and deterministic reasons),
scope locking, and `READY`/`NOT_READY` release seeds. `AUDIT.md` A13/A14 already record
these as missing from V1; nothing here claims them as MedVault tests.

Historical baseline distinction: the original 26 V1 methods were read-verified during bootstrap without execution. They were subsequently executed with the workspace/D6/A28 suite; see the implementation record below and `docs/RELEASE_NOTES.md`.

Workspace membership/role checks and non-member 404 versus member-without-assignment 403 behavior are implemented and tested in the workspace phase (`AUDIT.md` A19–A25). They are not outstanding coverage for this proposed phase.

Remaining proposed coverage (MedVault scope only):

1. D4 behavior, after the user defines the decision. Until then, no endpoint, input, status code, or assertion may be invented.

Definition of done (after D4 is defined and this phase is separately authorized):

- [ ] Acceptance criteria for D4 are explicitly recorded by the user.
- [ ] Deterministic tests assert the defined behavior.
- [ ] `cd backend && ./mvnw test` green; `cd frontend && npm run build` green if frontend files are touched.
- [ ] `AUDIT.md` / `WALKTHROUGH.md` list verified test names only.

## Workspace authorization phase (GO 2026-10-10) — IMPLEMENTED

Authorized scope only: membership-based access-control boundary (D1 narrowed); existing
roles and assignment-ownership checks authoritative; no AgileTrack, D2–D4, or token work.

- Model: `workspaces` + `workspace_memberships` (unique `(workspace_id, user_id)`,
  deactivation-preserving removal); nullable `workspace_id` on
  `patient_doctor_assignments` and `medical_records` (null = unscoped V1 semantics).
- APIs: `WorkspaceController` (`/api/admin/workspaces/**`, admin-only) + mandatory
  `workspaceId` on new assignment creation (missing/null → 400, unknown workspace → 404); reassignment inherits workspace, while reassignment of a legacy null-workspace assignment is blocked (409). Records inherit assignment workspace at creation. Denial: non-member → 404, member failing ownership → 403,
  no credentials → 401 via `JwtAuthenticationEntryPoint` (presented-but-rejected
  credentials stay body-less 403, preserving the verified deactivated-JWT test and the
  frontend dead-session path).
- Tests: 21 `WorkspaceIntegrationTest` + 26 V1 regression = **47/47 green** (`mvn -B verify`
  in `maven:3.9-eclipse-temurin-21`, H2 profile), including no-credentials → 401,
  invalid-token → 403, `totalElements` assertions proving pagination totals never reveal
  hidden rows, 4 D6 policy tests (400 / 404 / 409 / inheritance), and 2 A28 tests
  (removed-endpoint 404, audit redaction). Frontend `npm ci`, `npm run lint`, and
  `npm run build` (tsc + vite) green under supported Node `v24.21.0` (`npm 10.8.2`,
  satisfying `^20.19.0 || ^22.13.0 || >=24.0.0` declared in `frontend/package.json` with
  zero `EBADENGINE` warnings).
- Dependency security (`AUDIT.md` A29, `DECISIONS.md` D7): triaged all 22 `npm audit`
  findings (`1 low`, `4 moderate`, `17 high`) and applied compatible non-breaking upgrades
  (`npm audit fix` without `--force` + floor updates in `frontend/package.json`).
  Production runtime audit (`npm audit --omit=dev`) reduced to **0 vulnerabilities**
  (`axios 1.20.0`, `react-router`/`react-router-dom 7.18.4`, `follow-redirects 1.16.1`,
  `form-data 4.0.6`). 7 dev/build-time package entries remain in the `tailwindcss@3.4.19`
  chain (2 root advisories: `braces <=3.0.3` `GHSA-vfj7-8cjw-p6xm` High and
  `postcss-selector-parser <7.1.6` `GHSA-rj75-hqrm-r3gf` Moderate), which require a
  breaking major upgrade (`tailwindcss@4.3.3`, `--force`). Per user decision D7
  (2026-10-10), these 7 dev/build-time advisories are **accepted for this release** (`0`
  runtime exposure) and Tailwind CSS v4 migration is **deferred to a future phase**.
- Migration: `V17__workspaces.sql` (additive only, no conversion/backfill; existing rows
  need none — null means unscoped). Verified on scratch `postgres:15-alpine` (V1–V17
  applied, unique + FK violations confirmed rejected, container removed). Per user
  decision (2026-10-10), **`V17` remains limited to verified local/scratch status only —
  execution on any shared/prod database remains unauthorized** until target-specific
  approval (`docs/WORKSPACE_MIGRATION_V17.md`). No production/shared DB was connected or
  modified.
- Docs: `AUDIT.md` A19–A29 (+ full 22-finding dependency triage), `WALKTHROUGH.md`
  §§1/2/4/6/7, `SCOPE.md`, `DECISIONS.md` D1/D6/D7, `README.md`, and Postman
  `Workspaces (Admin)` and `Admin` folders updated to implemented behavior. Release
  posture: `docs/RELEASE_NOTES.md`.
- Accepted limitations & release dispositions: null-workspace compatibility boundary
  (`AUDIT.md` A22 — legacy rows stay under V1 rules, no backfill); policy D6 IMPLEMENTED
  and verified (mandatory `workspaceId` → 400, unknown → 404, legacy reassignment → 409
  with deterministic message, scoped inheritance verified; `AUDIT.md` A27); historical
  `audit_log.detail_snapshot` rows remain at rest (`AUDIT.md` A28); 7 build-only
  `tailwindcss@3.4.19` transitive advisories accepted for this release with Tailwind v4
  deferred (`AUDIT.md` A29, `DECISIONS.md` D7); D2–D4 explicitly deferred out of this
  release scope to post-release (`DECISIONS.md` D2–D4).

## 4. Dependencies, blockers, verification

- Dependencies: the D1 workspace membership/access-control design is resolved and implemented. Any future role-mapping work must build on it without introducing a workspace-specific role hierarchy unless separately required.
- Blockers: (1) Phase 2–6 scopes undefined — need user definitions before starting future phases; (2) D2–D4 definitions TBD by user — per user decision 2026-10-10, explicitly deferred out of this release scope as post-release items until defined (Accepted in principle only); (3) workspace membership design — RESOLVED by GO requirements 2026-10-10 and implemented (membership semantics, role model, resource scoping, denial behavior per phase section above). AgileTrack-owned items (dependency graph/cycle, release state machine, readiness gates, scope locking) are out of MedVault scope and are not blockers here.
- Bootstrap verification (historical): read-only inspection used `git`, `read`, `grep`, `glob` (no artifacts); no `mvn`/`npm` execution, DB connection, or migration run occurred during bootstrap. Subsequent authorized verification executed backend `mvn -B verify` (JDK 21, H2), scratch-PostgreSQL V1–V17 checks, and frontend `npm ci`, `npm audit`, `npm run lint`, and `npm run build` under supported Node `v24.21.0` (recorded in `docs/AUDIT.md` and `docs/RELEASE_NOTES.md`).

## 9-corrections status

1. Phase gate — recorded here + `AGENTS.md`. Done.
2. Algorithm/complexity — recorded as MISSING in `AUDIT.md` A13, `SCOPE.md` §5,
   `WALKTHROUGH.md` §6; no BFS/DFS claimed. Done (withdraws any assumed description).
3. Walkthrough/tests — all 26 cited names verified present; §6 includes workspace layer
   as PROPOSED. Done.
4. Decisions D1–D4 — recorded in `DECISIONS.md`; D1 narrowed to access control only
   (AgileTrack owns graph/release/readiness/scope-lock); D2–D4 Accepted in principle,
   definition TBD by user. `README.md` workspace one-liner + `SCOPE.md` workspace
   wording applied. Done.
5. Safe migrations Phases 2–6 — §0 gate + per-phase skeletons with constraint inventory,
   seed, and Phase 6 role mapping. Done (specifics TBD pending user scope).
6. Token lifetime — D5 proposal (30 min) + `README.md` note. Done as proposal.
7. Core-tests phase — §3 above, MedVault scope only (AgileTrack cycle/release/
   readiness/scope-lock items removed/deferred) with DoD. Done as plan.
8. Non-member 404/403 — `AUDIT.md` A15 with V1 code-path evidence + deferred runtime
   re-check. Done.
9. Baseline historical — `docs/BASELINE.md` marked historical with commit + measured vs
   unmeasured split. Done.
