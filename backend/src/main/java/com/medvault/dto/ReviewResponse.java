package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private UUID id;
    private UUID doctorId;
    private UUID patientId;
    private String patientName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
