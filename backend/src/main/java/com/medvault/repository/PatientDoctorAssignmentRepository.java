package com.medvault.repository;

import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientDoctorAssignmentRepository extends JpaRepository<PatientDoctorAssignment, UUID> {

    /** Check if a patient already has ANY active assignment. */
    boolean existsByPatientIdAndIsActiveTrue(UUID patientId);

    /** Check if a specific patient-doctor active assignment exists. */
    boolean existsByPatientAndDoctorAndIsActiveTrue(User patient, User doctor);

    /** Find the single active assignment for a patient. */
    Optional<PatientDoctorAssignment> findByPatientIdAndIsActiveTrue(UUID patientId);

    /** Find all active assignments for a doctor (with fetch joins to avoid N+1). */
    @Query("SELECT a FROM PatientDoctorAssignment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.doctor.id = :doctorId AND a.isActive = true")
    List<PatientDoctorAssignment> findAllActiveByDoctorId(@Param("doctorId") UUID doctorId);

    /** Find all active assignments (for admin view) with fetch joins. */
    @Query("SELECT a FROM PatientDoctorAssignment a JOIN FETCH a.patient JOIN FETCH a.doctor WHERE a.isActive = true ORDER BY a.assignedAt DESC")
    List<PatientDoctorAssignment> findAllActiveWithDetails();

    /** Legacy compat — find all assignments by patient regardless of active state. */
    List<PatientDoctorAssignment> findByPatient_Id(UUID patientId);

    /** Legacy compat — check if specific assignment exists (used in doctor service). */
    boolean existsByPatientAndDoctor(User patient, User doctor);
}
