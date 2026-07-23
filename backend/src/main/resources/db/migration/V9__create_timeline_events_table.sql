CREATE TABLE timeline_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(30) NOT NULL,
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeline_events_user_id ON timeline_events(user_id);
CREATE INDEX idx_timeline_events_event_date ON timeline_events(event_date DESC);

-- Seed timeline events for doctor
INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Consultation with Jane Patient', 'Routine checkup and medication review. Prescription updated.', 'APPOINTMENT', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'
FROM users WHERE email = 'doctor@medvault.com';

INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'New Patient Records Created', 'Created medical records for a newly assigned patient.', 'RECORD_CREATED', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM users WHERE email = 'doctor@medvault.com';

INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Lab Review Session', 'Reviewed lab results for 2 patients. Noted abnormal findings in one case.', 'OTHER', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM users WHERE email = 'doctor@medvault.com';

INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Upcoming: Weekly Checkup', 'Scheduled weekly checkup with patient.', 'APPOINTMENT', CURRENT_DATE + INTERVAL '2 days', NOW()
FROM users WHERE email = 'doctor@medvault.com';

-- Seed timeline events for patient
INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Routine Checkup', 'Attended routine checkup with Dr. John Doe. All vitals normal.', 'APPOINTMENT', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'
FROM users WHERE email = 'patient@medvault.com';

INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Lab Results Updated', 'Blood work results have been added to your records.', 'RECORD_CREATED', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'
FROM users WHERE email = 'patient@medvault.com';

INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Prescription Refilled', 'Your medication prescription has been renewed for 30 days.', 'RECORD_UPDATED', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'
FROM users WHERE email = 'patient@medvault.com';

INSERT INTO timeline_events (id, user_id, title, description, event_type, event_date, created_at)
SELECT gen_random_uuid(), id, 'Upcoming Appointment', 'Scheduled follow-up appointment with Dr. John Doe.', 'APPOINTMENT', CURRENT_DATE + INTERVAL '2 days', NOW()
FROM users WHERE email = 'patient@medvault.com';
