package com.medvault.repository;

import com.medvault.entity.MedicalRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    @EntityGraph(attributePaths = {"patient", "doctor"})
    Page<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(UUID patientId, Pageable pageable);
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<MedicalRecord> findByPatientId(UUID patientId);

    /**
     * Records visible to a caller: unscoped (V1) rows plus rows in workspaces where the
     * caller is an active member. Count query matches so pagination totals never reveal
     * hidden rows.
     */
    @EntityGraph(attributePaths = {"patient", "doctor"})
    @Query(value = "SELECT r FROM MedicalRecord r WHERE r.patient.id = :patientId"
            + " AND (r.workspace IS NULL OR r.workspace.id IN"
            + " (SELECT m.workspace.id FROM WorkspaceMembership m"
            + " WHERE m.user.id = :userId AND m.isActive = true))"
            + " ORDER BY r.createdAt DESC",
            countQuery = "SELECT COUNT(r) FROM MedicalRecord r WHERE r.patient.id = :patientId"
            + " AND (r.workspace IS NULL OR r.workspace.id IN"
            + " (SELECT m.workspace.id FROM WorkspaceMembership m"
            + " WHERE m.user.id = :userId AND m.isActive = true))")
    Page<MedicalRecord> findVisibleByPatientId(@Param("patientId") UUID patientId,
                                               @Param("userId") UUID userId,
                                               Pageable pageable);
}
