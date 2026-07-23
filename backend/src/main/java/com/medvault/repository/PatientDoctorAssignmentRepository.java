package com.medvault.repository;

import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PatientDoctorAssignmentRepository extends JpaRepository<PatientDoctorAssignment, UUID> {
    boolean existsByPatientAndDoctor(User patient, User doctor);
    java.util.List<PatientDoctorAssignment> findAllByDoctorId(UUID doctorId);
    java.util.Optional<PatientDoctorAssignment> findByPatientIdAndDoctorId(UUID patientId, UUID doctorId);
    java.util.List<PatientDoctorAssignment> findByPatient_Id(UUID patientId);
}
