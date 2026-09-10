package com.medvault.service;

import com.medvault.dto.AssignDoctorRequest;
import com.medvault.dto.AssignmentResponse;
import com.medvault.dto.PlatformAuditLogResponse;
import com.medvault.dto.UserResponse;
import com.medvault.entity.*;
import com.medvault.exception.AccessDeniedException;
import com.medvault.exception.ConflictException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;
    private final TimelineEventService timelineEventService;

    public AdminService(UserRepository userRepository,
                        PatientDoctorAssignmentRepository assignmentRepository,
                        AuditLogRepository auditLogRepository,
                        MedicalRecordRepository medicalRecordRepository,
                        AuditService auditService,
                        NotificationService notificationService,
                        TimelineEventService timelineEventService) {
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
        this.timelineEventService = timelineEventService;
    }

    // ─── User listings ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getDoctors(Pageable pageable) {
        return userRepository.findByRole("ROLE_DOCTOR", pageable)
                .map(this::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getPatients(Pageable pageable) {
        return userRepository.findByRole("ROLE_PATIENT", pageable)
                .map(this::mapToUserResponse);
    }

    // ─── Doctor workflow ──────────────────────────────────────────────────────

    @Transactional
    public UserResponse approveDoctor(UUID doctorId, UUID adminId) {
        User doctor = getDoctorOrThrow(doctorId);
        doctor.setActive(true);
        userRepository.save(doctor);

        auditService.logPlatformEvent(adminId, "DOCTOR_APPROVED", "User", doctorId,
                "Doctor approved: " + doctor.getEmail());

        notificationService.createNotification(doctorId,
                "Account Approved",
                "Your doctor account has been approved by an administrator. You can now log in.",
                NotificationType.SUCCESS);

        return mapToUserResponse(doctor);
    }

    @Transactional
    public UserResponse rejectDoctor(UUID doctorId, UUID adminId) {
        User doctor = getDoctorOrThrow(doctorId);
        // Keep account inactive — leave it as is
        auditService.logPlatformEvent(adminId, "DOCTOR_REJECTED", "User", doctorId,
                "Doctor rejected: " + doctor.getEmail());

        notificationService.createNotification(doctorId,
                "Registration Not Approved",
                "Your doctor registration was not approved. Please contact the administrator for more information.",
                NotificationType.ERROR);

        return mapToUserResponse(doctor);
    }

    @Transactional
    public UserResponse deactivateDoctor(UUID doctorId, UUID adminId) {
        User doctor = getDoctorOrThrow(doctorId);
        if (!doctor.isActive()) {
            throw new IllegalArgumentException("Doctor is already inactive");
        }
        doctor.setActive(false);
        userRepository.save(doctor);

        auditService.logPlatformEvent(adminId, "DOCTOR_DEACTIVATED", "User", doctorId,
                "Doctor deactivated: " + doctor.getEmail());

        return mapToUserResponse(doctor);
    }

    private User getDoctorOrThrow(UUID doctorId) {
        User user = userRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        if (!"ROLE_DOCTOR".equals(user.getRole())) {
            throw new IllegalArgumentException("User is not a doctor");
        }
        return user;
    }

    // ─── Assignment operations ────────────────────────────────────────────────

    @Transactional
    public AssignmentResponse assignDoctorToPatient(AssignDoctorRequest request, UUID adminId) {
        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + request.getPatientId()));
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + request.getDoctorId()));

        if (!"ROLE_PATIENT".equals(patient.getRole())) {
            throw new IllegalArgumentException("User is not a patient");
        }
        if (!"ROLE_DOCTOR".equals(doctor.getRole())) {
            throw new IllegalArgumentException("User is not a doctor");
        }
        if (!doctor.isActive()) {
            throw new AccessDeniedException("Cannot assign an inactive doctor to a patient");
        }
        if (assignmentRepository.existsByPatientIdAndIsActiveTrue(patient.getId())) {
            throw new ConflictException("Patient already has an active doctor assignment. Use reassign to change it.");
        }

        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(doctor)
                .isActive(true)
                .build();
        assignmentRepository.save(assignment);

        // Audit
        auditService.logPlatformEvent(adminId, "PATIENT_ASSIGNED", "Assignment", assignment.getId(),
                "Patient " + patient.getEmail() + " assigned to Dr. " + doctor.getEmail());

        // Notifications
        notificationService.createNotification(doctor.getId(),
                "New Patient Assigned",
                "Patient " + patient.getFullName() + " has been assigned to you.",
                NotificationType.INFO);
        notificationService.createNotification(patient.getId(),
                "Doctor Assigned",
                "Dr. " + doctor.getFullName() + " has been assigned as your doctor.",
                NotificationType.INFO);

        // Timeline
        timelineEventService.createEvent(doctor.getId(), "Patient Assigned",
                "Patient " + patient.getFullName() + " assigned to your care.", EventType.ASSIGNED);
        timelineEventService.createEvent(patient.getId(), "Doctor Assigned",
                "Dr. " + doctor.getFullName() + " assigned as your doctor.", EventType.ASSIGNED);

        return mapToAssignmentResponse(assignment);
    }

    @Transactional
    public AssignmentResponse reassignPatient(UUID assignmentId, UUID newDoctorId, UUID adminId) {
        PatientDoctorAssignment oldAssignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        if (!oldAssignment.isActive()) {
            throw new IllegalArgumentException("Assignment is not active");
        }

        User newDoctor = userRepository.findById(newDoctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + newDoctorId));
        if (!"ROLE_DOCTOR".equals(newDoctor.getRole())) {
            throw new IllegalArgumentException("User is not a doctor");
        }
        if (!newDoctor.isActive()) {
            throw new AccessDeniedException("Cannot reassign to an inactive doctor");
        }
        if (oldAssignment.getDoctor().getId().equals(newDoctorId)) {
            throw new IllegalArgumentException("Patient is already assigned to this doctor");
        }

        User patient = oldAssignment.getPatient();
        User oldDoctor = oldAssignment.getDoctor();

        // Deactivate old assignment (preserve history)
        oldAssignment.setActive(false);
        assignmentRepository.save(oldAssignment);

        // Create new active assignment
        PatientDoctorAssignment newAssignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(newDoctor)
                .isActive(true)
                .build();
        assignmentRepository.save(newAssignment);

        // Audit
        auditService.logPlatformEvent(adminId, "PATIENT_REASSIGNED", "Assignment", newAssignment.getId(),
                "Patient " + patient.getEmail() + " reassigned from Dr. " + oldDoctor.getEmail()
                        + " to Dr. " + newDoctor.getEmail());

        // Notifications
        notificationService.createNotification(newDoctor.getId(),
                "New Patient Assigned",
                "Patient " + patient.getFullName() + " has been reassigned to you.",
                NotificationType.INFO);
        notificationService.createNotification(patient.getId(),
                "Doctor Changed",
                "Your doctor has been changed to Dr. " + newDoctor.getFullName() + ".",
                NotificationType.INFO);

        // Timeline
        timelineEventService.createEvent(newDoctor.getId(), "Patient Assigned",
                "Patient " + patient.getFullName() + " reassigned to your care.", EventType.REASSIGNED);
        timelineEventService.createEvent(patient.getId(), "Doctor Changed",
                "Your care was transferred to Dr. " + newDoctor.getFullName() + ".", EventType.REASSIGNED);

        return mapToAssignmentResponse(newAssignment);
    }

    @Transactional
    public void unassignPatient(UUID assignmentId, UUID adminId) {
        PatientDoctorAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        if (!assignment.isActive()) {
            throw new IllegalArgumentException("Assignment is already inactive");
        }

        User patient = assignment.getPatient();
        User doctor = assignment.getDoctor();

        assignment.setActive(false);
        assignmentRepository.save(assignment);

        // Audit
        auditService.logPlatformEvent(adminId, "PATIENT_UNASSIGNED", "Assignment", assignment.getId(),
                "Patient " + patient.getEmail() + " unassigned from Dr. " + doctor.getEmail());

        // Notification for patient
        notificationService.createNotification(patient.getId(),
                "Doctor Unassigned",
                "You have been unassigned from Dr. " + doctor.getFullName() + ". Please contact the administrator.",
                NotificationType.WARNING);

        // Timeline
        timelineEventService.createEvent(patient.getId(), "Doctor Unassigned",
                "Your assignment with Dr. " + doctor.getFullName() + " has ended.", EventType.UNASSIGNED);
    }

    // ─── Listings ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AssignmentResponse> getAllActiveAssignments(Pageable pageable) {
        return assignmentRepository.findAllActiveWithDetails(pageable)
                .map(this::mapToAssignmentResponse);
    }

    @Transactional(readOnly = true)
    public Page<PlatformAuditLogResponse> getPlatformAuditLogs(Pageable pageable) {
        Page<PlatformAuditLog> page = auditService.getPlatformAuditLogs(pageable);
        // Avoid N+1: load all distinct actor names in a single query.
        List<UUID> actorIds = page.getContent().stream()
                .map(PlatformAuditLog::getActorId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());
        Map<UUID, String> actorNames = userRepository.findAllById(actorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getFullName));
        return page.map(log -> {
                    String actorName = log.getActorId() != null
                            ? actorNames.getOrDefault(log.getActorId(), "Unknown")
                            : "System";
                    return PlatformAuditLogResponse.builder()
                            .id(log.getId())
                            .actorId(log.getActorId())
                            .actorName(actorName)
                            .action(log.getAction())
                            .entityType(log.getEntityType())
                            .entityId(log.getEntityId())
                            .detail(log.getDetail())
                            .performedAt(log.getPerformedAt())
                            .build();
                });
    }

    @Transactional(readOnly = true)
    public Page<com.medvault.dto.AuditLogResponse> getRecordAuditLog(UUID recordId, Pageable pageable) {
        return auditLogRepository.findByRecordIdOrderByPerformedAtDesc(recordId, pageable)
                .map(log -> new com.medvault.dto.AuditLogResponse(
                        log.getId(),
                        log.getRecord().getId(),
                        log.getAction(),
                        log.getPerformedBy().getFullName(),
                        log.getPerformedAt(),
                        log.getDetailSnapshot()
                ));
    }

    @Transactional(readOnly = true)
    public Page<com.medvault.dto.MedicalRecordResponse> getPatientRecords(UUID patientId, Pageable pageable) {
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .map(this::mapToMedicalRecordResponse);
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.isActive());
    }

    private AssignmentResponse mapToAssignmentResponse(PatientDoctorAssignment a) {
        return new AssignmentResponse(
                a.getId(), a.getPatient().getId(), a.getPatient().getFullName(),
                a.getDoctor().getId(), a.getDoctor().getFullName(),
                a.getAssignedAt(), a.isActive()
        );
    }

    private com.medvault.dto.MedicalRecordResponse mapToMedicalRecordResponse(com.medvault.entity.MedicalRecord record) {
        return new com.medvault.dto.MedicalRecordResponse(
                record.getId(), record.getPatient().getId(), record.getDoctor().getFullName(),
                record.getDiagnosis(), record.getPrescription(), record.getNotes(),
                record.getRecordDate(), record.getCreatedAt()
        );
    }
}
