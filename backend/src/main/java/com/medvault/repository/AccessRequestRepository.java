package com.medvault.repository;

import com.medvault.model.AccessRequest;
import com.medvault.model.AccessRequestStatus;
import com.medvault.model.Doctor;
import com.medvault.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, UUID> {
    
    List<AccessRequest> findByPatient(Patient patient);
    
    List<AccessRequest> findByDoctor(Doctor doctor);
    
    List<AccessRequest> findByPatientAndStatus(Patient patient, AccessRequestStatus status);
    
    List<AccessRequest> findByDoctorAndStatus(Doctor doctor, AccessRequestStatus status);
    
    List<AccessRequest> findByStatus(AccessRequestStatus status);
    
    boolean existsByDoctorAndPatientAndStatus(Doctor doctor, Patient patient, AccessRequestStatus status);
}
