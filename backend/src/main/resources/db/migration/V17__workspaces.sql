-- Workspace membership boundary (D1, access control only).
-- Purely additive: new tables plus nullable workspace references. No existing rows are
-- modified, no columns are narrowed or dropped, no backfill is performed here.
-- Rows with NULL workspace_id keep their V1 (unscoped) access semantics.

CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workspace_memberships (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_membership_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
    CONSTRAINT fk_membership_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uq_membership_workspace_user UNIQUE (workspace_id, user_id)
);

CREATE INDEX idx_membership_workspace ON workspace_memberships(workspace_id);
CREATE INDEX idx_membership_user ON workspace_memberships(user_id);

ALTER TABLE patient_doctor_assignments
    ADD COLUMN workspace_id UUID,
    ADD CONSTRAINT fk_assignment_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

ALTER TABLE medical_records
    ADD COLUMN workspace_id UUID,
    ADD CONSTRAINT fk_record_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id);

CREATE INDEX idx_assignment_workspace ON patient_doctor_assignments(workspace_id);
CREATE INDEX idx_record_workspace ON medical_records(workspace_id);
