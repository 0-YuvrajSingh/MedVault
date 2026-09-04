-- One review per patient-doctor pair (enforced at DB level in addition to service layer)

-- Add updated_at column for upsert tracking
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Add foreign key constraints for referential integrity (reviews only store IDs currently)
-- These are soft references — we don't cascade delete to preserve review history

-- Unique constraint: each patient can have at most one review per doctor
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_unique_patient_doctor
    ON reviews(patient_id, doctor_id);

-- Index for efficient doctor review lookups
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON reviews(patient_id);
