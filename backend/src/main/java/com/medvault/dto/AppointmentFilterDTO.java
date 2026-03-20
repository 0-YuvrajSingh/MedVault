package com.medvault.dto;


import java.time.LocalDateTime;
import java.util.UUID;

import com.medvault.model.AppointmentStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentFilterDTO {
    @NotNull(message = "Doctor ID is required")
    private UUID doctorId;

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Status is required")
    private AppointmentStatus status;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @NotBlank(message = "Sort by is required")
    private String sortBy = "appointmentDate"; // Default sort field

    @NotBlank(message = "Sort direction is required")
    private String sortDirection = "ASC"; // Default sort direction

    @NotNull(message = "Page number is required")
    private Integer page = 0; // Default page number

    @NotNull(message = "Page size is required")
    private Integer size = 10; // Default page size
}
