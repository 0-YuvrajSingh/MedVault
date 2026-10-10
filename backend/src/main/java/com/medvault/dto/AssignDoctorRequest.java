package com.medvault.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class AssignDoctorRequest {
    private UUID patientId;
    private UUID doctorId;
    /** Mandatory since D6: every new assignment belongs to a definite workspace. */
    @NotNull(message = "Workspace ID must not be null")
    private UUID workspaceId;
}
