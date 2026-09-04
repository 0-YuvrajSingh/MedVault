package com.medvault.service;

import com.medvault.entity.AuditLog;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.PlatformAuditLog;
import com.medvault.entity.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.PlatformAuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;
    private final PlatformAuditLogRepository platformAuditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository, PlatformAuditLogRepository platformAuditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.platformAuditLogRepository = platformAuditLogRepository;
    }

    /**
     * Records a medical-record-scoped audit event.
     * Must be called within a @Transactional context so it is atomically
     * committed or rolled back with the parent operation.
     */
    public void logAction(MedicalRecord record, User performedBy, String action, String snapshot) {
        AuditLog auditLog = AuditLog.builder()
                .record(record)
                .action(action)
                .performedBy(performedBy)
                .detailSnapshot(snapshot)
                .build();
        auditLogRepository.save(auditLog);
    }

    /**
     * Records a platform-level audit event for system/business events such as
     * doctor approval, assignment changes, or logins.
     *
     * @param actorId    UUID of the user performing the action (null for system events)
     * @param action     action name e.g. DOCTOR_APPROVED, PATIENT_ASSIGNED
     * @param entityType type of affected entity e.g. "User", "Assignment"
     * @param entityId   ID of the affected entity
     * @param detail     human-readable detail
     */
    public void logPlatformEvent(UUID actorId, String action, String entityType, UUID entityId, String detail) {
        try {
            PlatformAuditLog entry = PlatformAuditLog.builder()
                    .actorId(actorId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .detail(detail)
                    .build();
            platformAuditLogRepository.save(entry);
        } catch (Exception e) {
            // Audit failures should never abort the business operation
            log.error("Failed to write platform audit event [{}]: {}", action, e.getMessage(), e);
        }
    }

    public Page<PlatformAuditLog> getPlatformAuditLogs(Pageable pageable) {
        return platformAuditLogRepository.findAllByOrderByPerformedAtDesc(pageable);
    }
}
