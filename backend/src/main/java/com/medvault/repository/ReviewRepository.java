package com.medvault.repository;

import com.medvault.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId);

    Page<Review> findByDoctorIdOrderByCreatedAtDesc(UUID doctorId, Pageable pageable);

    Optional<Review> findByPatientIdAndDoctorId(UUID patientId, UUID doctorId);

    boolean existsByPatientIdAndDoctorId(UUID patientId, UUID doctorId);

    /**
     * Reviews visible to a doctor: those whose reviewer has no workspace-scoped active
     * assignment outside the doctor's memberships. Count query matches so pagination
     * totals never reveal hidden rows.
     */
    @Query(value = "SELECT r FROM Review r WHERE r.doctorId = :doctorId"
            + " AND NOT EXISTS (SELECT a FROM PatientDoctorAssignment a WHERE a.patient.id = r.patientId"
            + " AND a.isActive = true AND a.workspace IS NOT NULL AND a.workspace.id NOT IN"
            + " (SELECT m.workspace.id FROM WorkspaceMembership m"
            + " WHERE m.user.id = :doctorId AND m.isActive = true))"
            + " ORDER BY r.createdAt DESC",
            countQuery = "SELECT COUNT(r) FROM Review r WHERE r.doctorId = :doctorId"
            + " AND NOT EXISTS (SELECT a FROM PatientDoctorAssignment a WHERE a.patient.id = r.patientId"
            + " AND a.isActive = true AND a.workspace IS NOT NULL AND a.workspace.id NOT IN"
            + " (SELECT m.workspace.id FROM WorkspaceMembership m"
            + " WHERE m.user.id = :doctorId AND m.isActive = true))")
    Page<Review> findVisibleByDoctorId(@Param("doctorId") UUID doctorId, Pageable pageable);
}
