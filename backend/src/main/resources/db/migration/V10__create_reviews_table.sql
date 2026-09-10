CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_doctor_id ON reviews(doctor_id);

-- Seed one review for Dr. John Doe (from Jane Patient).
-- NOTE: exactly one row per (patient_id, doctor_id) — V13/V15 enforce
-- UNIQUE(patient_id, doctor_id). Do not add a second seed row for the same pair.
INSERT INTO reviews (id, doctor_id, patient_id, rating, comment, created_at)
SELECT gen_random_uuid(), d.id, p.id, 5, 'Dr. Doe is very thorough and caring. He took the time to explain everything clearly.', NOW() - INTERVAL '10 days'
FROM users d, users p WHERE d.email = 'doctor@medvault.com' AND p.email = 'patient@medvault.com'
ON CONFLICT DO NOTHING;
