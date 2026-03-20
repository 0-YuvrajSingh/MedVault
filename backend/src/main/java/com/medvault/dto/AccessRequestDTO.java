package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessRequestDTO {
    private UUID id;
    private UUID doctorId;
    private String doctorName;
    private UUID patientId;
    private String patientName;
    private String reason;
    private String status;
    private LocalDateTime requestDate;
    private LocalDateTime responseDate;
    private String patientResponse;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
