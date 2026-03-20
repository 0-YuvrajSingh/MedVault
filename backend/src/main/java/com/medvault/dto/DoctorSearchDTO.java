package com.medvault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSearchDTO {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotNull(message = "Verification status is required")
    private Boolean isVerified;

    @NotNull(message = "Minimum experience is required")
    private Integer minExperience;

    @NotBlank(message = "Sort by is required")
    private String sortBy = "createdAt"; // Default sort field

    @NotBlank(message = "Sort direction is required")
    private String sortDirection = "DESC"; // Default sort direction

    @NotNull(message = "Page number is required")
    private Integer page = 0; // Default page number

    @NotNull(message = "Page size is required")
    private Integer size = 10; // Default page size
}
