package com.medvault.repository;

import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PatientDoctorAssignmentRepository extends JpaRepository<PatientDoctorAssignment, UUID> {
    boolean existsByPatientAndDoctor(User patient, User doctor);
}
