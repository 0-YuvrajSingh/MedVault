package com.medvault.repository;

import com.medvault.model.DocumentPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentPermissionRepository extends JpaRepository<DocumentPermission, UUID> {
    
    List<DocumentPermission> findByDocument_Id(UUID documentId);
    
    List<DocumentPermission> findByDoctor_Id(UUID doctorId);
    
    List<DocumentPermission> findByDocument_Patient_Id(UUID patientId);
    
    Optional<DocumentPermission> findByDocument_IdAndDoctor_Id(UUID documentId, UUID doctorId);
    
    List<DocumentPermission> findByIsActive(Boolean isActive);
    
    List<DocumentPermission> findByDoctor_IdAndIsActive(UUID doctorId, Boolean isActive);
}
