package com.medvault.service;

import com.medvault.dto.AuthResponse;
import com.medvault.dto.LoginRequest;
import com.medvault.dto.RegisterRequest;
import com.medvault.entity.User;
import com.medvault.repository.UserRepository;
import com.medvault.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager, AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Only ROLE_PATIENT and ROLE_DOCTOR allowed via public registration
        if (!request.isRoleAllowed()) {
            throw new IllegalArgumentException("Invalid role specified for registration");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Patients are immediately active; doctors start pending admin approval
        boolean isActive = "ROLE_PATIENT".equals(request.getRole());

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(isActive)
                .build();

        userRepository.save(user);

        // Audit the registration event (non-blocking — no sensitive data)
        auditService.logPlatformEvent(user.getId(), "DOCTOR_REGISTERED", "User", user.getId(), "Doctor registered: " + user.getEmail());

        if ("ROLE_DOCTOR".equals(request.getRole())) {
            // Pending doctor — NO JWT issued
            log.info("Doctor registered (pending approval): {}", user.getEmail());
            return AuthResponse.builder()
                    .token(null)
                    .userId(user.getId())
                    .role(user.getRole())
                    .fullName(user.getFullName())
                    .message("Registration successful. Your account is pending administrator approval.")
                    .build();
        }

        // Patient — issue token immediately
        String jwtToken = jwtUtil.generateToken(user);
        auditService.logPlatformEvent(user.getId(), "PATIENT_REGISTERED", "User", user.getId(), "Patient registered: " + user.getEmail());
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .role(user.getRole())
                .fullName(user.getFullName())
                .message("Registration successful.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Uniform credential failure: never reveal whether the email exists or whether
        // the account is inactive/pending. Internal reasons stay in server logs only.
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );
            } catch (Exception e) {
                log.debug("Login failed for {}", request.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }
            if (!user.isActive()) {
                log.debug("Login rejected for inactive account {}", request.getEmail());
                throw new BadCredentialsException("Invalid email or password");
            }
        } else {
            // Unknown email: run a dummy verification so timing is comparable, then fail identically.
            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );
            } catch (Exception ignored) {
                // fall through to uniform failure below
            }
            log.debug("Login failed for unknown email");
            throw new BadCredentialsException("Invalid email or password");
        }

        auditService.logPlatformEvent(user.getId(), "LOGIN", "User", user.getId(), "User logged in: " + user.getEmail());

        String jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .role(user.getRole())
                .fullName(user.getFullName())
                .message("Login successful.")
                .build();
    }
}
