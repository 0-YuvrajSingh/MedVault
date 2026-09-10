package com.medvault.service;

import com.medvault.dto.CreateReviewRequest;
import com.medvault.dto.ReviewResponse;
import com.medvault.entity.*;
import com.medvault.exception.AccessDeniedException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import com.medvault.repository.ReviewRepository;
import com.medvault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final AuditService auditService;
    private final TimelineEventService timelineEventService;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         PatientDoctorAssignmentRepository assignmentRepository,
                         AuditService auditService,
                         TimelineEventService timelineEventService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditService = auditService;
        this.timelineEventService = timelineEventService;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByDoctor(UUID doctorId) {
        List<Review> reviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);

        // Avoid N+1: collect all distinct patient IDs and load in a single query
        List<UUID> patientIds = reviews.stream()
                .map(Review::getPatientId)
                .distinct()
                .collect(Collectors.toList());

        // Load all needed users in one query
        java.util.Map<UUID, String> patientNames = userRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        return reviews.stream()
                .map(r -> toResponse(r, patientNames.getOrDefault(r.getPatientId(), "Unknown")))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByDoctor(UUID doctorId, Pageable pageable) {
        Page<Review> page = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId, pageable);

        // Avoid N+1: collect all distinct patient IDs on this page and load in a single query
        List<UUID> patientIds = page.getContent().stream()
                .map(Review::getPatientId)
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<UUID, String> patientNames = userRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        return page.map(r -> toResponse(r, patientNames.getOrDefault(r.getPatientId(), "Unknown")));
    }

    /**
     * Creates or updates (upsert) a review from a patient for their currently assigned doctor.
     * The patient is not allowed to specify the doctorId — it is derived from their active assignment.
     */
    @Transactional
    public ReviewResponse createOrUpdateReview(UUID patientId, CreateReviewRequest request) {
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        // Derive the doctor from the active assignment — patient cannot inject arbitrary doctorId
        PatientDoctorAssignment assignment = assignmentRepository.findByPatientIdAndIsActiveTrue(patientId)
                .orElseThrow(() -> new AccessDeniedException("You must have an assigned doctor to submit a review"));

        User doctor = assignment.getDoctor();

        // Check for existing review (upsert)
        Optional<Review> existingOpt = reviewRepository.findByPatientIdAndDoctorId(patientId, doctor.getId());

        Review review;
        boolean isNew;
        if (existingOpt.isPresent()) {
            review = existingOpt.get();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            isNew = false;
        } else {
            review = Review.builder()
                    .patientId(patientId)
                    .doctorId(doctor.getId())
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .build();
            isNew = true;
        }

        reviewRepository.save(review);

        // Audit
        String action = isNew ? "REVIEW_CREATED" : "REVIEW_UPDATED";
        auditService.logPlatformEvent(patientId, action, "Review", review.getId(),
                "Patient " + patient.getEmail() + " reviewed Dr. " + doctor.getEmail()
                        + " with rating " + request.getRating());

        // Timeline for patient
        timelineEventService.createEvent(patientId,
                isNew ? "Review Submitted" : "Review Updated",
                "You " + (isNew ? "submitted a" : "updated your") + " review for Dr. " + doctor.getFullName()
                        + " (Rating: " + request.getRating() + "/5)",
                EventType.REVIEW_CREATED);

        return toResponse(review, patient.getFullName());
    }

    private ReviewResponse toResponse(Review r, String patientName) {
        return ReviewResponse.builder()
                .id(r.getId())
                .doctorId(r.getDoctorId())
                .patientId(r.getPatientId())
                .patientName(patientName)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
