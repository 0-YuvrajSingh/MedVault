package com.medvault.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.DoctorRatingDTO;
import com.medvault.dto.NotificationRequestDTO;
import com.medvault.dto.ReviewRequestDTO;
import com.medvault.dto.ReviewResponseDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Doctor;
import com.medvault.model.NotificationType;
import com.medvault.model.Patient;
import com.medvault.model.Review;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.ReviewRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO request) {
        // Validate patient exists
        UUID patientId = request.getPatientId();
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        UUID doctorId = request.getDoctorId();
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        // Create review
        Review review = new Review();
        review.setPatient(patient);
        review.setDoctor(doctor);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        // Convert LocalDate to LocalDateTime at start of day
        if (request.getReviewDate() != null) {
            review.setReviewDate(request.getReviewDate().atStartOfDay());
        } else {
            review.setReviewDate(java.time.LocalDateTime.now());
        }

        Review savedReview = reviewRepository.save(review);

        // Notify doctor about new review
        notificationService.createNotification(new NotificationRequestDTO(
                doctor.getUser().getId(),
                "New Review Received",
                "Patient " + patient.getUser().getName() + " rated you " + review.getRating() + " stars.",
                NotificationType.REVIEW
        ));

        return toResponseDTO(savedReview);
    }

    public ReviewResponseDTO getReviewById(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Review ID cannot be null");
        }
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));
        return toResponseDTO(review);
    }

    public List<ReviewResponseDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<ReviewResponseDTO> getReviewsByPatientId(UUID patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        return reviewRepository.findByPatient_Id(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<ReviewResponseDTO> getReviewsByDoctorId(UUID doctorId) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        return reviewRepository.findByDoctor_IdOrderByReviewDateDesc(doctorId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<ReviewResponseDTO> getReviewsByRating(Integer rating) {
        return reviewRepository.findByRating(rating).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public DoctorRatingDTO getDoctorRating(UUID doctorId) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) {
            // Return a default DoctorRatingDTO for non-existent doctor (or you can throw, but this avoids 404)
            return new DoctorRatingDTO(
                    doctorId.toString(),
                    "Unknown Doctor",
                    "",
                    0.0,
                    0L
            );
        }

        Double averageRating = reviewRepository.findAverageRatingByDoctorId(doctorId);
        Long totalReviews = reviewRepository.countReviewsByDoctorId(doctorId);

        return new DoctorRatingDTO(
                doctor.getId().toString(),
                doctor.getUser().getName(),
                doctor.getSpecialization(),
                averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0,
                totalReviews != null ? totalReviews : 0L
        );
    }

    @Transactional
    public ReviewResponseDTO addDoctorResponse(UUID id, String response) {

        if (id == null) {
            throw new IllegalArgumentException("Review ID cannot be null");
        }
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));

        review.setDoctorResponse(response);
        review.setResponseDate(LocalDateTime.now());

        Review updatedReview = reviewRepository.save(review);

        // Notify patient about doctor's response
        notificationService.createNotification(new NotificationRequestDTO(
                review.getPatient().getUser().getId(),
                "Doctor Responded to Your Review",
                "Dr. " + review.getDoctor().getUser().getName() + " has responded to your review.",
                NotificationType.REVIEW
        ));

        return toResponseDTO(updatedReview);
    }

    @Transactional
    public ReviewResponseDTO updateReview(UUID id, ReviewRequestDTO request) {

        if (id == null) {
            throw new IllegalArgumentException("Review ID cannot be null");
        }
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + id));

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);
        return toResponseDTO(updatedReview);
    }

    @Transactional
    public void deleteReview(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Review ID cannot be null");
        }
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review not found with ID: " + id);
        }
        reviewRepository.deleteById(id);
    }

    // Helper method for DTO conversion (NO MAPPER)
    private ReviewResponseDTO toResponseDTO(Review review) {
        return new ReviewResponseDTO(
                review.getId(),
                review.getPatient().getId(),
                review.getPatient().getUser().getName(),
                review.getDoctor().getId(),
                review.getDoctor().getUser().getName(),
                review.getDoctor().getSpecialization(),
                review.getRating(),
                review.getComment(),
                review.getReviewDate(),
                review.getDoctorResponse(),
                review.getResponseDate(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
