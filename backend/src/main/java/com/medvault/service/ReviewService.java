package com.medvault.service;

import com.medvault.dto.ReviewResponse;
import com.medvault.entity.Review;
import com.medvault.entity.User;
import com.medvault.repository.ReviewRepository;
import com.medvault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByDoctor(UUID doctorId) {
        return reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse toResponse(Review r) {
        String patientName = userRepository.findById(r.getPatientId())
                .map(User::getFullName)
                .orElse("Unknown");

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
