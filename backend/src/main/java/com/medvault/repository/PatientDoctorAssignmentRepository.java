package com.medvault.repository;

import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientDoctorAssignmentRepository extends JpaRepository<PatientDoctorAssignment, Long> {
    boolean existsByPatientAndDoctorAndIsActiveTrue(User patient, User doctor);
    List<PatientDoctorAssignment> findByPatientIdAndIsActiveTrue(Long patientId);
    List<PatientDoctorAssignment> findByDoctorIdAndIsActiveTrue(Long doctorId);
}
