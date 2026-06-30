package com.medvault.controller;

import com.medvault.dto.CreateRecordRequest;
import com.medvault.dto.MedicalRecordResponse;
import com.medvault.dto.UserResponse;
import com.medvault.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/patients")
    public ResponseEntity<List<UserResponse>> getPatients(Principal principal) {
        UUID doctorId = UUID.fromString(principal.getName());
        List<UserResponse> patients = doctorService.getAssignedPatients(doctorId).stream()
                .map(u -> new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.isActive()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/patients/{patientId}/records")
    public ResponseEntity<Page<MedicalRecordResponse>> getPatientRecords(
            @PathVariable UUID patientId, 
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Principal principal) {
        UUID doctorId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(doctorService.getPatientRecords(doctorId, patientId, pageable));
    }

    @PostMapping("/patients/{patientId}/records")
    public ResponseEntity<MedicalRecordResponse> createRecord(@PathVariable UUID patientId, @RequestBody CreateRecordRequest request, Principal principal) {
        UUID doctorId = UUID.fromString(principal.getName());
        return ResponseEntity.ok(doctorService.createRecord(doctorId, patientId, request));
    }
}
