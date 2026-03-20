package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SlotResponseDTO {

    private UUID id;
    private UUID doctorId;
    private String doctorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxAppointments;
    private Integer currentAppointments;
    private Boolean available;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
