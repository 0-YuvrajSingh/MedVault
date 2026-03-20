package com.medvault.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.FeedbackRequestDTO;
import com.medvault.dto.FeedbackResponseDTO;
import com.medvault.model.Doctor;
import com.medvault.model.Feedback;
import com.medvault.model.Patient;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.FeedbackRepository;
import com.medvault.repository.PatientRepository;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, PatientRepository patientRepository, DoctorRepository doctorRepository) {
        this.feedbackRepository = feedbackRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional
    public FeedbackResponseDTO createFeedback(FeedbackRequestDTO request) {
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        if (request.getDoctorId() == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        if (request.getDoctorId() == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        Patient patient = patientRepository.findById(Objects.requireNonNull(request.getPatientId(), "Patient ID cannot be null"))
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(Objects.requireNonNull(request.getDoctorId(), "Doctor ID cannot be null"))
            .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Feedback feedback = new Feedback();
        feedback.setPatient(patient);
        feedback.setDoctor(doctor);
        feedback.setMessage(request.getMessage());
        feedback.setRating(request.getRating());

        Feedback saved = feedbackRepository.save(feedback);
        return toDTO(saved);
    }

    public List<FeedbackResponseDTO> getFeedbackByDoctor(UUID doctorId) {
        return feedbackRepository.findByDoctor_Id(doctorId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackByPatient(UUID patientId) {
        return feedbackRepository.findByPatient_Id(patientId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public FeedbackResponseDTO getFeedback(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Feedback ID cannot be null");
        }
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new RuntimeException("Feedback not found"));
        return toDTO(feedback);
    }

    public Double getAverageRatingForDoctor(UUID doctorId) {
        Double avg = feedbackRepository.findAverageRatingByDoctor(doctorId);
        return avg != null ? avg : 0.0;
    }

    public Long countFeedbackForDoctor(UUID doctorId) {
        Long count = feedbackRepository.countByDoctor(doctorId);
        return count != null ? count : 0L;
    }

    private FeedbackResponseDTO toDTO(Feedback f) {
        return new FeedbackResponseDTO(
                f.getId(),
                f.getPatient() != null ? f.getPatient().getId() : null,
                f.getDoctor() != null ? f.getDoctor().getId() : null,
                f.getMessage(),
                f.getRating(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}
