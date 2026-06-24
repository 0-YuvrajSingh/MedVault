package com.medvault.service;

import com.medvault.dto.AssignDoctorRequest;
import com.medvault.dto.UserResponse;
import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import com.medvault.entity.UserRole;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import com.medvault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    public List<UserResponse> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleAccountStatus(Long userId, boolean activate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(activate);
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void assignDoctorToPatient(AssignDoctorRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + request.getPatientId()));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + request.getDoctorId()));

        if (patient.getRole() != UserRole.PATIENT) {
            throw new IllegalArgumentException("User mapped to patientId is not a PATIENT");
        }

        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new IllegalArgumentException("User mapped to doctorId is not a DOCTOR");
        }

        if (Boolean.FALSE.equals(doctor.getIsActive())) {
            throw new IllegalStateException("Cannot assign an inactive doctor to a patient");
        }

        boolean assignmentExists = assignmentRepository.existsByPatientAndDoctorAndIsActiveTrue(patient, doctor);
        if (assignmentExists) {
            throw new IllegalStateException("An active assignment already exists between this patient and doctor");
        }

        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(doctor)
                .isActive(true)
                .build();

        assignmentRepository.save(assignment);
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}
