package com.medvault.controller;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medvault.dto.ApiResponse;
import com.medvault.dto.PatientRequestDTO;
import com.medvault.dto.PatientResponseDTO;
import com.medvault.service.PatientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> createPatient(@Valid @RequestBody PatientRequestDTO request) {
        PatientResponseDTO response = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Patient created", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> getPatientById(@PathVariable UUID id) {
        PatientResponseDTO response = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success("Patient fetched", response));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR') or hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> getPatientByUserId(@PathVariable UUID userId, Authentication authentication) {
        logger.info("[DEBUG] getPatientByUserId called: authentication.name={}, userId={}, roles={}",
                authentication != null ? authentication.getName() : "null",
                userId,
                authentication != null ? authentication.getAuthorities() : "null");

        PatientResponseDTO response = patientService.getPatientByUserId(userId);

        // Security check: If user is a PATIENT, they can only view their own profile
        boolean isPatient = false;
        if (authentication != null) {
            isPatient = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));
        }

        if (isPatient && authentication != null && !response.getEmail().equals(authentication.getName())) {
            throw new com.medvault.exception.UnauthorizedException("Access denied: You can only view your own profile");
        }

        return ResponseEntity.ok(ApiResponse.success("Patient fetched by user", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<List<PatientResponseDTO>>> getAllPatients() {
        List<PatientResponseDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success("All patients fetched", patients));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT')")
    public ResponseEntity<ApiResponse<PatientResponseDTO>> updatePatient(
            @PathVariable UUID id,
            @Valid @RequestBody PatientRequestDTO request) {
        PatientResponseDTO response = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable UUID id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted", null));
    }
}
