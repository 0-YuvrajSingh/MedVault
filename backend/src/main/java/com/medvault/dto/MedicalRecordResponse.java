package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class MedicalRecordResponse {
    private UUID id;
    private UUID patientId;
    private String doctorName;
    private String diagnosis;
    private String prescription;
    private String notes;
    private LocalDateTime createdAt;
}
