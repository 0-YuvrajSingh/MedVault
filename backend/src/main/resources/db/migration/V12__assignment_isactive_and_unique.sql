-- Add is_active column to patient_doctor_assignments if it doesn't exist
-- (V2 created the column but the entity didn't model it; this migration normalises the state)

-- Ensure is_active is set consistently (existing rows should be active)
UPDATE patient_doctor_assignments
SET is_active = true
WHERE is_active IS NULL;

ALTER TABLE patient_doctor_assignments
    ALTER COLUMN is_active SET NOT NULL,
    ALTER COLUMN is_active SET DEFAULT true;

-- Enforce database-level uniqueness: one patient may have at most one active assignment.
-- This prevents concurrent requests from creating duplicate active assignments even if
-- the Java service-level check is bypassed.
CREATE UNIQUE INDEX idx_assignment_unique_active_patient
    ON patient_doctor_assignments(patient_id)
    WHERE is_active = true;
