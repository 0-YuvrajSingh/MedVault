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
    private final com.medvault.repository.AuditLogRepository auditLogRepository;
    private final com.medvault.repository.MedicalRecordRepository medicalRecordRepository;

    public AdminService(UserRepository userRepository, PatientDoctorAssignmentRepository assignmentRepository, com.medvault.repository.AuditLogRepository auditLogRepository, com.medvault.repository.MedicalRecordRepository medicalRecordRepository) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleAccountStatus(UUID userId, boolean activate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.medvault.exception.ResourceNotFoundException("User not found with id: " + userId));

        user.setActive(activate);
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Transactional
    public void assignDoctorToPatient(AssignDoctorRequest request) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new com.medvault.exception.ResourceNotFoundException("Patient not found with id: " + request.getPatientId()));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new com.medvault.exception.ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (!"ROLE_PATIENT".equals(patient.getRole())) {
            throw new IllegalArgumentException("User mapped to patientId is not a PATIENT");
        }
        if (!"ROLE_DOCTOR".equals(doctor.getRole())) {
            throw new IllegalArgumentException("User mapped to doctorId is not a DOCTOR");
        }
        if (!doctor.isActive()) {
            throw new com.medvault.exception.AccessDeniedException("Cannot assign an inactive doctor to a patient");
        }

        boolean assignmentExists = assignmentRepository.existsByPatientAndDoctor(patient, doctor);
        if (assignmentExists) {
            throw new com.medvault.exception.ConflictException("An assignment already exists between this patient and doctor");
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

    @Transactional(readOnly = true)
    public List<com.medvault.dto.AssignmentResponse> getAllActiveAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::mapToAssignmentResponse)
                .collect(Collectors.toList());
    }

    private com.medvault.dto.AssignmentResponse mapToAssignmentResponse(PatientDoctorAssignment assignment) {
        return new com.medvault.dto.AssignmentResponse(
                assignment.getId(),
                assignment.getPatient().getId(),
                assignment.getPatient().getFullName(),
                assignment.getDoctor().getId(),
                assignment.getDoctor().getFullName(),
                assignment.getAssignedAt(),
                true
        );
    }

    @Transactional(readOnly = true)
    public List<com.medvault.dto.AuditLogResponse> getAuditLog(UUID recordId) {
        return auditLogRepository.findByRecordIdOrderByPerformedAtDesc(recordId)
                .stream()
                .map(log -> new com.medvault.dto.AuditLogResponse(
                        log.getId(),
                        log.getRecord().getId(),
                        log.getAction(),
                        log.getPerformedBy().getFullName(),
                        log.getPerformedAt(),
                        log.getDetailSnapshot()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.medvault.dto.MedicalRecordResponse> getPatientRecords(UUID patientId) {
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(this::mapToMedicalRecordResponse)
                .collect(Collectors.toList());
    }

    private com.medvault.dto.MedicalRecordResponse mapToMedicalRecordResponse(com.medvault.entity.MedicalRecord record) {
        return new com.medvault.dto.MedicalRecordResponse(
                record.getId(),
                record.getPatient().getId(),
                record.getDoctor().getFullName(),
                record.getDiagnosis(),
                record.getPrescription(),
                record.getNotes(),
                record.getRecordDate(),
                record.getCreatedAt()
        );
    }
}
