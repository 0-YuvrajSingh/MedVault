package com.medvault.repository;

import com.medvault.entity.MedicalRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
