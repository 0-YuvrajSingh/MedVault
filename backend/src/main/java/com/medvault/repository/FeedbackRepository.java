package com.medvault.repository;

import com.medvault.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    List<Feedback> findByDoctor_Id(UUID doctorId);

    List<Feedback> findByPatient_Id(UUID patientId);

    List<Feedback> findByDoctor_IdOrderByCreatedAtDesc(UUID doctorId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.doctor.id = :doctorId AND f.rating IS NOT NULL")
    Double findAverageRatingByDoctor(@Param("doctorId") UUID doctorId);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.doctor.id = :doctorId")
    Long countByDoctor(@Param("doctorId") UUID doctorId);
}
