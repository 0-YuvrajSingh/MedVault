package com.medvault.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Role is required")
    private String role;

    /** Allowed roles for public self-registration. */
    private static final Set<String> ALLOWED_ROLES = Set.of("ROLE_PATIENT", "ROLE_DOCTOR");

    public boolean isRoleAllowed() {
        return role != null && ALLOWED_ROLES.contains(role);
    }
}
