-- Seed an Admin, Doctor, and Patient with the password 'password123'
-- The password hash was generated using BCrypt with strength 12
-- $2a$12$mtwB.nPQBJK5CQo8.nWuzegwMelmdZjofsZxFuaycgND1UMGzHT66

INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at)
VALUES 
    (gen_random_uuid(), 'Admin User', 'admin@medvault.com', '$2a$12$mtwB.nPQBJK5CQo8.nWuzegwMelmdZjofsZxFuaycgND1UMGzHT66', 'ROLE_ADMIN', true, NOW()),
    (gen_random_uuid(), 'Dr. John Doe', 'doctor@medvault.com', '$2a$12$mtwB.nPQBJK5CQo8.nWuzegwMelmdZjofsZxFuaycgND1UMGzHT66', 'ROLE_DOCTOR', false, NOW()),
    (gen_random_uuid(), 'Jane Patient', 'patient@medvault.com', '$2a$12$mtwB.nPQBJK5CQo8.nWuzegwMelmdZjofsZxFuaycgND1UMGzHT66', 'ROLE_PATIENT', true, NOW());
