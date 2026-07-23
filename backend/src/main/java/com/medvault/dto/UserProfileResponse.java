package com.medvault.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class UserProfileResponse {
    UUID id;
    String fullName;
    String email;
    String role;
    boolean active;
    String profilePhoto;
    boolean emailNotifications;
    LocalDateTime createdAt;
}