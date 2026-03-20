package com.medvault.controller;

import com.medvault.dto.DocumentPermissionRequestDTO;
import com.medvault.dto.DocumentPermissionResponseDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.service.DocumentPermissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/document-permissions")
public class DocumentPermissionController {

    private final DocumentPermissionService permissionService;

    public DocumentPermissionController(DocumentPermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentPermissionResponseDTO>> grantPermission(@Valid @RequestBody DocumentPermissionRequestDTO request) {
        DocumentPermissionResponseDTO response = permissionService.grantPermission(request);
        return new ResponseEntity<>(ApiResponse.success("Document permission granted", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DocumentPermissionResponseDTO>>> getAllPermissions() {
        List<DocumentPermissionResponseDTO> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.success("Document permissions fetched", permissions));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DocumentPermissionResponseDTO>> getPermissionById(@PathVariable UUID id) {
        DocumentPermissionResponseDTO permission = permissionService.getPermissionById(id);
        return ResponseEntity.ok(ApiResponse.success("Document permission fetched", permission));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<ApiResponse<List<DocumentPermissionResponseDTO>>> getPermissionsByDocumentId(@PathVariable UUID documentId) {
        List<DocumentPermissionResponseDTO> permissions = permissionService.getPermissionsByDocumentId(documentId);
        return ResponseEntity.ok(ApiResponse.success("Permissions by document fetched", permissions));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<DocumentPermissionResponseDTO>>> getPermissionsByDoctorId(@PathVariable UUID doctorId) {
        List<DocumentPermissionResponseDTO> permissions = permissionService.getPermissionsByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Permissions by doctor fetched", permissions));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<DocumentPermissionResponseDTO>>> getPermissionsByPatientId(@PathVariable UUID patientId) {
        List<DocumentPermissionResponseDTO> permissions = permissionService.getPermissionsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Permissions by patient fetched", permissions));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentPermissionResponseDTO>> updatePermission(
            @PathVariable UUID id,
            @Valid @RequestBody DocumentPermissionRequestDTO request) {
        DocumentPermissionResponseDTO updated = permissionService.updatePermission(id, request);
        return ResponseEntity.ok(ApiResponse.success("Document permission updated", updated));
    }

    @PatchMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<DocumentPermissionResponseDTO>> revokePermission(@PathVariable UUID id) {
        DocumentPermissionResponseDTO revoked = permissionService.revokePermission(id);
        return ResponseEntity.ok(ApiResponse.success("Document permission revoked", revoked));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePermission(@PathVariable UUID id) {
        permissionService.deletePermission(id);
        return ResponseEntity.ok(ApiResponse.success("Document permission deleted", null));
    }
}
