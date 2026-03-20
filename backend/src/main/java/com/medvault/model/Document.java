package com.medvault.model;

import jakarta.persistence.*;
// Removed Lombok imports
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
// Removed Lombok annotations
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "uploaded_by_doctor_id")
    private Doctor uploadedByDoctor;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Long fileSize; // in bytes

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column
    private LocalDateTime verifiedDate;

    @ManyToOne
    @JoinColumn(name = "verified_by_doctor_id")
    private Doctor verifiedByDoctor;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // No-args constructor
    public Document() {}

    // All-args constructor
    public Document(UUID id, Patient patient, Doctor uploadedByDoctor, String fileName, DocumentType documentType, String filePath, String description, Long fileSize, LocalDateTime uploadDate, Boolean isVerified, LocalDateTime verifiedDate, Doctor verifiedByDoctor, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.patient = patient;
        this.uploadedByDoctor = uploadedByDoctor;
        this.fileName = fileName;
        this.documentType = documentType;
        this.filePath = filePath;
        this.description = description;
        this.fileSize = fileSize;
        this.uploadDate = uploadDate;
        this.isVerified = isVerified;
        this.verifiedDate = verifiedDate;
        this.verifiedByDoctor = verifiedByDoctor;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public Doctor getUploadedByDoctor() { return uploadedByDoctor; }
    public void setUploadedByDoctor(Doctor uploadedByDoctor) { this.uploadedByDoctor = uploadedByDoctor; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public LocalDateTime getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(LocalDateTime verifiedDate) { this.verifiedDate = verifiedDate; }
    public Doctor getVerifiedByDoctor() { return verifiedByDoctor; }
    public void setVerifiedByDoctor(Doctor verifiedByDoctor) { this.verifiedByDoctor = verifiedByDoctor; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
