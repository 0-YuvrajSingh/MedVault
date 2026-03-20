package com.medvault.repository;

import com.medvault.model.FileCategory;
import com.medvault.model.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {
    
    List<FileMetadata> findByRelatedUser_Id(UUID userId);
    
    List<FileMetadata> findByCategory(FileCategory category);
    
    List<FileMetadata> findByUploadedBy(String email);
    
    Optional<FileMetadata> findByFileName(String fileName);
    
    List<FileMetadata> findByRelatedDocumentId(UUID documentId);
    
    Long countByRelatedUser_Id(UUID userId);
    
    Long countByCategory(FileCategory category);
}
