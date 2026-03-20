package com.medvault.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.ActivityTrendDTO;
import com.medvault.dto.DashboardStatsDTO;
import com.medvault.dto.DoctorResponseDTO;
import com.medvault.dto.NotificationRequestDTO;
import com.medvault.dto.NotificationStatsDTO;
import com.medvault.dto.ReportStatsDTO;
import com.medvault.dto.UserEngagementDTO;
import com.medvault.dto.UserSummaryDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.AppointmentStatus;
import com.medvault.model.Doctor;
import com.medvault.model.Document;
import com.medvault.model.NotificationType;
import com.medvault.model.Patient;
import com.medvault.model.ReportGenerationLog;
import com.medvault.model.Review;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.AccessRequestRepository;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.DocumentPermissionRepository;
import com.medvault.repository.DocumentRepository;
import com.medvault.repository.FeedbackRepository;
import com.medvault.repository.FileMetadataRepository;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.NotificationRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.PendingDoctorRepository;
import com.medvault.repository.ReportGenerationLogRepository;
import com.medvault.repository.ReviewRepository;
import com.medvault.repository.SlotRepository;
import com.medvault.repository.UserRepository;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    @Autowired
    private ReportGenerationLogRepository reportGenerationLogRepository;

    public void logReportGeneration(String reportType, String generatedBy) {
        ReportGenerationLog log = new ReportGenerationLog();
        log.setReportType(reportType);
        log.setGeneratedBy(generatedBy);
        log.setGeneratedAt(LocalDateTime.now());
        reportGenerationLogRepository.save(log);
    }

    public ReportStatsDTO getReportStats() {
        long count = reportGenerationLogRepository.count();
        ReportGenerationLog lastLog = reportGenerationLogRepository.findTopByOrderByGeneratedAtDesc();
        LocalDateTime lastGenerated = lastLog != null ? lastLog.getGeneratedAt() : null;
        return new ReportStatsDTO(count, lastGenerated);
    }

    private final UserRepository userRepository;
    private final PendingDoctorRepository pendingDoctorRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final DocumentRepository documentRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final FileMetadataRepository fileMetadataRepository;
    private final SlotRepository slotRepository;
    private final AccessRequestRepository accessRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final DocumentPermissionRepository documentPermissionRepository;
    private final FeedbackRepository feedbackRepository;

    public AdminService(UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            MedicalRecordRepository medicalRecordRepository,
            DocumentRepository documentRepository,
            ReviewRepository reviewRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService,
            FileMetadataRepository fileMetadataRepository,
            SlotRepository slotRepository,
            AccessRequestRepository accessRequestRepository,
            AuditLogRepository auditLogRepository,
            DocumentPermissionRepository documentPermissionRepository,
            FeedbackRepository feedbackRepository,
            PendingDoctorRepository pendingDoctorRepository) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.documentRepository = documentRepository;
        this.reviewRepository = reviewRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.fileMetadataRepository = fileMetadataRepository;
        this.slotRepository = slotRepository;
        this.accessRequestRepository = accessRequestRepository;
        this.auditLogRepository = auditLogRepository;
        this.documentPermissionRepository = documentPermissionRepository;
        this.feedbackRepository = feedbackRepository;
        this.pendingDoctorRepository = pendingDoctorRepository;
    }

    /**
     * Returns a list of users created between the given start and end
     * date-times.
     *
     * @param start Start date-time (inclusive)
     * @param end End date-time (inclusive)
     * @return List of UserSummaryDTO
     */
    public List<UserSummaryDTO> getUsersByDateRange(LocalDateTime start, LocalDateTime end) {
        return userRepository.findByCreatedAtBetween(start, end).stream()
                .map(user -> new UserSummaryDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        ))
                .collect(Collectors.toList());
    }

    public DashboardStatsDTO getDashboardStats() {
        Long totalUsers = userRepository.count();
        Long totalDoctors = doctorRepository.count();
        Long totalPatients = patientRepository.count();

        Long verifiedDoctors = doctorRepository.findAll().stream()
                .filter(Doctor::getIsVerified)
                .count();
        Long unverifiedDoctors = totalDoctors - verifiedDoctors;

        Long totalAppointments = appointmentRepository.count();
        Long pendingAppointments = (long) (appointmentRepository.findByStatus(AppointmentStatus.PENDING).size()
                + appointmentRepository.findByStatus(AppointmentStatus.CONFIRMED).size());
        Long completedAppointments = (long) appointmentRepository.findByStatus(AppointmentStatus.COMPLETED).size();

        Long totalMedicalRecords = medicalRecordRepository.count();
        Long totalDocuments = documentRepository.count();
        Long unverifiedDocuments = (long) documentRepository.findByIsVerified(false).size();

        Long totalReviews = reviewRepository.count();
        Double averageRating = reviewRepository.findAll().stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Long totalEmergencyRequests = 0L;
        Long pendingEmergencies = 0L;
        Long criticalEmergencies = 0L;

        return new DashboardStatsDTO(
                totalUsers,
                totalDoctors,
                totalPatients,
                verifiedDoctors,
                unverifiedDoctors,
                totalAppointments,
                pendingAppointments,
                completedAppointments,
                totalMedicalRecords,
                totalDocuments,
                unverifiedDocuments,
                totalReviews,
                Math.round(averageRating * 10.0) / 10.0,
                totalEmergencyRequests,
                pendingEmergencies,
                criticalEmergencies
        );
    }

    public List<UserSummaryDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserSummaryDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        ))
                .toList();
    }

    // Get unverified doctors (isVerified == false)
    public List<DoctorResponseDTO> getUnverifiedDoctors() {
        return doctorRepository.findByIsVerified(false).stream()
                .map(this::toDoctorResponseDTO)
                .toList();
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"doctors", "verifiedDoctors", "doctorsBySpecialization", "doctorProfile"}, allEntries = true)
    public DoctorResponseDTO verifyDoctor(@org.springframework.lang.NonNull UUID userId) {
        // Find doctor by user ID instead of doctor ID
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with user ID: " + userId));
        doctor.setIsVerified(true);
        Doctor verifiedDoctor = doctorRepository.save(doctor);

        notificationService.createNotification(new NotificationRequestDTO(
                verifiedDoctor.getUser().getId(),
                "Doctor Account Verified",
                "Your doctor account has been verified by the admin. You can now start accepting appointments.",
                NotificationType.GENERAL
        ));

        return toDoctorResponseDTO(verifiedDoctor);
    }

    @Transactional
    public void deleteUser(@org.springframework.lang.NonNull UUID userId) {
        try {
            if (!userRepository.existsById(userId)) {
                throw new ResourceNotFoundException("User not found with ID: " + userId);
            }

            // Fetch patient and doctor entities if they exist
            var patientOpt = patientRepository.findByUserId(userId);
            var doctorOpt = doctorRepository.findByUserId(userId);

            // Delete all related appointments, records, documents, reviews, emergencies as patient
            if (patientOpt.isPresent()) {
                var patient = patientOpt.get();
                var patientId = patient.getId();
                appointmentRepository.deleteAll((java.util.List<com.medvault.model.Appointment>) appointmentRepository.findByPatient_Id(patientId));
                medicalRecordRepository.deleteAll((java.util.List<com.medvault.model.MedicalRecord>) medicalRecordRepository.findByPatient_Id(patientId));
                documentRepository.deleteAll((java.util.List<com.medvault.model.Document>) documentRepository.findByPatient_Id(patientId));
                reviewRepository.deleteAll((java.util.List<com.medvault.model.Review>) reviewRepository.findByPatient_Id(patientId));
                // Delete AccessRequests
                accessRequestRepository.deleteAll(accessRequestRepository.findByPatient(patient));
                // Delete Feedback
                feedbackRepository.deleteAll(feedbackRepository.findByPatient_Id(patientId));
                // Delete patient profile
                patientRepository.delete(patient);
            }

            // Delete all related appointments, records, documents, reviews, emergencies as doctor
            if (doctorOpt.isPresent()) {
                var doctor = doctorOpt.get();
                var doctorId = doctor.getId();
                // Delete slots first (foreign key constraint - slots reference doctor)
                slotRepository.deleteAll((java.util.List<com.medvault.model.Slot>) slotRepository.findByDoctor_Id(doctorId));
                appointmentRepository.deleteAll((java.util.List<com.medvault.model.Appointment>) appointmentRepository.findByDoctor_Id(doctorId));
                medicalRecordRepository.deleteAll((java.util.List<com.medvault.model.MedicalRecord>) medicalRecordRepository.findByDoctor_Id(doctorId));
                documentRepository.deleteAll((java.util.List<com.medvault.model.Document>) documentRepository.findByUploadedByDoctor_Id(doctorId));
                reviewRepository.deleteAll((java.util.List<com.medvault.model.Review>) reviewRepository.findByDoctor_Id(doctorId));
                // Delete AccessRequests
                accessRequestRepository.deleteAll(accessRequestRepository.findByDoctor(doctor));
                // Delete DocumentPermissions
                documentPermissionRepository.deleteAll(documentPermissionRepository.findByDoctor_Id(doctorId));
                // Delete Feedback
                feedbackRepository.deleteAll(feedbackRepository.findByDoctor_Id(doctorId));
                // Delete doctor profile
                doctorRepository.delete(doctor);
            }

            // Delete all related notifications
            notificationRepository.deleteAll((java.util.List<com.medvault.model.Notification>) notificationRepository.findByUser_Id(userId));
            // Delete all file metadata for this user
            fileMetadataRepository.deleteAll((java.util.List<com.medvault.model.FileMetadata>) fileMetadataRepository.findByRelatedUser_Id(userId));
            // Delete AuditLogs
            auditLogRepository.deleteAll(auditLogRepository.findByUserId(userId));
            // Delete pending doctor record if exists
            pendingDoctorRepository.deleteByUserId(userId);
            pendingDoctorRepository.flush();
            // Finally, delete the user
            userRepository.deleteById(userId);
        } catch (Exception ex) {
            logger.error("Failed to delete user {}: {}", userId, ex.getMessage(), ex);
            throw new RuntimeException("Failed to delete user: " + ex.getMessage());
        }
    }

    // Analytics methods
    public NotificationStatsDTO getNotificationStats() {
        Long total = notificationRepository.count();
        Long unread = notificationRepository.findAll().stream()
                .filter(n -> !n.getIsRead())
                .count();
        Long read = total - unread;
        Double readRate = total > 0 ? (read * 100.0 / total) : 0.0;

        Long appointment = notificationRepository.countByType(NotificationType.APPOINTMENT);
        Long document = notificationRepository.countByType(NotificationType.DOCUMENT);
        Long review = notificationRepository.countByType(NotificationType.REVIEW);
        Long general = notificationRepository.countByType(NotificationType.GENERAL);

        return new NotificationStatsDTO(
                total,
                unread,
                read,
                Math.round(readRate * 10.0) / 10.0,
                appointment,
                document,
                0L,
                review,
                general
        );
    }

    public List<UserEngagementDTO> getUserEngagementMetrics() {
        return userRepository.findAll().stream()
                .map(this::calculateUserEngagement)
                .collect(Collectors.toList());
    }

    public UserEngagementDTO getUserEngagement(@org.springframework.lang.NonNull UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return calculateUserEngagement(user);
    }

    public ActivityTrendDTO getTodayActivity() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        Long newUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfDay))
                .count();

        Long newDoctors = doctorRepository.findAll().stream()
                .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(startOfDay))
                .count();

        Long newPatients = patientRepository.findAll().stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfDay))
                .count();

        Long apptCreated = appointmentRepository.findAll().stream()
                .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isAfter(startOfDay))
                .count();

        Long apptCompleted = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED
                && a.getUpdatedAt() != null && a.getUpdatedAt().isAfter(startOfDay))
                .count();

        Long apptCancelled = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED
                && a.getUpdatedAt() != null && a.getUpdatedAt().isAfter(startOfDay))
                .count();

        Long docsUploaded = documentRepository.findAll().stream()
                .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().isAfter(startOfDay))
                .count();

        Long docsVerified = documentRepository.findAll().stream()
                .filter(d -> d.getIsVerified() && d.getVerifiedDate() != null
                && d.getVerifiedDate().isAfter(startOfDay))
                .count();

        List<Review> todayReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(startOfDay))
                .toList();

        Long reviewsSubmitted = (long) todayReviews.size();
        Double avgRating = todayReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        Long emergCreated = 0L;

        Long emergResolved = 0L;

        Long notifsSent = notificationRepository.findAll().stream()
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isAfter(startOfDay))
                .count();

        Long notifsRead = notificationRepository.findAll().stream()
                .filter(n -> n.getIsRead() && n.getCreatedAt() != null
                && n.getCreatedAt().isAfter(startOfDay))
                .count();

        return new ActivityTrendDTO(
                LocalDateTime.now().toLocalDate().toString(),
                newUsers,
                newDoctors,
                newPatients,
                apptCreated,
                apptCompleted,
                apptCancelled,
                docsUploaded,
                docsVerified,
                reviewsSubmitted,
                Math.round(avgRating * 10.0) / 10.0,
                emergCreated,
                emergResolved,
                notifsSent,
                notifsRead
        );
    }

    private UserEngagementDTO calculateUserEngagement(User user) {
        UserEngagementDTO dto = new UserEngagementDTO();
        dto.setUserId(user.getId().toString());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setRegisteredAt(user.getCreatedAt());
        dto.setLastActive(user.getUpdatedAt());

        Long totalNotifs = notificationRepository.countByUser_Id(user.getId());
        Long readNotifs = notificationRepository.countByUser_IdAndIsReadTrue(user.getId());
        Double readRate = totalNotifs > 0 ? (readNotifs * 100.0 / totalNotifs) : 0.0;

        dto.setNotificationsSent(totalNotifs);
        dto.setNotificationsRead(readNotifs);
        dto.setNotificationReadRate(Math.round(readRate * 10.0) / 10.0);

        if (user.getRole() == Role.PATIENT) {
            UUID patientUserId = user.getId();
            if (patientUserId == null) {
                throw new ResourceNotFoundException("Patient user ID is missing");
            }
            Patient patient = patientRepository.findByUserId(patientUserId).orElse(null);
            if (patient != null) {
                Long totalAppts = (long) appointmentRepository.findByPatient_Id(patient.getId()).size();
                Long completed = appointmentRepository.findByPatient_Id(patient.getId()).stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                        .count();
                Long cancelled = appointmentRepository.findByPatient_Id(patient.getId()).stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                        .count();

                dto.setTotalAppointments(totalAppts);
                dto.setCompletedAppointments(completed);
                dto.setCancelledAppointments(cancelled);

                UUID patientId = patient.getId();
                if (patientId == null) {
                    throw new ResourceNotFoundException("Patient ID is missing");
                }
                Long totalDocs = (long) documentRepository.findByPatient_IdOrderByUploadDateDesc(patientId).size();
                Long verifiedDocs = documentRepository.findByPatient_IdOrderByUploadDateDesc(patientId).stream()
                        .filter(Document::getIsVerified)
                        .count();

                dto.setTotalDocuments(totalDocs);
                dto.setVerifiedDocuments(verifiedDocs);

                Long totalReviews = (long) reviewRepository.findByPatient_Id(patient.getId()).size();
                Double avgGiven = reviewRepository.findByPatient_Id(patient.getId()).stream()
                        .mapToInt(Review::getRating)
                        .average()
                        .orElse(0.0);

                dto.setTotalReviews(totalReviews);
                dto.setAverageRatingGiven(Math.round(avgGiven * 10.0) / 10.0);

                                dto.setEmergencyRequests(0L);
                                dto.setResolvedEmergencies(0L);
            }
        } else if (user.getRole() == Role.DOCTOR) {
            UUID doctorUserId = user.getId();
            if (doctorUserId == null) {
                throw new ResourceNotFoundException("Doctor user ID is missing");
            }
            Doctor doctor = doctorRepository.findByUserId(doctorUserId).orElse(null);
            if (doctor != null) {
                Long totalAppts = (long) appointmentRepository.findByDoctor_Id(doctor.getId()).size();
                Long completed = appointmentRepository.findByDoctor_Id(doctor.getId()).stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                        .count();
                Long cancelled = appointmentRepository.findByDoctor_Id(doctor.getId()).stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                        .count();

                dto.setTotalAppointments(totalAppts);
                dto.setCompletedAppointments(completed);
                dto.setCancelledAppointments(cancelled);

                UUID doctorId = doctor.getId();
                if (doctorId == null) {
                    throw new ResourceNotFoundException("Doctor ID is missing");
                }
                Long totalDocs = (long) documentRepository.findByUploadedByDoctor_Id(doctorId).size();
                dto.setTotalDocuments(totalDocs);

                Long totalReviews = (long) reviewRepository.findByDoctor_IdOrderByReviewDateDesc(doctor.getId()).size();
                Double avgReceived = reviewRepository.findAverageRatingByDoctorId(doctor.getId());

                dto.setTotalReviews(totalReviews);
                dto.setAverageRatingReceived(avgReceived != null ? Math.round(avgReceived * 10.0) / 10.0 : 0.0);

                                dto.setEmergencyRequests(0L);
                                dto.setResolvedEmergencies(0L);
            }
        }

        return dto;
    }

    private DoctorResponseDTO toDoctorResponseDTO(Doctor doctor) {
        return new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }

}
