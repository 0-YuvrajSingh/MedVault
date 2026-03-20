package com.medvault.util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class FileUploadUtil {

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/png", "image/jpg", "image/gif"
    );
    
    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
        "application/pdf", 
        "image/jpeg", 
        "image/png", 
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    public String saveFile(String uploadDir, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 50MB");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public void deleteFile(String uploadDir, String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        Files.deleteIfExists(filePath);
    }

    public boolean isValidImageType(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType);
    }

    public boolean isValidDocumentType(String contentType) {
        return ALLOWED_DOCUMENT_TYPES.contains(contentType);
    }

    public void validateFile(MultipartFile file, boolean isImage) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 50MB");
        }

        String contentType = file.getContentType();
        if (isImage) {
            if (!isValidImageType(contentType)) {
                throw new IllegalArgumentException("Invalid image file type. Allowed types: JPEG, PNG, JPG, GIF");
            }
        } else {
            if (!isValidDocumentType(contentType)) {
                throw new IllegalArgumentException("Invalid document file type. Allowed types: PDF, DOC, DOCX, JPEG, PNG");
            }
        }
    }
}
