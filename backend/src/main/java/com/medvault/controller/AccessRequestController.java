package com.medvault.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medvault.dto.AccessRequestDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.service.AccessService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AccessRequestController {

    private final AccessService accessService;

    public AccessRequestController(AccessService accessService) {
        this.accessService = accessService;
    }

    @PostMapping("/doctor/access-request")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AccessRequestDTO>> requestAccess(
            @Valid @RequestBody Map<String, Object> request) {
        UUID patientId = UUID.fromString((String) request.get("patientId"));
        if (patientId == null) throw new IllegalArgumentException("Patient ID cannot be null");
        String reason = (String) request.get("reason");
        AccessRequestDTO result = accessService.requestAccess(patientId, reason);
        return ResponseEntity.ok(ApiResponse.success("Access request sent successfully", result));
    }

    @GetMapping("/doctor/access-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AccessRequestDTO>>> getDoctorAccessRequests() {
        List<AccessRequestDTO> requests = accessService.getMyAccessRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/patient/access-requests")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AccessRequestDTO>>> getPatientAccessRequests() {
        List<AccessRequestDTO> requests = accessService.getMyAccessRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PutMapping("/patient/access-request/{requestId}/respond")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AccessRequestDTO>> respondToAccessRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody Map<String, Object> request) {
        if (requestId == null) throw new IllegalArgumentException("Request ID cannot be null");
        boolean approve = (Boolean) request.get("approve");
        String response = (String) request.getOrDefault("response", "");
        AccessRequestDTO result = accessService.respondToAccessRequest(requestId, approve, response);
        String message = approve ? "Access request approved" : "Access request rejected";
        return ResponseEntity.ok(ApiResponse.success(message, result));
    }

    @DeleteMapping("/patient/access-request/{requestId}/revoke")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> revokeAccess(@PathVariable UUID requestId) {
        if (requestId == null) throw new IllegalArgumentException("Request ID cannot be null");
        accessService.revokeAccess(requestId);
        return ResponseEntity.ok(ApiResponse.success("Access revoked successfully", null));
    }

    @GetMapping("/doctor/check-access/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAccess(@PathVariable UUID patientId) {
        // This would need doctorId from the authenticated user
        // Simplified for now
        return ResponseEntity.ok(ApiResponse.success(Map.of("hasAccess", false)));
    }
}
