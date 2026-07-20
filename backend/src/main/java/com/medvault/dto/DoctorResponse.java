package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class DoctorResponse {
    private UUID id;
    private String fullName;
    private String email;
    private LocalDateTime assignedAt;
}
