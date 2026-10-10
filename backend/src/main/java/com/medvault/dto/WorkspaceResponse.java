package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class WorkspaceResponse {
    private UUID id;
    private String name;
    private UUID createdBy;
    private LocalDateTime createdAt;
}
