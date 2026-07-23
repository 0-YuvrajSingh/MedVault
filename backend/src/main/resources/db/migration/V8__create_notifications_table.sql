CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(20) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Seed notifications for doctor
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'Welcome to MedVault', 'Your doctor account has been created. Complete your profile to get started.', 'SUCCESS', false, NOW() - INTERVAL '7 days'
FROM users WHERE email = 'doctor@medvault.com';

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'New Patient Assigned', 'You have been assigned a new patient. Review their records at your earliest convenience.', 'INFO', false, NOW() - INTERVAL '3 days'
FROM users WHERE email = 'doctor@medvault.com';

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'Record Update', 'Patient Jane Patient has a new medical record that requires your review.', 'WARNING', false, NOW() - INTERVAL '1 day'
FROM users WHERE email = 'doctor@medvault.com';

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'Appointment Reminder', 'You have a consultation scheduled for tomorrow at 10:00 AM.', 'INFO', true, NOW() - INTERVAL '2 days'
FROM users WHERE email = 'doctor@medvault.com';

-- Seed notifications for patient
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'Welcome to MedVault', 'Your patient portal is ready. You can now view your medical records securely.', 'SUCCESS', false, NOW() - INTERVAL '7 days'
FROM users WHERE email = 'patient@medvault.com';

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'New Record Added', 'A new medical record has been created by your doctor.', 'INFO', false, NOW() - INTERVAL '3 days'
FROM users WHERE email = 'patient@medvault.com';

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'Appointment Confirmed', 'Your checkup appointment has been confirmed for next Monday at 9:00 AM.', 'SUCCESS', false, NOW() - INTERVAL '1 day'
FROM users WHERE email = 'patient@medvault.com';

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
SELECT gen_random_uuid(), id, 'Lab Results Available', 'Your recent lab results are now available for review.', 'INFO', true, NOW() - INTERVAL '5 days'
FROM users WHERE email = 'patient@medvault.com';
