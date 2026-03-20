package com.medvault.controller;

import com.medvault.dto.MedicalRecordRequestDTO;
import com.medvault.dto.MedicalRecordResponseDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDTO>> createMedicalRecord(@Valid @RequestBody MedicalRecordRequestDTO request) {
        MedicalRecordResponseDTO response = medicalRecordService.createMedicalRecord(request);
        return new ResponseEntity<>(ApiResponse.success("Medical record created", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponseDTO>>> getAllMedicalRecords() {
        List<MedicalRecordResponseDTO> records = medicalRecordService.getAllMedicalRecords();
        return ResponseEntity.ok(ApiResponse.success("Medical records fetched", records));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDTO>> getMedicalRecordById(@PathVariable UUID id) {
        MedicalRecordResponseDTO record = medicalRecordService.getMedicalRecordById(id);
        return ResponseEntity.ok(ApiResponse.success("Medical record fetched", record));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponseDTO>>> getMyRecords(Authentication authentication) {
        List<MedicalRecordResponseDTO> records = medicalRecordService.getMyRecords(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Patient medical records fetched", records));
    }

    @GetMapping("/doctor/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponseDTO>>> getDoctorMyRecords(Authentication authentication) {
        List<MedicalRecordResponseDTO> records = medicalRecordService.getDoctorMyRecords(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Doctor medical records fetched", records));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponseDTO>>> getMedicalRecordsByPatientId(@PathVariable UUID patientId) {
        List<MedicalRecordResponseDTO> records = medicalRecordService.getMedicalRecordsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Medical records by patient fetched", records));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicalRecordResponseDTO>>> getMedicalRecordsByDoctorId(@PathVariable UUID doctorId) {
        List<MedicalRecordResponseDTO> records = medicalRecordService.getMedicalRecordsByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Medical records by doctor fetched", records));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordResponseDTO>> updateMedicalRecord(
            @PathVariable UUID id,
            @Valid @RequestBody MedicalRecordRequestDTO request) {
        MedicalRecordResponseDTO updated = medicalRecordService.updateMedicalRecord(id, request);
        return ResponseEntity.ok(ApiResponse.success("Medical record updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalRecord(@PathVariable UUID id) {
        medicalRecordService.deleteMedicalRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Medical record deleted", null));
    }
}
