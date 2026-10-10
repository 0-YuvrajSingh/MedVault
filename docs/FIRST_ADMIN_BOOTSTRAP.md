# First-admin bootstrap (production)

The application intentionally provides **no default admin, no seed credentials, and no
self-registration path for `ROLE_ADMIN`** (`AuthService` rejects it; `DatabaseSeeder`
runs only on `local`/`dev` profiles). Create the first admin directly in the database
using a locally generated BCrypt hash. Never commit credentials or reuse passwords.

## Procedure (documented; execute only against the approved target with a backup)

1. Generate a BCrypt hash locally (cost factor 10+; the app verifies with BCrypt-12
   `PasswordEncoder`, which accepts any valid BCrypt hash):
   - Example (scratch container, nothing persisted):
     `docker run --rm maven:3.9-eclipse-temurin-21 ...`
     — or any trusted local BCrypt tool. Keep the plaintext in a vault, never in chat,
     tickets, or files.
2. Insert exactly one row (replace placeholders; UUID must be fresh):
   ```sql
   INSERT INTO users (id, full_name, email, password_hash, role, is_active)
   VALUES (gen_random_uuid(), 'Site Administrator', 'ADMIN_EMAIL', 'BCRYPT_HASH',
           'ROLE_ADMIN', true);
   ```
3. Verify: `POST /api/auth/login` with the admin email + plaintext returns a JWT;
   `GET /api/admin/users` with that JWT returns 200.
4. Rotate the bootstrap password immediately via `POST /api/user/change-password`,
   then delete any local copies of the plaintext.

## Constraints

- Perform step 2 only on the explicitly approved target database, after the verified
  backup required by the deployment gate.
- One row only; confirm `SELECT count(*) FROM users WHERE role = 'ROLE_ADMIN'` before
  and after to prove nothing else was created or altered.
- This procedure has been documented from code evidence, not executed against any
  shared/production database in this phase.
