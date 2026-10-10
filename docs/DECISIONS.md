# DECISIONS.md — Durable decisions

Prior Phase 0/1 source material was unrecoverable (no artifacts found in-repo). D2–D4
definitions below record only what the bootstrap authorization established; their fuller
original meanings, if any existed, are marked unrecoverable rather than fabricated.

## D1 — Keep the workspace layer, narrowed to access control (Accepted)

- Decision: retain a workspace membership layer as a planned MedVault authorization
  boundary **for access control only** (user decision 2026-10-10, respecting
  `MedVault_Scope_v1.docx` §2). Dependency graphs / cycle detection, release state
  machines, readiness gates / derived readiness, and scope locking are AgileTrack-owned
  and out of MedVault scope. Existing role checks and assignment-ownership checks remain
  authoritative; the workspace gate must not weaken them.
- Consequences: `SCOPE.md` defines the workspace narrowly (access-control boundary);
  `WALKTHROUGH.md` §6 documents the layer's position (after auth/role, before assignment);
  `PLAN.md` workspace authorization phase records the implemented model, APIs, and 21
  `WorkspaceIntegrationTest` tests; `README.md` carries the workspace boundary note.
- Status: Accepted. Implementation: IMPLEMENTED and verified (2026-10-10; 47/47 backend
  tests green).

## D2 — Accepted in principle; definition TBD by user (Deferred to post-release)

- Decision: Accepted in principle, per bootstrap authorization (user-confirmed 2026-10-10).
- Rationale/consequences: unrecoverable — no source material found in-repo or in
  `MedVault_Scope_v1.docx`. Recorded here to preserve the outcome without fabricating
  contents. Not authorization to implement an undefined requirement.
- Status: Accepted in principle; definition TBD by user. Implementation: UNVERIFIED — no code mapping claimed.
- Release disposition (decided 2026-10-10): **explicitly deferred out of this release scope** as a post-release item until defined by the user (see `docs/RELEASE_NOTES.md`). Original definitions unrecoverable; nothing inferred, nothing implemented, not silently dropped.

## D3 — Accepted in principle; definition TBD by user (Deferred to post-release)

- Decision: Accepted in principle, per bootstrap authorization (user-confirmed 2026-10-10).
- Rationale/consequences: unrecoverable — no source material found in-repo or in
  `MedVault_Scope_v1.docx`. No migration, seed, architectural, or behavioral constraints
  introduced.
- Status: Accepted in principle; definition TBD by user. Implementation: UNVERIFIED.
- Release disposition (decided 2026-10-10): **explicitly deferred out of this release scope** as a post-release item until defined by the user (see `docs/RELEASE_NOTES.md`).

## D4 — Accepted in principle; definition TBD by user (Deferred to post-release)

- Decision: Accepted in principle, per bootstrap authorization (user-confirmed 2026-10-10).
- Rationale/consequences: unrecoverable — no source material found in-repo or in
  `MedVault_Scope_v1.docx`. No endpoints, inputs, status codes, or assertions invented.
- Status: Accepted in principle; definition TBD by user. Covered as proposed-test only in
  `PLAN.md` core-tests phase.
- Release disposition (decided 2026-10-10): **explicitly deferred out of this release scope** as a post-release item until defined by the user (see `docs/RELEASE_NOTES.md`).

## D5 (PROPOSED) — Access-token lifetime after refresh-token removal

- Context (verified): V1 issues only short-lived access JWTs (30 min default,
  `JwtUtil` + `JWT_EXPIRATION`, no refresh-token code or table). "Removal" therefore means
  confirming a refresh-token-free posture stays in place.
- Proposal: retain **30-minute access-token lifetime** (`JWT_EXPIRATION=1800000`).
- Trade-off: 30 min bounds stolen-token exposure and preserves current UX (reauth twice
  hourly at worst) without adding rotation complexity; shorter (e.g. 15 min) would shrink
  exposure further but increase login friction, longer would do the opposite. Revisit only
  with explicit approval and a `DECISIONS.md` update.
- Status: PROPOSED — no auth code or config changed in bootstrap. Concise note added to
  `README.md` §7.

## D6 — Mandatory workspace on new assignments; legacy reassignment blocked (Accepted)

- Decision: new assignments must carry a `workspaceId` — requests omitting it are
  rejected (400), and unknown workspace IDs return 404. Reassignment of legacy
  null-workspace assignments is blocked (409) until a safe workspace transition is
  defined. Existing legacy rows keep V1 behavior; no backfill is authorized.
- Consequences: `POST /api/admin/assignments` requires `workspaceId`; reassignment of
  scoped assignments inherits the existing workspace while legacy null-workspace rows
  return 409 Conflict; `AUDIT.md` A22/A27 and `PLAN.md` record the verified behavior.
- Status: Accepted (policy). Implementation: IMPLEMENTED and verified (47/47 backend
  tests green) — no backfill performed, no shared/prod migration executed.

## D7 — Accept Tailwind CSS v3 dev/build-time advisories for this release; defer Tailwind v4 (Accepted)

- Decision (2026-10-10): accept the 7 remaining dev/build-time `npm audit` package entries
  (`2 moderate`, `5 high`) in the `tailwindcss@3.4.19` dependency tree (`braces@3.0.3`
  `GHSA-vfj7-8cjw-p6xm` High → `chokidar`, `micromatch`, `fast-glob`, `tailwindcss`; and
  `postcss-selector-parser@6.1.4` `GHSA-rj75-hqrm-r3gf` Moderate → `postcss-nested`,
  `tailwindcss`) for this release, and defer the breaking SemVer-major migration to
  Tailwind CSS v4 (`4.3.3`) to a future separately authorized phase.
- Rationale/consequences: all production runtime vulnerabilities were remediated
  (`npm audit --omit=dev` = `0 vulnerabilities`); none of the 7 remaining packages ship in
  the compiled `frontend/dist/` bundle or execute at runtime, and CSS/glob inputs are
  static and repository-controlled (`AUDIT.md` A29).
- Status: Accepted (release risk disposition). Implementation: documented in `AUDIT.md` A29,
  `RELEASE_NOTES.md`, and `PLAN.md`.
