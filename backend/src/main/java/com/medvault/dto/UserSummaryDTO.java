package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class UserSummaryDTO {

    private UUID id;
    private String name;
    private String email;
    private String role;
    private LocalDateTime createdAt;
}
