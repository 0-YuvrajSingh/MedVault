package com.medvault.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.DocumentPermissionRequestDTO;
import com.medvault.dto.DocumentPermissionResponseDTO;
import com.medvault.exception.ConflictException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.AccessLevel;
import com.medvault.model.Doctor;
import com.medvault.model.Document;
import com.medvault.model.DocumentPermission;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.DocumentPermissionRepository;
import com.medvault.repository.DocumentRepository;

@Service
public class DocumentPermissionService {

    private final DocumentPermissionRepository permissionRepository;
    private final DocumentRepository documentRepository;
    private final DoctorRepository doctorRepository;

    public DocumentPermissionService(DocumentPermissionRepository permissionRepository,
                                    DocumentRepository documentRepository,
                                    DoctorRepository doctorRepository) {
        this.permissionRepository = permissionRepository;
        this.documentRepository = documentRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public DocumentPermissionResponseDTO grantPermission(DocumentPermissionRequestDTO request) {
        // Validate document exists
        UUID documentId = request.getDocumentId();
        if (documentId == null) {
            throw new IllegalArgumentException("Document ID must not be null");
        }
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + documentId));

        // Validate doctor exists
        UUID doctorId = request.getDoctorId();
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID must not be null");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        // Check if permission already exists
        permissionRepository.findByDocument_IdAndDoctor_Id(request.getDocumentId(), request.getDoctorId())
                .ifPresent(existing -> {
                    throw new ConflictException("Permission already exists for this doctor and document");
                });

        // Create permission
        DocumentPermission permission = new DocumentPermission();
        permission.setDocument(document);
        permission.setDoctor(doctor);
        permission.setAccessLevel(AccessLevel.valueOf(request.getAccessLevel().toUpperCase()));
        permission.setGrantedDate(request.getGrantedDate());
        permission.setExpiryDate(request.getExpiryDate());
        permission.setIsActive(true);

        DocumentPermission savedPermission = permissionRepository.save(permission);

        return toResponseDTO(savedPermission);
    }

    public DocumentPermissionResponseDTO getPermissionById(UUID id) {
        if (id == null) throw new IllegalArgumentException("Permission ID must not be null");
        DocumentPermission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Permission not found with ID: " + id));
        return toResponseDTO(permission);
    }

    public List<DocumentPermissionResponseDTO> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<DocumentPermissionResponseDTO> getPermissionsByDocumentId(UUID documentId) {
        return permissionRepository.findByDocument_Id(documentId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<DocumentPermissionResponseDTO> getPermissionsByDoctorId(UUID doctorId) {
        return permissionRepository.findByDoctor_IdAndIsActive(doctorId, true).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<DocumentPermissionResponseDTO> getPermissionsByPatientId(UUID patientId) {
        return permissionRepository.findByDocument_Patient_Id(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public DocumentPermissionResponseDTO updatePermission(UUID id, DocumentPermissionRequestDTO request) {
        if (id == null) throw new IllegalArgumentException("Permission ID must not be null");
        DocumentPermission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Permission not found with ID: " + id));

        permission.setAccessLevel(AccessLevel.valueOf(request.getAccessLevel().toUpperCase()));
        permission.setExpiryDate(request.getExpiryDate());

        DocumentPermission updatedPermission = permissionRepository.save(permission);
        return toResponseDTO(updatedPermission);
    }

    @Transactional
    public DocumentPermissionResponseDTO revokePermission(UUID id) {
        if (id == null) throw new IllegalArgumentException("Permission ID must not be null");
        DocumentPermission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Permission not found with ID: " + id));
        permission.setIsActive(false);
        DocumentPermission revokedPermission = permissionRepository.save(permission);
        return toResponseDTO(revokedPermission);
    }

    @Transactional
    public void deletePermission(UUID id) {
        if (id == null) throw new IllegalArgumentException("Permission ID must not be null");
        if (!permissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Permission not found with ID: " + id);
        }
        permissionRepository.deleteById(id);
    }

    // Helper method for DTO conversion (NO MAPPER)
    private DocumentPermissionResponseDTO toResponseDTO(DocumentPermission permission) {
        return new DocumentPermissionResponseDTO(
                permission.getId(),
                permission.getDocument().getId(),
                permission.getDocument().getFileName(),
                permission.getDoctor().getId(),
                permission.getDoctor().getUser().getName(),
                permission.getAccessLevel().name(),
                permission.getGrantedDate(),
                permission.getExpiryDate(),
                permission.getIsActive(),
                permission.getCreatedAt(),
                permission.getUpdatedAt()
        );
    }
}
