package com.medvault.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientRequestDTO {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String bloodGroup;

    private String gender;

    private String address;

    private String phoneNumber;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String medicalHistory;

    private String allergies;

    // New fields for extended profile
    private String maritalStatus;
    private String aadhaarNumber;
    private String lifestyle; // JSON string
    private String currentHealth; // JSON string

    // Profile picture URL or path
    private String profilePicture;
}
