package com.medvault.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medvault.dto.ApiResponse;
import com.medvault.model.User;
import com.medvault.repository.UserRepository;
import com.medvault.service.EmailService;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetController(EmailService emailService, 
                                  UserRepository userRepository,
                                  PasswordEncoder passwordEncoder) {
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Request password reset - sends email with token
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }

        // Check if user exists
        User user = userRepository.findByEmail(email).orElse(null);
        
        // For security, always return success even if user doesn't exist
        // This prevents email enumeration attacks
        if (user != null) {
            emailService.sendPasswordResetEmail(email, user.getName());
            logger.info("Password reset token generated for: {}", email);
        }

        return ResponseEntity.ok(ApiResponse.success("Password reset email processed", Map.of("email", email)));
    }

    /**
     * Validate reset token
     */
    @PostMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse<?>> validateResetToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String email = request.get("email");

        if (token == null || email == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token and email are required"));
        }

        boolean isValid = emailService.validateResetToken(token, email);

        return ResponseEntity.ok(ApiResponse.success(isValid ? "Token is valid" : "Invalid or expired token", Map.of("valid", isValid)));
    }

    /**
     * Reset password with token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (token == null || email == null || newPassword == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token, email, and new password are required"));
        }

        // Validate token
        if (!emailService.validateResetToken(token, email)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired reset token"));
        }

        // Find user and update password
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User not found"));
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalidate the token
        emailService.invalidateResetToken(token);

        // Send confirmation email
        emailService.sendGeneralNotification(
            email,
            user.getName(),
            "Password Changed Successfully",
            "Your password has been changed successfully. If you didn't make this change, please contact support immediately."
        );

        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully", Map.of("email", email)));
    }

    /**
     * Send email verification OTP
     */
    @PostMapping("/send-verification-otp")
    public ResponseEntity<ApiResponse<?>> sendVerificationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");

        if (email == null || name == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and name are required"));
        }

        emailService.sendEmailVerificationOtp(email, name);

        return ResponseEntity.ok(ApiResponse.success("Verification OTP sent", Map.of("email", email)));
    }

    /**
     * Verify email OTP
     */
    @PostMapping("/verify-email-otp")
    public ResponseEntity<ApiResponse<?>> verifyEmailOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and OTP are required"));
        }

        boolean isValid = emailService.validateEmailOtp(email, otp);

        if (isValid) {
            // Mark user as verified in database
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                user.setEmailVerified(true);
                userRepository.save(user);
                logger.info("Email verified for user: {}", email);
            }

            return ResponseEntity.ok(ApiResponse.success("Email verified successfully", Map.of("email", email)));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP"));
        }
    }

    /**
     * Resend verification OTP
     */
    @PostMapping("/resend-verification-otp")
    public ResponseEntity<ApiResponse<?>> resendVerificationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");

        if (email == null || name == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and name are required"));
        }

        emailService.resendEmailVerificationOtp(email, name);

        return ResponseEntity.ok(ApiResponse.success("Verification OTP resent", Map.of("email", email)));
    }
}
