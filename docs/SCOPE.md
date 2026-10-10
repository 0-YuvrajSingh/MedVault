# SCOPE.md — MedVault V1 (verified) + workspace terminology (planned)

Source of truth: V1 code at commit `157a7f1`. Planning terms marked `PROPOSED` are not
implemented. No prior Phase 0/1 artifacts were recoverable; nothing here is reconstructed
from them.

## 1. In-scope V1 behavior (implemented)

- Self-registration: `ROLE_PATIENT` (immediate active + JWT), `ROLE_DOCTOR` (inactive,
  `token = null`, login 401 until approved). `ROLE_ADMIN` rejected at registration (400).
  (`AuthService`, `AuthController`, `FlowIntegrationTest#testPatientRegistrationAndAuthentication`,
  `#testDoctorRegistrationProducesNoTokenAndCannotLoginUntilApproved`,
  `#testPublicRegistrationCannotCreateAdmin`)
- Doctor approval / rejection / deactivation by admin; JWT re-validated against
  `users.is_active` on every request (immediate revocation).
  (`AdminService`, `JwtAuthenticationFilter`, `FlowIntegrationTest#testAdminApprovalWorkflow`,
  `#testAdminRejectDoctor`, `#testDeactivatedDoctorJwtRejectedImmediately`)
- Care assignment: at most one active doctor per patient (service check + partial unique
  index `idx_assignment_unique_active_patient WHERE is_active = true`); reassign
  deactivates old row and creates new; unassign deactivates.
  (`AdminService`, `V12__assignment_isactive_and_unique.sql`,
  `FlowIntegrationTest#testDuplicateActiveAssignmentFails`, `#testReassignmentWorkflow`,
  `#testAdminUnassignPatient`)
- Clinical records by assigned doctor only; atomic triad (record + `audit_log` snapshot +
  `platform_audit_log` + notification + two timeline events) in one `@Transactional`.
  (`DoctorService#createRecord`, `FlowIntegrationTest#testDoctorRecordCreationGeneratesAuditNotificationTimeline`)
- Reviews: one per patient–doctor pair (upsert + unique index
  `idx_review_unique_patient_doctor` + `CHECK (rating 1–5)`); requires active assignment;
  doctor reads own reviews. (`ReviewService`, `V10`/`V13`/`V15`,
  `FlowIntegrationTest#testPatientReviewWorkflow`)
- Notifications / timeline: owner-only read; marking another user's notification read → 403.
  (`NotificationService`, `FlowIntegrationTest#testNotificationOwnership`)
- Auditing: platform events + record snapshots, admin-readable.
  (`AuditService`, `FlowIntegrationTest#testPlatformAuditLogsEndpoint`,
  `SecurityClaimsTest#testImmutableAuditLoggingArchitecture`)
- Uniform login failures (unknown / inactive / wrong password → identical 401
  `Invalid email or password`). (`FlowIntegrationTest#testLoginFailuresAreUniform`)

## 2. Domain definitions

- `users` (`User`): id, fullName, email (unique), passwordHash (BCrypt-12), role
  (`ROLE_ADMIN`/`ROLE_DOCTOR`/`ROLE_PATIENT`), active, createdAt. (`V1__users.sql`)
- `patient_doctor_assignments` (`PatientDoctorAssignment`): patient FK, doctor FK,
  assignedAt, isActive. (`V2`, `V12`)
- `medical_records` (`MedicalRecord`): patient FK, doctor FK, diagnosis, prescription,
  notes, recordDate, timestamps. (`V3__medical_records.sql`)
- `audit_log` (`AuditLog`): record FK, action, performedBy FK, detailSnapshot, performedAt;
  no setters (immutable by construction). (`V4__audit_log.sql`)
- `platform_audit_log` (`PlatformAuditLog`): actor FK (nullable, `ON DELETE SET NULL`),
  action, entityType, entityId, detail. (`V11__platform_audit_log.sql`)
- `notifications`, `timeline_events`, `reviews`: see `V8`/`V9`/`V10`.
- **Workspace (IMPLEMENTED post-V1, D1 narrowed):** membership-based access-control
  boundary for MedVault resources (`workspaces`, `workspace_memberships`, nullable
  `workspace_id` on assignments/records; `V17__workspaces.sql`). V1 rows (null workspace)
  keep unscoped V1 semantics. Assignment-ownership and role checks remain authoritative —
  the workspace gate never weakens them. Dependency graphs, release state machines,
  readiness gates, and scope locking are AgileTrack-owned and out of MedVault scope.

## 3. Permissions (verified: `SecurityConfig` + `@PreAuthorize` + service checks)

See `README.md` §3 matrix and `docs/WALKTHROUGH.md` §5. Summary: admin oversees approvals
and assignments; doctors act only on actively assigned patients; patients act only on own
records and assigned doctor; audit endpoints admin-only.

## 4. Constraints (verified in migrations)

- `users.email` unique; `patient_doctor_assignments` FKs to `users`;
  `medical_records` FKs to `users`; `audit_log` FKs to records/users; indexes in `V5`.
- `idx_assignment_unique_active_patient` (partial unique, V12); `reviews.rating`
  `CHECK (1–5)` (V10); `idx_review_unique_patient_doctor` (V13/V15).
  Post-V1: `uq_membership_workspace_user` (V17) + FKs `fk_membership_workspace`,
  `fk_membership_user`, `fk_assignment_workspace`, `fk_record_workspace`.
- Future-phase check constraints: documented per phase in `docs/PLAN.md`, not invented here.

## 5. Out of scope (V1 baseline; workspace implemented post-V1)

Appointments, scheduling, chat/video, file uploads, billing/insurance/pharmacy,
multi-tenancy/ERP, email/SMS dispatch. No refresh tokens, no releases,
no scope locks, no dependency-cycle detection exist in MedVault (releases/graphs/gates
are AgileTrack-owned). Workspaces did not exist in V1 and are implemented post-V1
(see `docs/WORKSPACE_MIGRATION_V17.md`).

## 6. Acceptance criteria (V1 baseline + workspace phase)

26 V1 test methods verified present in `backend/src/test` (17 in `FlowIntegrationTest`,
3 in `SecurityClaimsTest`, 5 in `JwtUtilTest`, 1 in `MedVaultApplicationTests`);
execution status unverified at bootstrap (H2 profile: `application-test.yml`, Flyway
disabled); see `docs/BASELINE.md`. Post-V1 workspace phase: 47/47 executed green
(26 V1 + 21 `WorkspaceIntegrationTest`, incl. 4 D6 policy tests + 2 A28 tests) on 2026-10-09; see `docs/AUDIT.md` A19–A28.
