package com.medvault.repository;

import com.medvault.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    List<Review> findByPatient_Id(UUID patientId);
    
    List<Review> findByDoctor_Id(UUID doctorId);
    
    List<Review> findByDoctor_IdOrderByReviewDateDesc(UUID doctorId);
    
    List<Review> findByRating(Integer rating);
    
    List<Review> findByDoctor_IdAndRating(UUID doctorId, Integer rating);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double findAverageRatingByDoctorId(@Param("doctorId") UUID doctorId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.doctor.id = :doctorId")
    Long countReviewsByDoctorId(@Param("doctorId") UUID doctorId);
}
