package com.medvault.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AssignDoctorRequest {
    private UUID patientId;
    private UUID doctorId;
}
