# V17 Workspace migration — approval packet (NOT executed on any shared/prod DB)

File: `backend/src/main/resources/db/migration/V17__workspaces.sql`
Type: **additive only**. No `UPDATE`/`DELETE` of existing rows, no column narrowing or
drops, no backfill. Pre-existing rows are untouched and need no conversion: a `NULL`
`workspace_id` means *unscoped* and preserves V1 access semantics by design
(`WorkspaceAccessService#requireMemberOf` bypasses null workspaces).

## Exact schema changes

- `CREATE TABLE workspaces (id UUID PK, name VARCHAR(255) NOT NULL, created_by UUID NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`
- `CREATE TABLE workspace_memberships (id UUID PK, workspace_id UUID NOT NULL, user_id UUID NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)` + FKs `fk_membership_workspace → workspaces(id)`, `fk_membership_user → users(id)` + unique `uq_membership_workspace_user (workspace_id, user_id)` + indexes `idx_membership_workspace`, `idx_membership_user`
- `ALTER TABLE patient_doctor_assignments ADD COLUMN workspace_id UUID NULL` + FK `fk_assignment_workspace → workspaces(id)` + index `idx_assignment_workspace`
- `ALTER TABLE medical_records ADD COLUMN workspace_id UUID NULL` + FK `fk_record_workspace → workspaces(id)` + index `idx_record_workspace`

## Affected constraints

New objects only (listed above). Untouched V1 constraints re-verified present post-apply:
`users.email` unique, `idx_assignment_unique_active_patient` (partial unique),
`idx_review_unique_patient_doctor`, `reviews.rating CHECK (1–5)`, all V2/V3/V4/V11 FKs,
V5/V8/V9/V10/V11 indexes.

## Existing data treatment

`users`, `patient_doctor_assignments`, `medical_records`, `reviews`, `notifications`,
`timeline_events`, `audit_log`, `platform_audit_log` rows: **unchanged, all
`workspace_id = NULL` → unscoped → identical authorization behavior to V1**.
No data-loss implications (nothing is rewritten or removed).

Explicit compatibility boundary: workspace isolation does **not** apply to
null-workspace (legacy/V1) rows by design. Accepted for this release per user decision
(`AUDIT.md` A22); the safe alternative — mass-backfilling legacy rows into a default
workspace — would change V1 access semantics and requires its own separately approved
migration plan, which is not proposed here. D6 now rejects new unscoped assignments
(400) and blocks legacy reassignment (409), so the unscoped set cannot grow.

## Verification performed (scratch only)

- Applied V1–V17 in order on scratch `postgres:15-alpine` (empty DB, container removed
  afterwards): all statements succeeded.
- Negative checks on the same scratch DB: duplicate `(workspace_id, user_id)` insert
  rejected by `uq_membership_workspace_user`; dangling `workspace_id` rejected by
  `fk_membership_workspace`. Both confirmed.
- H2 suite (`mvn -B test`, create-drop profile): 47/47 green — entity mappings match.

## What still requires explicit approval (gate CLOSED — local/scratch only per 2026-10-10 decision)

Per user decision on 2026-10-10, `V17` remains **limited to verified local/scratch status
only**; execution against any shared or production database is unauthorized until the
following target-specific items are explicitly reviewed and approved:

- Target database + verified backup/recovery path,
- Deployment window,
- Confirmation that additive-only/no-backfill remains accurate for the target's actual data,
- Rollback strategy (see warning below), and
- Regression-test evidence on a staging copy.

> **Rollback warning:** dropping V17 objects after rollout destroys workspace and
> membership rows created since deployment, and leaves scoped assignments/records
> pointing at a deleted boundary (their `workspace_id` values dangle once the FKs
> are dropped — the membership data itself is still lost). Dropping is NOT
> automatically safe because the migration was additive. A data-preserving recovery
> plan (export workspace/membership state before any destructive rollback, or
> restore-then-reconcile from the pre-migration backup) is required before any
> rollback is approved. When in doubt, restore from backup instead of dropping.

No production or shared database was connected, inspected, or modified in this phase.
