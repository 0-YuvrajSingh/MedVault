-- V16: remove remaining out-of-scope seed rows left behind by V14.
-- V14 deleted appointment-type seeds, but lab/prescription-themed seeds from V8/V9
-- survived. Lab file uploads and prescription/pharmacy management are explicitly out
-- of V1 scope, so these seed rows do not belong on fresh installs. Idempotent.

DELETE FROM notifications
WHERE title IN ('Lab Results Available');

DELETE FROM timeline_events
WHERE title IN ('Prescription Refilled', 'Lab Review Session', 'Lab Results Updated');
