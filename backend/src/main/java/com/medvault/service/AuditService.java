package com.medvault.service;

import com.medvault.entity.AuditLog;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.User;
import com.medvault.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(MedicalRecord record, User performedBy, String action, String snapshot) {
        AuditLog auditLog = AuditLog.builder()
                .record(record)
                .action(action)
                .performedBy(performedBy)
                .detailSnapshot(snapshot)
                .build();
        auditLogRepository.save(auditLog);
    }
}
