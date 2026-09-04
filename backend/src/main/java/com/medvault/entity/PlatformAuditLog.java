package com.medvault.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Platform-level audit log for important business/security events.
 * Separate from the medical-record audit log (AuditLog) which is tightly
 * coupled to the MedicalRecord entity.
 */
@Entity
@Table(name = "platform_audit_log",
        indexes = {
                @Index(name = "idx_platform_audit_action", columnList = "action"),
                @Index(name = "idx_platform_audit_performed_at", columnList = "performed_at")
        })
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The user who performed the action. Nullable for system-generated events. */
    @Column(name = "actor_id")
    private UUID actorId;

    /** Action name, e.g. DOCTOR_APPROVED, PATIENT_ASSIGNED, LOGIN. */
    @Column(nullable = false, length = 50)
    private String action;

    /** Type of entity affected, e.g. "User", "Assignment". */
    @Column(name = "entity_type", length = 50)
    private String entityType;

    /** ID of the affected entity. */
    @Column(name = "entity_id")
    private UUID entityId;

    /** Human-readable detail snapshot. */
    @Column(columnDefinition = "TEXT")
    private String detail;

    @CreationTimestamp
    @Column(name = "performed_at", updatable = false, nullable = false)
    private LocalDateTime performedAt;
}
