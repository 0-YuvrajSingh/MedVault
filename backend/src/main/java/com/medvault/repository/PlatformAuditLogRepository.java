package com.medvault.repository;

import com.medvault.entity.PlatformAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PlatformAuditLogRepository extends JpaRepository<PlatformAuditLog, UUID> {
    Page<PlatformAuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
    Page<PlatformAuditLog> findByActionOrderByPerformedAtDesc(String action, Pageable pageable);
}
