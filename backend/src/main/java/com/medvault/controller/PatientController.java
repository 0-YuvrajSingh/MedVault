package com.medvault.controller;

import com.medvault.dto.MedicalRecordResponse;
import com.medvault.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/records")
    public ResponseEntity<List<MedicalRecordResponse>> getMyRecords(Authentication authentication) {
        return ResponseEntity.ok(patientService.getRecords(UUID.fromString(authentication.getName())));
    }

    @GetMapping("/records/{recordId}")
    public ResponseEntity<MedicalRecordResponse> getRecord(@PathVariable UUID recordId, Authentication authentication) {
        return ResponseEntity.ok(patientService.getRecord(recordId, UUID.fromString(authentication.getName())));
    }
}
