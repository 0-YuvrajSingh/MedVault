-- Seed an Admin, Doctor, and Patient with the password 'password123'
-- The password hash was generated using BCrypt with strength 12
-- $2a$12$R.P1eEw.3g7yT6gR6/Yp.enT.y8L01GzXy0H5XkYv8G9kP5hD1uXW

INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active, created_at)
VALUES 
    (gen_random_uuid(), 'Admin', 'User', 'admin@medvault.com', '$2a$12$R.P1eEw.3g7yT6gR6/Yp.enT.y8L01GzXy0H5XkYv8G9kP5hD1uXW', 'ROLE_ADMIN', true, NOW()),
    (gen_random_uuid(), 'John', 'Doe', 'doctor@medvault.com', '$2a$12$R.P1eEw.3g7yT6gR6/Yp.enT.y8L01GzXy0H5XkYv8G9kP5hD1uXW', 'ROLE_DOCTOR', false, NOW()),
    (gen_random_uuid(), 'Jane', 'Doe', 'patient@medvault.com', '$2a$12$R.P1eEw.3g7yT6gR6/Yp.enT.y8L01GzXy0H5XkYv8G9kP5hD1uXW', 'ROLE_PATIENT', true, NOW());
