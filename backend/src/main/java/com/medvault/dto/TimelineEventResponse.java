package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDate eventDate;
    private String eventType;
    private LocalDateTime createdAt;
}
