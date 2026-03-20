package com.medvault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class DocumentPermissionRequestDTO {

    @NotNull(message = "Document ID is required")
    private UUID documentId;

    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    @NotNull(message = "Access level is required")
    private String accessLevel;

    @NotNull(message = "Granted date is required")
    private LocalDateTime grantedDate;

    private LocalDateTime expiryDate;
}
