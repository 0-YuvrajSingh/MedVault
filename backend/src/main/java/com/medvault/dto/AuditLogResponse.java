package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AuditLogResponse {
    private UUID id;
    private UUID recordId;
    private String action;
    private String performedByName;
    private LocalDateTime performedAt;
    private String detailSnapshot;
}
