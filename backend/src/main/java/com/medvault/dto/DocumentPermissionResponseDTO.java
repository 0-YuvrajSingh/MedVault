package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class DocumentPermissionResponseDTO {

    private UUID id;
    private UUID documentId;
    private String documentFileName;
    private UUID doctorId;
    private String doctorName;
    private String accessLevel;
    private LocalDateTime grantedDate;
    private LocalDateTime expiryDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
