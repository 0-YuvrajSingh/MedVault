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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/records")
    public ResponseEntity<Page<MedicalRecordResponse>> getMyRecords(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(patientService.getRecords(UUID.fromString(authentication.getName()), pageable));
    }

    @GetMapping("/records/{recordId}")
    public ResponseEntity<MedicalRecordResponse> getRecord(@PathVariable UUID recordId, Authentication authentication) {
        return ResponseEntity.ok(patientService.getRecord(recordId, UUID.fromString(authentication.getName())));
    }
}
