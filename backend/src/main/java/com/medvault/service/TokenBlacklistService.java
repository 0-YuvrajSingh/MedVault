package com.medvault.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing JWT token blacklist
 * When users logout, their tokens are added to this blacklist
 * Tokens are checked against this before granting access
 * 
 * Supports both Redis-backed (distributed) and in-memory (single-server) implementations
 * Use Redis for production multi-server deployments
 */
@Service
public class TokenBlacklistService {
    
    // In-memory blacklist only
    private final Map<String, LocalDateTime> inMemoryBlacklist = new ConcurrentHashMap<>();

    public TokenBlacklistService() {
        // Only in-memory blacklist
        System.out.println("⚠️ WARNING: Using in-memory token blacklist. Tokens will not persist across restarts.");
    }

    /**
     * Add a token to the blacklist with automatic expiration
     * @param token JWT token to blacklist
     * @param expiresAt When the token expires (Redis will auto-delete after this)
     */
    public void blacklistToken(String token, LocalDateTime expiresAt) {
        inMemoryBlacklist.put(token, expiresAt);
        cleanExpiredTokens();
    }

    /**
     * Check if a token is blacklisted
     * @param token JWT token to check
     * @return true if token is blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        cleanExpiredTokens();
        return inMemoryBlacklist.containsKey(token);
    }

    /**
     * Remove a token from the blacklist (if needed)
     * @param token JWT token to remove
     */
    public void removeFromBlacklist(String token) {
        inMemoryBlacklist.remove(token);
    }

    /**
     * Get the approximate number of tokens currently blacklisted
     * @return count of blacklisted tokens
     */
    public long getBlacklistSize() {
        cleanExpiredTokens();
        return inMemoryBlacklist.size();
    }

    /**
     * Clear all blacklisted tokens (use with caution)
     */
    public void clearBlacklist() {
        inMemoryBlacklist.clear();
    }
    
    /**
     * Remove expired tokens from in-memory blacklist (cleanup)
     */
    private void cleanExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        inMemoryBlacklist.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
