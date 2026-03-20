package com.medvault.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.exception.UnauthorizedException;
import com.medvault.model.FileCategory;
import com.medvault.model.FileMetadata;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.FileMetadataRepository;
import com.medvault.repository.UserRepository;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;
    private final FileMetadataRepository fileMetadataRepository;
    private final UserRepository userRepository;

    @Value("${medvault.file.allowed-image-types}")
    private String allowedImageTypes;

    @Value("${medvault.file.allowed-document-types}")
    private String allowedDocumentTypes;

    public FileStorageService(@Value("${medvault.file.upload-dir}") String uploadDir,
            FileMetadataRepository fileMetadataRepository,
            UserRepository userRepository) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileMetadataRepository = fileMetadataRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(this.fileStorageLocation);
            // Create subdirectories
            Files.createDirectories(Paths.get(uploadDir + "/medical-documents"));
            Files.createDirectories(Paths.get(uploadDir + "/profile-pictures"));
            Files.createDirectories(Paths.get(uploadDir + "/prescriptions"));
            Files.createDirectories(Paths.get(uploadDir + "/lab-reports"));
        } catch (IOException | SecurityException ex) {
            throw new IllegalStateException("Could not create upload directory!", ex);
        }
    }

    /**
     * Store file and create metadata entry
     */
    public FileMetadata storeFile(MultipartFile file, FileCategory category, String userEmail,
            String description, UUID relatedDocumentId) {
        // Validate file
        validateFile(file, category);

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Determine subdirectory based on category
            String subDir = getCategorySubdirectory(category);
            Path targetLocation = this.fileStorageLocation.resolve(subDir).resolve(uniqueFileName);

            // Copy file to target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Calculate file checksum
            String checksum = calculateChecksum(file.getBytes());

            // Get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

            // Create file metadata
            FileMetadata fileMetadata = new FileMetadata();
            fileMetadata.setFileName(uniqueFileName);
            fileMetadata.setOriginalFileName(originalFileName);
            fileMetadata.setFilePath(subDir + "/" + uniqueFileName);
            fileMetadata.setFileType(file.getContentType());
            fileMetadata.setFileSize(file.getSize());
            fileMetadata.setCategory(category);
            fileMetadata.setUploadedBy(userEmail);
            fileMetadata.setUploadedAt(LocalDateTime.now());
            fileMetadata.setDescription(description);
            fileMetadata.setChecksum(checksum);
            fileMetadata.setIsPublic(false);
            fileMetadata.setRelatedUser(user);
            fileMetadata.setRelatedDocumentId(relatedDocumentId);

            return fileMetadataRepository.save(fileMetadata);

        } catch (IOException ex) {
            throw new IllegalStateException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    /**
     * Load file as Resource
     */
    public Resource loadFileAsResource(String fileName, String subDir) {
        try {
            Path filePath = this.fileStorageLocation.resolve(subDir).resolve(fileName).normalize();
            if (filePath == null) {
                throw new IllegalArgumentException("File path cannot be null");
            }
            if (filePath.toUri() == null) {
                throw new IllegalArgumentException("File URI cannot be null");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found: " + fileName);
        }
    }

    /**
     * Delete file from storage and metadata
     */
    public void deleteFile(UUID fileId, String userEmail) {
        if (fileId == null) {
            throw new IllegalArgumentException("File ID cannot be null");
        }
        FileMetadata fileMetadata = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

        // Security check - only uploader or admin can delete
        if (!fileMetadata.getUploadedBy().equals(userEmail)) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null || !user.getRole().equals(Role.ADMIN)) {
                throw new UnauthorizedException("Unauthorized to delete this file");
            }
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(fileMetadata.getFilePath()).normalize();
            Files.deleteIfExists(filePath);
            fileMetadataRepository.delete(fileMetadata);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not delete file: " + fileMetadata.getFileName(), ex);
        }
    }

    /**
     * Get file metadata by ID
     */
    public FileMetadata getFileMetadata(UUID fileId) {
        if (fileId == null) {
            throw new IllegalArgumentException("File ID cannot be null");
        }
        return fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));
    }

    /**
     * Get all files for a user
     */
    public List<FileMetadata> getUserFiles(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return fileMetadataRepository.findByRelatedUser_Id(userId);
    }

    /**
     * Get files by category
     */
    public List<FileMetadata> getFilesByCategory(FileCategory category) {
        return fileMetadataRepository.findByCategory(category);
    }

    /**
     * Validate file type and size
     */
    private void validateFile(MultipartFile file, FileCategory category) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot upload empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("File type cannot be determined");
        }

        // Validate based on category
        List<String> allowedTypes;
        if (category == FileCategory.PROFILE_PICTURE) {
            allowedTypes = Arrays.asList(allowedImageTypes.split(","));
        } else {
            allowedTypes = Arrays.asList(allowedDocumentTypes.split(","));
        }

        if (!allowedTypes.contains(contentType)) {
            throw new BadRequestException("File type not allowed: " + contentType);
        }

        // Additional validation: check file extension matches content type
        String fileName = file.getOriginalFilename();
        if (fileName != null && fileName.contains("..")) {
            throw new BadRequestException("Invalid file name: " + fileName);
        }
    }

    /**
     * Calculate MD5 checksum
     */
    private String calculateChecksum(byte[] fileBytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(fileBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf('.') == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    /**
     * Get subdirectory based on category
     */
    private String getCategorySubdirectory(FileCategory category) {
        return switch (category) {
            case MEDICAL_DOCUMENT ->
                "medical-documents";
            case PROFILE_PICTURE ->
                "profile-pictures";
            case PRESCRIPTION ->
                "prescriptions";
            case LAB_REPORT, XRAY, MRI_SCAN, CT_SCAN ->
                "lab-reports";
            default ->
                "medical-documents";
        };
    }

    /**
     * Get total storage used by user (in bytes)
     */
    public Long getUserStorageUsed(UUID userId) {
        List<FileMetadata> files = fileMetadataRepository.findByRelatedUser_Id(userId);
        return files.stream().mapToLong(FileMetadata::getFileSize).sum();
    }

    /**
     * Format file size to human readable format
     */
    public String formatFileSize(Long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
