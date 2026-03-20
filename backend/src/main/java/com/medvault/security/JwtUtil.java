package com.medvault.security;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.medvault.config.EnvironmentValidator;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    private final String secret;
    private final Long expiration;
    private final Key signingKey;

    /**
     * Constructor with environment validation. Fails fast if JWT_SECRET is
     * missing or insecure.
     */
    public JwtUtil(EnvironmentValidator envValidator) {
        logger.info("Initializing JwtUtil with validated environment variables");

        // Require and validate JWT_SECRET
        String rawSecret = envValidator.getPropertyOrDefault("jwt.secret", "ReplaceWithAStrongSecretKey123!@#");
        if (rawSecret == null) {
            throw new IllegalArgumentException("JWT secret cannot be null");
        }
        envValidator.validateJwtSecret(rawSecret);
        this.secret = rawSecret;

        // Get expiration with default fallback
        try {
            this.expiration = Long.parseLong(envValidator.getPropertyOrDefault("jwt.expiration", "86400000"));
            logger.info("JWT expiration set to: {} ms ({} hours)", this.expiration, this.expiration / 3600000);
        } catch (NumberFormatException e) {
            throw new IllegalStateException("Invalid JWT_EXPIRATION value.", e);
        }

        // Pre-compute signing key
        this.signingKey = Keys.hmacShaKeyFor(this.secret.getBytes());
        logger.info("JwtUtil initialized successfully");
    }

    private Key getSigningKey() {
        return signingKey;
    }

    public String generateToken(String userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("email", email);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    /**
     * Get token expiration time as LocalDateTime Used for blacklisting tokens
     * on logout
     */
    public LocalDateTime getExpirationFromToken(String token) {
        Date expirationDate = extractAllClaims(token).getExpiration();
        return LocalDateTime.ofInstant(expirationDate.toInstant(), ZoneId.systemDefault());
    }

    public boolean validateToken(String token, String email) {
        return extractEmail(token).equals(email) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
