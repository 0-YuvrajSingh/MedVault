package com.medvault.repository;

import com.medvault.model.PendingDoctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PendingDoctorRepository extends JpaRepository<PendingDoctor, UUID> {

    Optional<PendingDoctor> findByUserId(UUID userId);

    boolean existsByLicenseNumber(String licenseNumber);

    void deleteByUserId(UUID userId);
}
