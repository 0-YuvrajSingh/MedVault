package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class MedicalRecordResponseDTO {

    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID doctorId;
    private String doctorName;
    private String doctorSpecialization;
    private LocalDateTime recordDate;
    private String diagnosis;
    private String treatment;
    private String prescription;
    private String doctorNotes;
    private String testResults;
    private String followUpInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
