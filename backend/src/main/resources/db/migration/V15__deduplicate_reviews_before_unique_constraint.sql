-- V15: safety net for the V10 -> V13 duplicate-review history.
-- V10 once seeded two rows for the same (patient_id, doctor_id) pair and V13 adds
-- UNIQUE(patient_id, doctor_id). V13 now dedups first, but this migration repairs any
-- database that already contains duplicates (e.g. partially migrated or manually fixed
-- instances) and guarantees the unique index exists. Idempotent: safe to run repeatedly.

-- 1-3. Detect duplicate (patient_id, doctor_id) pairs, keep the earliest row, delete the rest.
DELETE FROM reviews r
USING reviews keeper
WHERE r.patient_id = keeper.patient_id
  AND r.doctor_id = keeper.doctor_id
  AND r.created_at > keeper.created_at;

DELETE FROM reviews r
USING reviews keeper
WHERE r.patient_id = keeper.patient_id
  AND r.doctor_id = keeper.doctor_id
  AND r.created_at = keeper.created_at
  AND r.ctid > keeper.ctid;

-- 4. Fail loudly if any duplicates remain (guards the index creation below).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM reviews GROUP BY patient_id, doctor_id HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Duplicate (patient_id, doctor_id) reviews remain; refusing to create unique index';
    END IF;
END $$;

-- 5. Ensure the one-review-per-pair index exists (IF NOT EXISTS: no-op where V13 succeeded).
CREATE UNIQUE INDEX IF NOT EXISTS idx_review_unique_patient_doctor
    ON reviews(patient_id, doctor_id);
