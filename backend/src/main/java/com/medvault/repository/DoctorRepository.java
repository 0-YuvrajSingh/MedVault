package com.medvault.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.medvault.model.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    Optional<Doctor> findByUserId(UUID userId);
    Optional<Doctor> findByLicenseNumber(String licenseNumber);
    boolean existsByLicenseNumber(String licenseNumber);
    List<Doctor> findBySpecialization(String specialization);
    List<Doctor> findByIsVerified(Boolean isVerified);
    // Advanced search methods with pagination
    Page<Doctor> findByIsVerified(Boolean isVerified, Pageable pageable);
    Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);
    @Query("SELECT d FROM Doctor d WHERE " +
           "LOWER(d.user.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Doctor> findByUserNameContaining(@Param("name") String name, Pageable pageable);
    @Query("SELECT d FROM Doctor d WHERE " +
           "d.isVerified = :isVerified AND " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))")
    Page<Doctor> findByVerifiedAndSpecialization(
        @Param("isVerified") Boolean isVerified, 
        @Param("specialization") String specialization, 
        Pageable pageable
    );
    @Query("SELECT d FROM Doctor d WHERE " +
           "d.isVerified = :isVerified AND " +
           "LOWER(d.user.name) LIKE LOWER(CONCAT('%', :name, '%'))" )
    Page<Doctor> findByVerifiedAndName(
        @Param("isVerified") Boolean isVerified, 
        @Param("name") String name, 
        Pageable pageable
    );
    @Query("SELECT d FROM Doctor d WHERE " +
           "d.isVerified = :isVerified AND " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%')) AND " +
           "LOWER(d.user.name) LIKE LOWER(CONCAT('%', :name, '%'))" )
    Page<Doctor> findByAllFilters(
        @Param("isVerified") Boolean isVerified,
        @Param("specialization") String specialization,
        @Param("name") String name,
        Pageable pageable
    );
    Page<Doctor> findByExperienceYearsGreaterThanEqual(Integer years, Pageable pageable);
    @Query("SELECT d FROM Doctor d WHERE " +
           "d.isVerified = :isVerified AND " +
           "d.experienceYears >= :years")
    Page<Doctor> findByVerifiedAndExperience(
        @Param("isVerified") Boolean isVerified,
        @Param("years") Integer years,
        Pageable pageable
    );
}
