package com.medvault.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
import com.medvault.dto.DoctorRequestDTO;
import com.medvault.dto.DoctorResponseDTO;
import com.medvault.dto.DoctorSearchDTO;
import com.medvault.dto.PatientResponseDTO;
import com.medvault.service.DoctorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> createDoctor(@Valid @RequestBody DoctorRequestDTO request) {
        DoctorResponseDTO response = doctorService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Doctor created", response));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> createOwnProfile(
            @Valid @RequestBody DoctorRequestDTO request,
            Authentication authentication) {
        // Get the authenticated user's email
        String email = authentication.getName();

        // Create the doctor profile using the service
        DoctorResponseDTO response = doctorService.createProfileForAuthenticatedUser(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Profile created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> getDoctorById(@PathVariable UUID id) {
        DoctorResponseDTO response = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor fetched", response));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> getDoctorByUserId(@PathVariable UUID userId) {
        DoctorResponseDTO response = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Doctor fetched by user", response));
    }

    @GetMapping("/my-patients")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<PatientResponseDTO>>> getMyPatients(Authentication authentication) {
        List<PatientResponseDTO> patients = doctorService.getDoctorPatientsByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Doctor patients fetched", patients));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponseDTO>>> getAllDoctors() {
        List<DoctorResponseDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success("All doctors fetched", doctors));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorResponseDTO>>> getDoctorsBySpecialization(@PathVariable String specialization) {
        List<DoctorResponseDTO> doctors = doctorService.getDoctorsBySpecialization(specialization);
        return ResponseEntity.ok(ApiResponse.success("Doctors by specialization fetched", doctors));
    }

    @GetMapping("/verified")
    public ResponseEntity<ApiResponse<List<DoctorResponseDTO>>> getVerifiedDoctors() {
        List<DoctorResponseDTO> doctors = doctorService.getVerifiedDoctors();
        return ResponseEntity.ok(ApiResponse.success("Verified doctors fetched", doctors));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<DoctorResponseDTO>>> searchDoctors(@RequestBody DoctorSearchDTO searchDTO) {
        Page<DoctorResponseDTO> doctors = doctorService.searchDoctors(searchDTO);
        return ResponseEntity.ok(ApiResponse.success("Doctor search results", doctors));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> updateDoctor(
            @PathVariable UUID id,
            @Valid @RequestBody DoctorRequestDTO request) {
        DoctorResponseDTO response = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", response));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> verifyDoctor(@PathVariable UUID id) {
        DoctorResponseDTO response = doctorService.verifyDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor verified", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable UUID id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted", null));
    }
}
