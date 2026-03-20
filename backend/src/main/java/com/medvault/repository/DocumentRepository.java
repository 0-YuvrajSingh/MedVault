package com.medvault.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import com.medvault.model.Document;
import com.medvault.model.DocumentType;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    List<Document> findByPatient_Id(@NonNull UUID patientId);
    
    List<Document> findByPatient_IdOrderByUploadDateDesc(@NonNull UUID patientId);
    
    List<Document> findByUploadedByDoctor_Id(@NonNull UUID doctorId);
    
    List<Document> findByDocumentType(DocumentType documentType);
    
    List<Document> findByPatient_IdAndDocumentType(@NonNull UUID patientId, DocumentType documentType);
    
    List<Document> findByIsVerified(Boolean isVerified);
    
    List<Document> findByPatient_IdAndIsVerified(@NonNull UUID patientId, Boolean isVerified);
}
