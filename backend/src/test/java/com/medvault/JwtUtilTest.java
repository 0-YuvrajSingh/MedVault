package com.medvault;

import com.medvault.entity.User;
import com.medvault.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 1800000L);
    }

    @Test
    void testGenerateTokenAndExtractUserId() {
        User user = new User();
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        user.setRole("ROLE_PATIENT");

        String token = jwtUtil.generateToken(user);
        assertNotNull(token);

        String extractedId = jwtUtil.extractUserId(token);
        assertEquals(userId.toString(), extractedId);
    }

    @Test
    void testExtractRole() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole("ROLE_DOCTOR");

        String token = jwtUtil.generateToken(user);

        String role = jwtUtil.extractRole(token);
        assertEquals("ROLE_DOCTOR", role);
    }

    @Test
    void testValidateToken() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole("ROLE_ADMIN");

        String token = jwtUtil.generateToken(user);

        assertTrue(jwtUtil.validateToken(token));
    }
}
