package com.medvault.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Removed Lombok annotations
@lombok.Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class DoctorRequestDTO {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Qualifications are required")
    private String qualifications;

    @NotNull(message = "Experience years is required")
    private Integer experienceYears;

    @NotBlank(message = "Hospital affiliation is required")
    private String hospitalAffiliation;

    @NotBlank(message = "Bio is required")
    private String bio;

    @NotNull(message = "Consultation fee is required")
    private Double consultationFee;
}
