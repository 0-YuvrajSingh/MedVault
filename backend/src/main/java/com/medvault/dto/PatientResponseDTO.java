package com.medvault.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class PatientResponseDTO {

    private UUID id;
    
    private UUID userId;
    
    private String name;
    
    private String email;
    
    private LocalDate dateOfBirth;
    
    private String bloodGroup;
    
    private String gender;
    
    private String address;
    
    private String phoneNumber;
    
    private String emergencyContactName;
    
    private String emergencyContactPhone;
    
    private String medicalHistory;
    
    private String allergies;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // New fields for extended profile
    private String maritalStatus;
    private String aadhaarNumber;
    private String lifestyle; // JSON string
    private String currentHealth; // JSON string

    // Profile picture URL or path
    private String profilePicture;
}
