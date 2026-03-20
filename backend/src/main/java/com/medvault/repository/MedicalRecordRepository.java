package com.medvault.repository;

import com.medvault.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    
    List<MedicalRecord> findByPatient_Id(UUID patientId);
    
    List<MedicalRecord> findByDoctor_Id(UUID doctorId);
    
    List<MedicalRecord> findByPatient_IdOrderByRecordDateDesc(UUID patientId);
    
    List<MedicalRecord> findByDoctor_IdOrderByRecordDateDesc(UUID doctorId);
    
    List<MedicalRecord> findByRecordDateBetween(LocalDateTime start, LocalDateTime end);
    
    List<MedicalRecord> findByPatient_IdAndRecordDateBetween(UUID patientId, LocalDateTime start, LocalDateTime end);
}
