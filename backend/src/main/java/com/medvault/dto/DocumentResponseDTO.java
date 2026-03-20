package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class DocumentResponseDTO {

    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID uploadedByDoctorId;
    private String uploadedByDoctorName;
    private String fileName;
    private String documentType;
    private String filePath;
    private String description;
    private Long fileSize;
    private LocalDateTime uploadDate;
    private Boolean isVerified;
    private LocalDateTime verifiedDate;
    private UUID verifiedByDoctorId;
    private String verifiedByDoctorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
