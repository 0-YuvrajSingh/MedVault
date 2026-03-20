package com.medvault.repository;

import com.medvault.model.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, UUID> {

    /**
     * Find OTP by email and OTP code
     */
    Optional<EmailVerificationOtp> findByEmailAndOtp(String email, String otp);

    /**
     * Find most recent OTP for an email
     */
    Optional<EmailVerificationOtp> findFirstByEmailOrderByCreatedAtDesc(String email);

    /**
     * Find unused OTP by email
     */
    Optional<EmailVerificationOtp> findByEmailAndUsedFalse(String email);

    /**
     * Delete all expired OTPs (cleanup)
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM EmailVerificationOtp o WHERE o.expiresAt < :now")
    int deleteExpiredOtps(LocalDateTime now);

    /**
     * Delete all used OTPs (cleanup)
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM EmailVerificationOtp o WHERE o.used = true")
    int deleteUsedOtps();

    /**
     * Delete all OTPs for a specific email
     */
    @Transactional
    @Modifying
    void deleteByEmail(String email);
}
