package com.medvault.dto;

// ...existing code...

import java.time.LocalDateTime;
import java.util.UUID;

// Removed Lombok annotations
public class AuthResponseDTO {

    private UUID id;
    private String name;
    private String email;
    private String role;
    private String token;
    private LocalDateTime createdAt;

    // No-args constructor
    public AuthResponseDTO() {}

    // All-args constructor
    public AuthResponseDTO(UUID id, String name, String email, String role, String token, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
        this.createdAt = createdAt;
    }

    // Manual getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
