package com.medvault.dto;

// Removed Lombok imports

import java.time.LocalDateTime;
import java.util.UUID;

// Removed Lombok annotations
public class DoctorResponseDTO {

    private UUID id;
    private UUID userId;
    private String name;
    private String email;
    private String specialization;
    private String licenseNumber;
    private String qualifications;
    private Integer experienceYears;
    private String hospitalAffiliation;
    private String bio;
    private Double consultationFee;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // No-args constructor
    public DoctorResponseDTO() {}

    // All-args constructor
    public DoctorResponseDTO(UUID id, UUID userId, String name, String email, String specialization, String licenseNumber, String qualifications, Integer experienceYears, String hospitalAffiliation, String bio, Double consultationFee, Boolean isVerified, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.specialization = specialization;
        this.licenseNumber = licenseNumber;
        this.qualifications = qualifications;
        this.experienceYears = experienceYears;
        this.hospitalAffiliation = hospitalAffiliation;
        this.bio = bio;
        this.consultationFee = consultationFee;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public String getHospitalAffiliation() { return hospitalAffiliation; }
    public void setHospitalAffiliation(String hospitalAffiliation) { this.hospitalAffiliation = hospitalAffiliation; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
