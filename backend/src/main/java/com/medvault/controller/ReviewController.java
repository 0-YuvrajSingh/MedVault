package com.medvault.controller;

import com.medvault.dto.DoctorRatingDTO;
import com.medvault.dto.ReviewRequestDTO;
import com.medvault.dto.ReviewResponseDTO;
import com.medvault.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.medvault.dto.ApiResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> createReview(@Valid @RequestBody ReviewRequestDTO request) {
        ReviewResponseDTO response = reviewService.createReview(request);
        return new ResponseEntity<>(ApiResponse.success("Review created", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getAllReviews() {
        List<ReviewResponseDTO> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success("Reviews retrieved", reviews));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> getReviewById(@PathVariable UUID id) {
        ReviewResponseDTO review = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved", review));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getReviewsByPatientId(@PathVariable UUID patientId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient reviews retrieved", reviews));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getReviewsByDoctorId(@PathVariable UUID doctorId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor reviews retrieved", reviews));
    }

    @GetMapping("/rating/{rating}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getReviewsByRating(@PathVariable Integer rating) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByRating(rating);
        return ResponseEntity.ok(ApiResponse.success("Reviews by rating retrieved", reviews));
    }

    @GetMapping("/doctor/{doctorId}/rating")
    public ResponseEntity<ApiResponse<DoctorRatingDTO>> getDoctorRating(@PathVariable UUID doctorId) {
        DoctorRatingDTO rating = reviewService.getDoctorRating(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor rating retrieved", rating));
    }

    @PatchMapping("/{id}/response")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> addDoctorResponse(
            @PathVariable UUID id,
            @RequestBody Map<String, String> responseData) {
        String response = responseData.get("response");
        ReviewResponseDTO updated = reviewService.addDoctorResponse(id, response);
        return ResponseEntity.ok(ApiResponse.success("Doctor response added", updated));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> updateReview(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewRequestDTO request) {
        ReviewResponseDTO updated = reviewService.updateReview(id, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
