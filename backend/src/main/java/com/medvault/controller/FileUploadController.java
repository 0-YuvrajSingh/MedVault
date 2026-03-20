package com.medvault.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.medvault.dto.ApiResponse;
import com.medvault.dto.FileUploadResponseDTO;
import com.medvault.model.FileCategory;
import com.medvault.model.FileMetadata;
import com.medvault.service.FileStorageService;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;
    private final com.medvault.repository.FileMetadataRepository fileMetadataRepository;

    private final com.medvault.repository.PatientRepository patientRepository;

    public FileUploadController(FileStorageService fileStorageService, 
                                com.medvault.repository.FileMetadataRepository fileMetadataRepository,
                                com.medvault.repository.PatientRepository patientRepository) {
        this.fileStorageService = fileStorageService;
        this.fileMetadataRepository = fileMetadataRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Upload a file
     */
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "documentId", required = false) UUID documentId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        FileCategory fileCategory = FileCategory.valueOf(category.toUpperCase());

        FileMetadata fileMetadata = fileStorageService.storeFile(file, fileCategory, userEmail, description, documentId);

        FileUploadResponseDTO response = toResponseDTO(fileMetadata);
        // ...existing code...
        return ResponseEntity.ok(ApiResponse.success("File uploaded", response));
    }

    /**
     * Upload profile picture
     */
    @PostMapping("/upload/profile-picture")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDTO>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String userEmail = authentication.getName();
        FileMetadata fileMetadata = fileStorageService.storeFile(
            file, 
            FileCategory.PROFILE_PICTURE, 
            userEmail, 
            "Profile Picture", 
            null
        );

        // Update Patient.profilePicture with the new file path
        com.medvault.model.User user = fileMetadata.getRelatedUser();
        if (user != null) {
            java.util.Optional<com.medvault.model.Patient> patientOpt = patientRepository.findByUserId(user.getId());
            if (patientOpt.isPresent()) {
            com.medvault.model.Patient patient = patientOpt.get();
            patient.setProfilePicture("/uploads/profile-pictures/" + fileMetadata.getFileName());
            patientRepository.save(patient);
            }
        }

        FileUploadResponseDTO response = toResponseDTO(fileMetadata);
        return ResponseEntity.ok(ApiResponse.success("Profile picture uploaded", response));
    }

    /**
     * Upload medical document
     */
    @PostMapping("/upload/medical-document")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<FileUploadResponseDTO>> uploadMedicalDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "documentId", required = false) UUID documentId,
            Authentication authentication) {

        String userEmail = authentication.getName();
        FileMetadata fileMetadata = fileStorageService.storeFile(
                file, 
                FileCategory.MEDICAL_DOCUMENT, 
                userEmail, 
                description, 
                documentId
        );

        FileUploadResponseDTO response = toResponseDTO(fileMetadata);
        return ResponseEntity.ok(ApiResponse.success("Medical document uploaded", response));
    }

    /**
     * Upload prescription
     */
    @PostMapping("/upload/prescription")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<FileUploadResponseDTO>> uploadPrescription(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {

        String userEmail = authentication.getName();
        FileMetadata fileMetadata = fileStorageService.storeFile(
                file, 
                FileCategory.PRESCRIPTION, 
                userEmail, 
                description, 
                null
        );

        FileUploadResponseDTO response = toResponseDTO(fileMetadata);
        return ResponseEntity.ok(ApiResponse.success("Prescription uploaded", response));
    }

    /**
     * Download file
     */
    @GetMapping("/download/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID fileId, Authentication authentication) {
        FileMetadata fileMetadata = fileStorageService.getFileMetadata(fileId);
        
        String subDir = fileMetadata.getFilePath().substring(0, fileMetadata.getFilePath().lastIndexOf('/'));
        Resource resource = fileStorageService.loadFileAsResource(fileMetadata.getFileName(), subDir);

        String contentType = fileMetadata.getFileType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileMetadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    /**
     * View/Preview file in browser
     */
    @GetMapping("/view/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewFile(@PathVariable UUID fileId, Authentication authentication) {
        FileMetadata fileMetadata = fileStorageService.getFileMetadata(fileId);
        
        String subDir = fileMetadata.getFilePath().substring(0, fileMetadata.getFilePath().lastIndexOf('/'));
        Resource resource = fileStorageService.loadFileAsResource(fileMetadata.getFileName(), subDir);

        String contentType = fileMetadata.getFileType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileMetadata.getOriginalFileName() + "\"")
                .body(resource);
    }

    /**
     * Get file metadata
     */
    @GetMapping("/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDTO>> getFileMetadata(@PathVariable UUID fileId) {
        FileMetadata fileMetadata = fileStorageService.getFileMetadata(fileId);
        return ResponseEntity.ok(ApiResponse.success("File metadata fetched", toResponseDTO(fileMetadata)));
    }

    /**
     * Get all files for current user
     */
    @GetMapping("/my-files")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FileUploadResponseDTO>>> getMyFiles(Authentication authentication) {
        String userEmail = authentication.getName();
        
        // Get files uploaded by this user
        List<FileMetadata> userFiles = fileMetadataRepository.findByUploadedBy(userEmail);
        
        List<FileUploadResponseDTO> response = userFiles.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success("My files fetched", response));
    }

    /**
     * Delete file
     */
    @DeleteMapping("/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable UUID fileId, Authentication authentication) {
        String userEmail = authentication.getName();
        fileStorageService.deleteFile(fileId, userEmail);
        return ResponseEntity.ok(ApiResponse.success("File deleted", null));
    }

    /**
     * Get storage usage for current user
     */
    @GetMapping("/storage/usage")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<StorageUsageDTO>> getStorageUsage(Authentication authentication) {
        String userEmail = authentication.getName();
        
        // Get all files by user
        List<FileMetadata> userFiles = fileMetadataRepository.findByUploadedBy(userEmail);
        
        // Calculate total size
        long totalBytes = userFiles.stream()
                .mapToLong(FileMetadata::getFileSize)
                .sum();
        
        String formatted = fileStorageService.formatFileSize(totalBytes);
        int fileCount = userFiles.size();
        
        return ResponseEntity.ok(ApiResponse.success("Storage usage fetched", new StorageUsageDTO(totalBytes, formatted, fileCount)));
    }

    // Helper method to convert to DTO
    private FileUploadResponseDTO toResponseDTO(FileMetadata fileMetadata) {
        String fileIdStr = fileMetadata.getId() != null ? fileMetadata.getId().toString() : "";
        String safeFileIdStr = fileIdStr == null ? "" : fileIdStr;
        String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/files/download/")
            .path(safeFileIdStr)
            .toUriString();

        FileUploadResponseDTO dto = new FileUploadResponseDTO();
        dto.setFileId(fileMetadata.getId());
        dto.setFileName(fileMetadata.getFileName());
        dto.setOriginalFileName(fileMetadata.getOriginalFileName());
        dto.setFileType(fileMetadata.getFileType());
        dto.setFileSize(fileMetadata.getFileSize());
        dto.setFileSizeFormatted(fileStorageService.formatFileSize(fileMetadata.getFileSize()));
        dto.setCategory(fileMetadata.getCategory().toString());
        dto.setDownloadUrl(downloadUrl);
        dto.setUploadedAt(fileMetadata.getUploadedAt());
        dto.setUploadedBy(fileMetadata.getUploadedBy());
        dto.setChecksum(fileMetadata.getChecksum());

        return dto;
    }

    // Inner class for storage usage response
    public static class StorageUsageDTO {
        public Long bytesUsed;
        public String formatted;
        public Integer fileCount;

        public StorageUsageDTO(Long bytesUsed, String formatted, Integer fileCount) {
            this.bytesUsed = bytesUsed;
            this.formatted = formatted;
            this.fileCount = fileCount;
        }
    }
}
