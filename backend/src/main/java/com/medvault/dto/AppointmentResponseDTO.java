package com.medvault.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDTO {

    private UUID id;

    private UUID doctorId;

    private String doctorName;

    private String doctorSpecialization;

    private UUID patientId;

    private String patientName;

    private UUID slotId;

    private LocalDateTime slotStartTime;

    private LocalDateTime slotEndTime;

    private LocalDateTime appointmentDate;

    private String status;

    private String reason;

    private String doctorNotes;

    private String patientNotes;

    private Double consultationFee;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
