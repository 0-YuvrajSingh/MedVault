package com.medvault.service;

import com.medvault.dto.CreateRecordRequest;
import com.medvault.dto.MedicalRecordResponse;
import com.medvault.entity.*;
import com.medvault.exception.AccessDeniedException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import com.medvault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final NotificationService notificationService;
    private final TimelineEventService timelineEventService;

    public DoctorService(MedicalRecordRepository medicalRecordRepository,
                         UserRepository userRepository,
                         PatientDoctorAssignmentRepository assignmentRepository,
                         AuditService auditService,
                         NotificationService notificationService,
                         TimelineEventService timelineEventService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.timelineEventService = timelineEventService;
    }

    @Transactional(readOnly = true)
    public List<User> getAssignedPatients(UUID doctorId) {
        userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        // Uses fetch join — no N+1
        return assignmentRepository.findAllActiveByDoctorId(doctorId).stream()
                .map(PatientDoctorAssignment::getPatient)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordResponse> getPatientRecords(UUID doctorId, UUID patientId, Pageable pageable) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        verifyAssignment(patient, doctor);

        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public MedicalRecordResponse createRecord(UUID doctorId, UUID patientId, CreateRecordRequest request) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        verifyAssignment(patient, doctor);

        MedicalRecord record = MedicalRecord.builder()
                .doctor(doctor)
                .patient(patient)
                .diagnosis(request.getDiagnosis())
                .prescription(request.getPrescription())
                .notes(request.getNotes())
                .recordDate(request.getRecordDate() != null ? request.getRecordDate() : java.time.LocalDate.now())
                .build();

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        // Audit — same transaction, rolls back if this fails
        auditService.logAction(savedRecord, doctor, "CREATE",
                "Diagnosis: " + request.getDiagnosis() + "; Prescription: " + request.getPrescription());

        // Platform audit
        auditService.logPlatformEvent(doctorId, "MEDICAL_RECORD_CREATED", "MedicalRecord",
                savedRecord.getId(), "Record created for patient: " + patient.getEmail());

        // Notify patient
        notificationService.createNotification(patient.getId(),
                "New Medical Record",
                "Dr. " + doctor.getFullName() + " has created a new medical record for you.",
                NotificationType.INFO);

        // Timeline for both parties
        timelineEventService.createEvent(patient.getId(), "Medical Record Created",
                "A new record was created by Dr. " + doctor.getFullName() + ": " + request.getDiagnosis(),
                EventType.RECORD_CREATED);
        timelineEventService.createEvent(doctorId, "Medical Record Created",
                "Created record for patient " + patient.getFullName() + ": " + request.getDiagnosis(),
                EventType.RECORD_CREATED);

        return mapToResponse(savedRecord);
    }

    private void verifyAssignment(User patient, User doctor) {
        if (!assignmentRepository.existsByPatientAndDoctorAndIsActiveTrue(patient, doctor)) {
            throw new AccessDeniedException("Doctor is not currently assigned to this patient");
        }
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return new MedicalRecordResponse(
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
