package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponseDTO {
    private UUID fileId;
    private String fileName;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
    private String fileSizeFormatted;
    private String category;
    private String downloadUrl;
    private LocalDateTime uploadedAt;
    private String uploadedBy;
    private String checksum;
}
