package com.medvault.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "file_metadata")
// Removed Lombok annotations
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String fileType; // MIME type

    @Column(nullable = false)
    private Long fileSize; // in bytes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileCategory category; // MEDICAL_DOCUMENT, PROFILE_PICTURE, PRESCRIPTION, LAB_REPORT

    @Column(nullable = false)
    private String uploadedBy; // User email who uploaded

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    private String description;

    private String checksum; // MD5 or SHA-256 hash for integrity verification

    @Column(nullable = false)
    private Boolean isPublic = false; // Access control

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_filemetadata_user", foreignKeyDefinition = "FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE"))
    private User relatedUser; // User this file belongs to (patient/doctor)

    @Column(name = "document_id")
    private UUID relatedDocumentId; // Link to Document entity if applicable

    // No-args constructor
    public FileMetadata() {}

    // All-args constructor
    public FileMetadata(UUID id, String fileName, String originalFileName, String filePath, String fileType, Long fileSize, FileCategory category, String uploadedBy, LocalDateTime uploadedAt, String description, String checksum, Boolean isPublic, User relatedUser, UUID relatedDocumentId) {
        this.id = id;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.filePath = filePath;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.category = category;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
        this.description = description;
        this.checksum = checksum;
        this.isPublic = isPublic;
        this.relatedUser = relatedUser;
        this.relatedDocumentId = relatedDocumentId;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public FileCategory getCategory() { return category; }
    public void setCategory(FileCategory category) { this.category = category; }
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public User getRelatedUser() { return relatedUser; }
    public void setRelatedUser(User relatedUser) { this.relatedUser = relatedUser; }
    public UUID getRelatedDocumentId() { return relatedDocumentId; }
    public void setRelatedDocumentId(UUID relatedDocumentId) { this.relatedDocumentId = relatedDocumentId; }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
