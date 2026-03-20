package com.medvault.controller;

import com.medvault.dto.FeedbackRequestDTO;
import com.medvault.dto.FeedbackResponseDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<FeedbackResponseDTO>> create(@Valid @RequestBody FeedbackRequestDTO request) {
        FeedbackResponseDTO created = feedbackService.createFeedback(request);
        return new ResponseEntity<>(ApiResponse.success("Feedback submitted", created), HttpStatus.CREATED);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<FeedbackResponseDTO>>> byDoctor(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.success("Feedback for doctor fetched", feedbackService.getFeedbackByDoctor(doctorId)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<FeedbackResponseDTO>>> byPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success("Feedback for patient fetched", feedbackService.getFeedbackByPatient(patientId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackResponseDTO>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback fetched", feedbackService.getFeedback(id)));
    }

    @GetMapping("/doctor/{doctorId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats(@PathVariable UUID doctorId) {
        Double avg = feedbackService.getAverageRatingForDoctor(doctorId);
        Long count = feedbackService.countFeedbackForDoctor(doctorId);
        Map<String, Object> payload = Map.of("averageRating", avg, "count", count);
        return ResponseEntity.ok(ApiResponse.success("Doctor feedback stats fetched", payload));
    }
}
