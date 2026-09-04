package com.medvault.controller;

import com.medvault.dto.CreateReviewRequest;
import com.medvault.dto.DoctorResponse;
import com.medvault.dto.MedicalRecordResponse;
import com.medvault.dto.ReviewResponse;
import com.medvault.service.PatientService;
import com.medvault.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;
    private final ReviewService reviewService;

    public PatientController(PatientService patientService, ReviewService reviewService) {
        this.patientService = patientService;
        this.reviewService = reviewService;
    }

    @GetMapping("/records")
    public ResponseEntity<Page<MedicalRecordResponse>> getMyRecords(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        return ResponseEntity.ok(patientService.getRecords(UUID.fromString(authentication.getName()), pageable));
    }

    @GetMapping("/records/{recordId}")
    public ResponseEntity<MedicalRecordResponse> getRecord(
            @PathVariable UUID recordId, Authentication authentication) {
        return ResponseEntity.ok(patientService.getRecord(recordId, UUID.fromString(authentication.getName())));
    }

    @GetMapping("/my-doctor")
    public ResponseEntity<DoctorResponse> getMyDoctor(Authentication authentication) {
        UUID patientId = UUID.fromString(authentication.getName());
        DoctorResponse doctor = patientService.getMyDoctor(patientId);
        if (doctor == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(doctor);
    }

    /**
     * Patient creates or updates a review for their currently assigned doctor.
     * The doctor is determined server-side from the active assignment — the patient
     * cannot inject an arbitrary doctorId.
     */
    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createOrUpdateReview(
            @Valid @RequestBody CreateReviewRequest request, Authentication authentication) {
        UUID patientId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(reviewService.createOrUpdateReview(patientId, request));
    }
}
