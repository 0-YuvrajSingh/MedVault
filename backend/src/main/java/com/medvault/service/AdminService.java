package com.medvault.service;

import com.medvault.dto.AssignDoctorRequest;
import com.medvault.dto.UserResponse;
import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import com.medvault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;

    public AdminService(UserRepository userRepository, PatientDoctorAssignmentRepository assignmentRepository) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(String role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleAccountStatus(UUID userId, boolean activate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setActive(activate);
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void assignDoctorToPatient(AssignDoctorRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + request.getDoctorId()));

        if (!"ROLE_PATIENT".equals(patient.getRole())) {
            throw new IllegalArgumentException("User mapped to patientId is not a PATIENT");
        }

        if (!"ROLE_DOCTOR".equals(doctor.getRole())) {
            throw new IllegalArgumentException("User mapped to doctorId is not a DOCTOR");
        }

        if (!doctor.isActive()) {
            throw new IllegalStateException("Cannot assign an inactive doctor to a patient");
        }

        boolean assignmentExists = assignmentRepository.existsByPatientAndDoctor(patient, doctor);
        if (assignmentExists) {
            throw new IllegalStateException("An assignment already exists between this patient and doctor");
        }

        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(doctor)
                .build();

        assignmentRepository.save(assignment);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isActive()
        );
    }
}
