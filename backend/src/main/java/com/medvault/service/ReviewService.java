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
    private final WorkspaceAccessService workspaceAccessService;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         PatientDoctorAssignmentRepository assignmentRepository,
                         AuditService auditService,
                         TimelineEventService timelineEventService,
                         WorkspaceAccessService workspaceAccessService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditService = auditService;
        this.timelineEventService = timelineEventService;
        this.workspaceAccessService = workspaceAccessService;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByDoctor(UUID doctorId) {
        List<Review> reviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);

        // Workspace isolation: hide reviews whose patient sits in a workspace-scoped
        // assignment the reading doctor is not a member of.
        List<Review> visible = reviews.stream()
                .filter(r -> isReviewVisibleToDoctor(r, doctorId))
                .collect(Collectors.toList());

        // Avoid N+1: collect all distinct patient IDs and load in a single query
        List<UUID> patientIds = visible.stream()
                .map(Review::getPatientId)
                .distinct()
                .collect(Collectors.toList());

        // Load all needed users in one query
        java.util.Map<UUID, String> patientNames = userRepository.findAllById(patientIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));

        return visible.stream()
                .map(r -> toResponse(r, patientNames.getOrDefault(r.getPatientId(), "Unknown")))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByDoctor(UUID doctorId, Pageable pageable) {
        // Visibility enforced in the query (with matching count) so pagination totals
        // never reveal hidden workspace-scoped rows.
        Page<Review> page = reviewRepository.findVisibleByDoctorId(doctorId, pageable);

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
     * A review is visible to a doctor when the reviewer's active assignment is unscoped
     * (V1) or the doctor is an active member of its workspace. Reviews without any
     * active assignment stay visible (V1 semantics preserved).
     */
    private boolean isReviewVisibleToDoctor(Review review, UUID doctorId) {
        Optional<PatientDoctorAssignment> assignmentOpt =
                assignmentRepository.findByPatientIdAndIsActiveTrue(review.getPatientId());
        if (assignmentOpt.isEmpty() || assignmentOpt.get().getWorkspace() == null) {
            return true;
        }
        return workspaceAccessService.isActiveMember(
                assignmentOpt.get().getWorkspace().getId(), doctorId);
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

        // Workspace gate (non-members get 404); the assignment requirement above keeps its 403.
        workspaceAccessService.requireMemberOf(assignment.getWorkspace(), patientId);

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
