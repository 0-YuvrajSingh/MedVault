# WALKTHROUGH.md — Verified architecture and behavior (V1 + workspace phase)

All claims verified against source. V1 tests were read-verified at bootstrap and have
since executed green together with the workspace/D6/A28 suite (47/47 on 2026-10-09).

## 1. Request path

`React 18 + TS client` → `Bearer JWT` → `RateLimitingFilter` → `JwtAuthenticationFilter`
(signature + expiry via `JwtUtil`, then `users.is_active` re-check from DB) →
`SecurityConfig` (`/api/auth/**`, `/api/health`, `/error` public; else authenticated;
stateless; BCrypt-12) → method `@PreAuthorize` per controller →
service ownership checks → JPA → PostgreSQL 15 (Flyway V1–V17; V17 verified on scratch PostgreSQL 15 only).

## 2. Roles and portals

- `/api/auth/**` (`AuthController`): register (patient immediate, doctor pending, admin 400),
  login (uniform 401).
- `/api/admin/**` (`AdminController`, `hasRole('ADMIN')`): users/doctors/patients lists,
  approve/reject/deactivate, assignments CRUD, platform audit log + record audit
  metadata (no clinical contents — A28; historical `detail_snapshot` remains at rest),
  no record-content access (`GET /api/admin/patients/{patientId}/records` removed → 404).
- `/api/admin/workspaces/**` (`WorkspaceController`, `hasRole('ADMIN')`): workspace
  create/list/read, member add/list/remove (deactivation, history preserved).
- `/api/doctor/**` (`DoctorController`, `PatientController`-adjacent, `ReviewController`,
  `hasRole('DOCTOR')`): assigned patients, assigned-patient records read/create, own reviews.
- `/api/patient/**` (`PatientController`, `hasRole('PATIENT')`): own records, single-record
  ownership check, my-doctor (active assignment only), reviews upsert.
- Shared: notifications/timeline (`NotificationController`, `TimelineEventController`),
  profile/password (`UserProfileController`).

## 3. Key behaviors (with test evidence)

Registration/approval/deactivation and uniform 401: §A1–A3 in `AUDIT.md`.
Assignment uniqueness/reassignment/unassignment: §A4–A5. Atomic record triad: §A6.
IDOR/ownership → 403 and missing → 404: §A7 + §A15. Reviews/notifications/audits: §A8–A10.

## 4. Test evidence (47 methods, all executed green 2026-10-09)

- `FlowIntegrationTest` (17, V1): `testPatientRegistrationAndAuthentication`,
  `testDoctorRegistrationProducesNoTokenAndCannotLoginUntilApproved`,
  `testAdminApprovalWorkflow`, `testAdminRejectDoctor`,
  `testDeactivatedDoctorJwtRejectedImmediately`, `testPublicRegistrationCannotCreateAdmin`,
  `testDoctorCannotAccessUnassignedPatientRecords`,
  `testPatientCannotAccessAnotherPatientRecord`, `testPatientCannotCreateMedicalRecords`,
  `testDuplicateActiveAssignmentFails`, `testReassignmentWorkflow`,
  `testDoctorRecordCreationGeneratesAuditNotificationTimeline`,
  `testPatientReviewWorkflow`, `testNotificationOwnership`, `testAdminUnassignPatient`,
  `testPlatformAuditLogsEndpoint`, `testLoginFailuresAreUniform`.
- `SecurityClaimsTest` (3): `testStrictIdorProtectionDoctorCannotFetchUnassignedPatientRecords`,
  `testStrictIdorProtectionPatientCannotFetchOtherPatientRecords`,
  `testImmutableAuditLoggingArchitecture`.
- `JwtUtilTest` (5): `testGenerateTokenAndExtractUserId`, `testExtractRole`,
  `testValidateToken`, `testExpiredTokenValidationFails`, `testTamperedTokenValidationFails`.
- `MedVaultApplicationTests` (1): `contextLoads`.
- `WorkspaceIntegrationTest` (21: workspace phase + D6 policy + A28): `testAdminCanCreateAndReadWorkspace`,
  `testCreateWorkspaceValidation`, `testNonAdminCannotManageWorkspaces`,
  `testUnauthenticatedWorkspaceRequestDenied`, `testInvalidTokenWorkspaceRequestForbidden`,
  `testMemberAddRemoveAndReactivate`,
  `testAddMemberUnknownUserOrWorkspace404`, `testScopedAssignmentMembershipGate`,
  `testMemberWithoutAssignmentStillForbidden`, `testCrossWorkspaceIsolation`,
  `testUnscopedAssignmentPreservesV1Semantics`,
  `testRecordInheritsWorkspaceAndHidesAfterRemoval`,
  `testReviewRequiresMembershipWhenScoped`,
  `testAdminCannotReadRecordContents`, `testAdminRecordAuditOmitsClinicalSnapshot`,
  `testAssignedPatientsHidesUnmemberedScoped`,
  `testAssignRequiresWorkspaceId`, `testAssignUnknownWorkspaceReturns404`,
  `testLegacyReassignmentBlocked`, `testScopedReassignmentInheritsWorkspace`,
  `testDoctorReviewsHideUnmemberedWorkspace`.
- No other test names are cited anywhere in `docs/`. Anything not in this list is
  `PROPOSED` (see `PLAN.md` core-tests phase), not claimed passing.

## 5. Authorization map detail

Controller `@PreAuthorize`: `AdminController hasRole('ADMIN')`,
`DoctorController`/`ReviewController` `hasRole('DOCTOR')`,
`PatientController` `hasRole('PATIENT')`, `NotificationController`/`TimelineEventController`
split by role. Service layer adds ownership: `DoctorService#verifyAssignment`,
`PatientService#getRecord`, `ReviewService` assignment check,
`NotificationService` ownership check. `GlobalExceptionHandler`: `AccessDeniedException`
(ours + Spring's) → 403, `AccountNotActiveException` → 403, `ResourceNotFoundException` → 404,
`NoResourceFoundException` → 404, `ConflictException`/integrity → 409,
`BadCredentialsException` → uniform 401, validation → 400.

## 6. Layers, including the workspace layer

V1 layers: client → filter chain → controllers → services → repositories/entities →
PostgreSQL; cross-cutting audit/notification/timeline inside the record-creation transaction.
**Workspace layer (IMPLEMENTED, D1 narrowed to access control):** `Workspace` /
`WorkspaceMembership` entities (`workspaces`, `workspace_memberships`, unique
`(workspace_id, user_id)`), `WorkspaceService` + `WorkspaceController`
(`POST/GET /api/admin/workspaces`, `POST/GET /api/admin/workspaces/{id}/members`,
`DELETE /api/admin/workspaces/{id}/members/{userId}` — admin-only), and
`WorkspaceAccessService` membership gate. Position: after auth/role, before assignment —
no credentials → 401 (`JwtAuthenticationEntryPoint`; presented-but-rejected credentials
stay body-less 403, preserving the frontend dead-session path and the verified
deactivated-JWT test); non-members of a scoped resource's workspace get 404
(`ResourceNotFoundException`);
members failing assignment/ownership checks keep 403. Scoped reads: doctor record
read/create, patient single-record read and record list (filtered), `my-doctor`
(hidden → 204), review submit, doctor review reads (filtered), assigned-patient list
(filtered). Records inherit the assignment's workspace at creation; reassignments
inherit it; unscoped (null-workspace) rows keep V1 semantics. Admin audit endpoints
(metadata-only for record audits; direct admin record access removed per A28) bypass
the gate. Notifications/timeline stay owner-only (unchanged).

## 7. Configuration and operations

`application.yml` (dev/Postgres + JWT `${JWT_SECRET}`/`${JWT_EXPIRATION:1800000}` + CORS +
rate-limit 5/min login) with `local` (H2), `docker`, `prod` overlays; tests use
`application-test.yml` (H2 `create-drop`, Flyway off, 100/min). Compose: `db` (postgres:15),
`backend` (8080, `JWT_EXPIRATION=1800000`), `frontend` (nginx :80 → :3000). Postman:
`docs/api/medvault.postman_collection.json`. CI (`.github/workflows/ci.yml`): backend
`mvn -B verify` (JDK 21), frontend `npm ci` + `npm run build` (Node 20; `frontend/package.json`
declares `"engines": { "node": "^20.19.0 || ^22.13.0 || >=24.0.0" }`).
