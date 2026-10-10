package com.medvault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddWorkspaceMemberRequest {
    @NotNull(message = "User ID must not be null")
    private UUID userId;
}
