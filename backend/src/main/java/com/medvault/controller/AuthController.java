package com.medvault.controller;

import com.medvault.dto.AuthRequestDTO;
import com.medvault.dto.AuthResponseDTO;
import com.medvault.dto.LoginRequestDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.service.AuthService;
import com.medvault.service.TokenBlacklistService;
import com.medvault.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, 
                         TokenBlacklistService tokenBlacklistService,
                         JwtUtil jwtUtil) {
        this.authService = authService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @com.medvault.annotation.LogAudit(action = "REGISTER", details = "User registration")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody AuthRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered", response));
    }

    @PostMapping("/login")
    @com.medvault.annotation.LogAudit(action = "LOGIN", details = "User login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        AuthResponseDTO response = authService.getCurrentUser(email);
        return ResponseEntity.ok(ApiResponse.success("Current user fetched", response));
    }

    /**
     * Logout endpoint - blacklists the current JWT token
     * After logout, the token cannot be used again
     */
    @PostMapping("/logout")
    @com.medvault.annotation.LogAudit(action = "LOGOUT", details = "User logout")
    public ResponseEntity<ApiResponse<?>> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract token from "Bearer <token>" format
            String token = authHeader.substring(7);
            
            // Get token expiration time from JWT
            LocalDateTime expiresAt = jwtUtil.getExpirationFromToken(token);
            
            // Add token to blacklist
            tokenBlacklistService.blacklistToken(token, expiresAt);
            
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully", Map.of(
                "logoutAt", LocalDateTime.now()
            )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Logout failed: " + e.getMessage()));
        }
    }
}
