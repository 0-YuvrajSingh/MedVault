CREATE TABLE patient_doctor_assignments (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES users(id)
);
