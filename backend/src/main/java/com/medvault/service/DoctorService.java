package com.medvault.service;

import com.medvault.dto.CreateRecordRequest;
import com.medvault.dto.MedicalRecordResponse;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.User;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import com.medvault.repository.UserRepository;
import com.medvault.exception.AccessDeniedException;
import com.medvault.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final AuditService auditService;

    public DoctorService(MedicalRecordRepository medicalRecordRepository, UserRepository userRepository,
                         PatientDoctorAssignmentRepository assignmentRepository, AuditService auditService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<User> getAssignedPatients(UUID doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        return assignmentRepository.findAllByDoctorId(doctorId).stream()
                .map(assignment -> assignment.getPatient())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getPatientRecords(UUID doctorId, UUID patientId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!assignmentRepository.existsByPatientAndDoctor(patient, doctor)) {
            throw new AccessDeniedException("Doctor is not assigned to this patient");
        }

        return medicalRecordRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicalRecordResponse createRecord(UUID doctorId, UUID patientId, CreateRecordRequest request) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (!assignmentRepository.existsByPatientAndDoctor(patient, doctor)) {
            throw new AccessDeniedException("Doctor is not assigned to this patient");
        }

        MedicalRecord record = MedicalRecord.builder()
                .doctor(doctor)
                .patient(patient)
                .diagnosis(request.getDiagnosis())
                .prescription(request.getPrescription())
                .notes(request.getNotes())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Audit Write (same transaction). Rollback will happen if audit fails.
        auditService.logAction(savedRecord, doctor, "CREATE", "Diagnosis: " + request.getDiagnosis() + ", Prescription: " + request.getPrescription());

        return mapToResponse(savedRecord);
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return new MedicalRecordResponse(
                record.getId(),
                record.getPatient().getId(),
                record.getDoctor().getFullName(),
                record.getDiagnosis(),
                record.getPrescription(),
                record.getNotes(),
                record.getCreatedAt()
        );
    }
}
