-- Platform-level audit log for system/business events
-- Separate from the medical-record-scoped audit_log table

CREATE TABLE platform_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    detail TEXT,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_platform_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_platform_audit_action ON platform_audit_log(action);
CREATE INDEX idx_platform_audit_performed_at ON platform_audit_log(performed_at DESC);
