package com.medvault.repository;

import com.medvault.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    @EntityGraph(attributePaths = {"record", "performedBy"})
    List<AuditLog> findByRecordIdOrderByPerformedAtDesc(UUID recordId);

    @EntityGraph(attributePaths = {"record", "performedBy"})
    Page<AuditLog> findByRecordIdOrderByPerformedAtDesc(UUID recordId, Pageable pageable);
}
