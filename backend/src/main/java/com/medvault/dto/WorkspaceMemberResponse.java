package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class WorkspaceMemberResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String role;
    private boolean isActive;
}
