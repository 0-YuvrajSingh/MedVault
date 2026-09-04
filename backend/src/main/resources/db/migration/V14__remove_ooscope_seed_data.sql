-- Remove out-of-scope seed data inserted by V8 and V9 migrations.
-- Appointments are not part of V1. These notifications and timeline events
-- were seeded with incorrect event types.

-- Remove appointment-type notifications seeded by V8
DELETE FROM notifications
WHERE title IN ('Appointment Reminder', 'Appointment Confirmed', 'Upcoming Appointment');

-- Remove appointment-type timeline events seeded by V9
DELETE FROM timeline_events
WHERE event_type = 'APPOINTMENT';
