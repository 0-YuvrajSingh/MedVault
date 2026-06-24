CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detail_snapshot TEXT,
    CONSTRAINT fk_audit_record FOREIGN KEY (record_id) REFERENCES medical_records(id),
    CONSTRAINT fk_audit_user FOREIGN KEY (performed_by) REFERENCES users(id)
);
