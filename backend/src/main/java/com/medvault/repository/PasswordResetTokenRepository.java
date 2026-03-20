package com.medvault.repository;

import com.medvault.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    /**
     * Find token by token string and email
     */
    Optional<PasswordResetToken> findByTokenAndEmail(String token, String email);

    /**
     * Find token by token string only
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Find all tokens for an email
     */
    Optional<PasswordResetToken> findByEmail(String email);

    /**
     * Delete all expired tokens (cleanup)
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    int deleteExpiredTokens(LocalDateTime now);

    /**
     * Delete all used tokens (cleanup)
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.used = true")
    int deleteUsedTokens();

    /**
     * Delete all tokens for a specific email
     */
    @Transactional
    @Modifying
    void deleteByEmail(String email);
}
