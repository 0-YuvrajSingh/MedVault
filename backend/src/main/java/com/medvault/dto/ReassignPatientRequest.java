package com.medvault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReassignPatientRequest {

    @NotNull(message = "New doctor ID is required")
    private UUID newDoctorId;
}
