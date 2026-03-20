package com.medvault.controller;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medvault.dto.ApiResponse;
import com.medvault.dto.DocumentRequestDTO;
import com.medvault.dto.DocumentResponseDTO;
import com.medvault.service.DocumentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> createDocument(@Valid @RequestBody @org.springframework.lang.NonNull DocumentRequestDTO request) {
        DocumentResponseDTO response = documentService.createDocument(request);
        return new ResponseEntity<>(ApiResponse.success("Document created", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getAllDocuments() {
        List<DocumentResponseDTO> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved", documents));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> getDocumentById(@PathVariable @org.springframework.lang.NonNull UUID id) {
        DocumentResponseDTO document = documentService.getDocumentById(Objects.requireNonNull(id, "Document ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Document retrieved", document));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getDocumentsByPatientId(@PathVariable @org.springframework.lang.NonNull UUID patientId) {
        List<DocumentResponseDTO> documents = documentService.getDocumentsByPatientId(Objects.requireNonNull(patientId, "Patient ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Patient documents retrieved", documents));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getDocumentsByDoctorId(@PathVariable @org.springframework.lang.NonNull UUID doctorId) {
        List<DocumentResponseDTO> documents = documentService.getDocumentsByDoctorId(Objects.requireNonNull(doctorId, "Doctor ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Doctor documents retrieved", documents));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getDocumentsByType(@PathVariable String type) {
        List<DocumentResponseDTO> documents = documentService.getDocumentsByType(type);
        return ResponseEntity.ok(ApiResponse.success("Documents by type retrieved", documents));
    }

    @GetMapping("/unverified")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentResponseDTO>>> getUnverifiedDocuments() {
        List<DocumentResponseDTO> documents = documentService.getUnverifiedDocuments();
        return ResponseEntity.ok(ApiResponse.success("Unverified documents retrieved", documents));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> verifyDocument(
            @PathVariable @org.springframework.lang.NonNull UUID id,
            @RequestBody Map<String, String> verificationData) {
        UUID doctorId = UUID.fromString(Objects.requireNonNull(verificationData.get("doctorId"), "Doctor ID cannot be null"));
        DocumentResponseDTO verified = documentService.verifyDocument(
            java.util.Objects.requireNonNull(id, "Document ID cannot be null"),
            java.util.Objects.requireNonNull(doctorId, "Doctor ID cannot be null")
        );
        return ResponseEntity.ok(ApiResponse.success("Document verified", verified));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentResponseDTO>> updateDocument(
            @PathVariable @org.springframework.lang.NonNull UUID id,
            @Valid @RequestBody DocumentRequestDTO request) {
        DocumentResponseDTO updated = documentService.updateDocument(Objects.requireNonNull(id, "Document ID cannot be null"), request);
        return ResponseEntity.ok(ApiResponse.success("Document updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable @org.springframework.lang.NonNull UUID id) {
        documentService.deleteDocument(Objects.requireNonNull(id, "Document ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}
