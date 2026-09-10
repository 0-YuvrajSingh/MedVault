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
}
