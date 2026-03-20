package com.medvault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class DocumentRequestDTO {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    private UUID uploadedByDoctorId;

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotBlank(message = "File path is required")
    private String filePath;

    private String description;

    @NotNull(message = "File size is required")
    private Long fileSize;

    @NotNull(message = "Upload date is required")
    private LocalDateTime uploadDate;
}
