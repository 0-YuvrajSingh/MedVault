package com.medvault.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import com.medvault.dto.AppointmentFilterDTO;
import com.medvault.dto.AppointmentRequestDTO;
import com.medvault.dto.AppointmentResponseDTO;
import com.medvault.dto.NotificationRequestDTO;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ConflictException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Appointment;
import com.medvault.model.AppointmentStatus;
import com.medvault.model.Doctor;
import com.medvault.model.NotificationType;
import com.medvault.model.Patient;
import com.medvault.model.Slot;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.SlotRepository;
import com.medvault.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final SlotService slotService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditService auditService;

    public AppointmentService(AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            SlotRepository slotRepository,
            UserRepository userRepository,
            SlotService slotService,
            NotificationService notificationService,
            EmailService emailService,
            AuditService auditService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
        this.slotService = slotService;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO request) {
        // Validate doctor exists
        UUID doctorId = request.getDoctorId();
        if (doctorId == null) {
            throw new BadRequestException("Doctor ID is required");
        }
        Doctor doctor = doctorRepository.findById(Objects.requireNonNull(request.getDoctorId(), "Doctor ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        // Validate patient exists
        if (request.getPatientId() == null) {
            throw new BadRequestException("Patient ID is required");
        }
        Patient patient = patientRepository.findById(Objects.requireNonNull(request.getPatientId(), "Patient ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        // Validate slot exists and is available
        if (request.getSlotId() == null) {
            throw new BadRequestException("Slot ID is required");
        }
        Slot slot = slotRepository.findById(Objects.requireNonNull(request.getSlotId(), "Slot ID cannot be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + request.getSlotId()));

        // Verify slot belongs to the doctor
        if (!slot.getDoctor().getId().equals(request.getDoctorId())) {
            throw new BadRequestException("Slot does not belong to the specified doctor");
        }

        // Check if slot is available
        if (!slotService.isSlotAvailable(request.getSlotId())) {
            throw new ConflictException("Slot is not available");
        }

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot.getStartTime()); // Use slot's start time
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setReason(request.getReason());
        appointment.setPatientNotes(request.getPatientNotes());
        appointment.setConsultationFee(request.getConsultationFee());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Audit log
        auditService.logActionWithUserId(
                patient.getUser().getId(),
                patient.getUser().getName(),
                patient.getUser().getRole(),
                "CREATE",
                "Appointment",
                savedAppointment.getId(),
                "Created appointment with Dr. " + doctor.getUser().getName()
        );

        // Increment slot appointment count
        slotService.incrementAppointmentCount(request.getSlotId());

        // Notify doctor about new appointment
        notificationService.createNotification(new NotificationRequestDTO(
                doctor.getUser().getId(),
                "New Appointment Booked",
                "Patient " + patient.getUser().getName() + " booked appointment on " + slot.getStartTime(),
                NotificationType.APPOINTMENT
        ));

        // Notify patient about booking confirmation
        notificationService.createNotification(new NotificationRequestDTO(
                patient.getUser().getId(),
                "Appointment Booked",
                "Your appointment with Dr. " + doctor.getUser().getName() + " is scheduled for " + slot.getStartTime(),
                NotificationType.APPOINTMENT
        ));

        // Send email notifications
        emailService.sendAppointmentConfirmation(
                patient.getUser().getEmail(),
                patient.getUser().getName(),
                doctor.getUser().getName(),
                slot.getStartTime().toLocalDate().toString(),
                slot.getStartTime().toLocalTime().toString(),
                request.getReason() != null ? request.getReason() : "Regular checkup"
        );

        emailService.sendAppointmentNotificationToDoctor(
                doctor.getUser().getEmail(),
                doctor.getUser().getName(),
                patient.getUser().getName(),
                slot.getStartTime().toLocalDate().toString(),
                slot.getStartTime().toLocalTime().toString(),
                request.getReason() != null ? request.getReason() : "Regular checkup"
        );

        return toResponseDTO(savedAppointment);
    }

    public AppointmentResponseDTO getAppointmentById(@org.springframework.lang.NonNull UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return toResponseDTO(appointment);
    }

    public List<AppointmentResponseDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<AppointmentResponseDTO> getAppointmentsByDoctorId(@org.springframework.lang.NonNull UUID doctorId) {
        return appointmentRepository.findByDoctor_Id(doctorId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<AppointmentResponseDTO> getAppointmentsByPatientId(@org.springframework.lang.NonNull UUID patientId) {

        return appointmentRepository.findByPatient_Id(patientId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<AppointmentResponseDTO> getMyAppointmentsAsDoctor(String email) {
        com.medvault.model.User userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Doctor doctor = doctorRepository.findByUserId(userEntity.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return getAppointmentsByDoctorId(doctor.getId());
    }

    public List<AppointmentResponseDTO> getMyAppointmentsAsPatient(String email) {
        com.medvault.model.User userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Patient patient = patientRepository.findByUserId(userEntity.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return getAppointmentsByPatientId(patient.getId());
    }

    public List<AppointmentResponseDTO> getAppointmentsByStatus(@org.springframework.lang.NonNull String status) {
        AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
        return appointmentRepository.findByStatus(appointmentStatus).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public AppointmentResponseDTO updateAppointmentStatus(@org.springframework.lang.NonNull UUID id, @org.springframework.lang.NonNull String status) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        AppointmentStatus oldStatus = appointment.getStatus();
        AppointmentStatus newStatus = AppointmentStatus.valueOf(status.toUpperCase());
        appointment.setStatus(newStatus);

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        // Audit log
        auditService.logActionWithUserId(
                appointment.getDoctor().getUser().getId(),
                appointment.getDoctor().getUser().getName(),
                appointment.getDoctor().getUser().getRole(),
                "UPDATE_STATUS",
                "Appointment",
                updatedAppointment.getId(),
                "Changed status from " + oldStatus + " to " + newStatus
        );

        // Notify based on status change
        switch (newStatus) {
            case PENDING -> {
                // No specific action needed for PENDING status
            }
            case CONFIRMED -> {
                String title = "Appointment Confirmed";
                String message = "Your appointment with Dr. " + appointment.getDoctor().getUser().getName() + " has been confirmed for " + appointment.getAppointmentDate();
                notificationService.createNotification(new NotificationRequestDTO(
                        appointment.getPatient().getUser().getId(),
                        title,
                        message,
                        NotificationType.APPOINTMENT
                ));
                emailService.sendAppointmentConfirmation(
                        appointment.getPatient().getUser().getEmail(),
                        appointment.getPatient().getUser().getName(),
                        appointment.getDoctor().getUser().getName(),
                        appointment.getAppointmentDate().toLocalDate().toString(),
                        appointment.getAppointmentDate().toLocalTime().toString(),
                        appointment.getReason() != null ? appointment.getReason() : ""
                );
            }
            case CANCELLED -> {
                String title = "Appointment Cancelled";
                String message = "Your appointment with Dr. " + appointment.getDoctor().getUser().getName() + " scheduled for " + appointment.getAppointmentDate() + " has been cancelled.";
                notificationService.createNotification(new NotificationRequestDTO(
                        appointment.getPatient().getUser().getId(),
                        title,
                        message,
                        NotificationType.APPOINTMENT
                ));
                // Notify doctor
                notificationService.createNotification(new NotificationRequestDTO(
                        appointment.getDoctor().getUser().getId(),
                        "Appointment Cancelled",
                        "Appointment with patient " + appointment.getPatient().getUser().getName() + " has been cancelled.",
                        NotificationType.APPOINTMENT
                ));
                // Send cancellation emails
                emailService.sendAppointmentCancellation(
                        appointment.getPatient().getUser().getEmail(),
                        appointment.getPatient().getUser().getName(),
                        appointment.getDoctor().getUser().getName(),
                        appointment.getAppointmentDate().toLocalDate().toString(),
                        appointment.getAppointmentDate().toLocalTime().toString()
                );
                emailService.sendAppointmentCancellation(
                        appointment.getDoctor().getUser().getEmail(),
                        appointment.getDoctor().getUser().getName(),
                        appointment.getPatient().getUser().getName(),
                        appointment.getAppointmentDate().toLocalDate().toString(),
                        appointment.getAppointmentDate().toLocalTime().toString()
                );
            }
            case COMPLETED -> {
                String title = "Appointment Completed";
                String message = "Your appointment with Dr. " + appointment.getDoctor().getUser().getName() + " has been completed.";
                notificationService.createNotification(new NotificationRequestDTO(
                        appointment.getPatient().getUser().getId(),
                        title,
                        message,
                        NotificationType.APPOINTMENT
                ));
            }
            case NO_SHOW -> {
                String title = "Appointment No-Show";
                String message = "You missed your appointment with Dr. " + appointment.getDoctor().getUser().getName() + " scheduled for " + appointment.getAppointmentDate() + ".";
                notificationService.createNotification(new NotificationRequestDTO(
                        appointment.getPatient().getUser().getId(),
                        title,
                        message,
                        NotificationType.APPOINTMENT
                ));
                // Notify doctor about patient no-show
                notificationService.createNotification(new NotificationRequestDTO(
                        appointment.getDoctor().getUser().getId(),
                        "Patient No-Show",
                        "Patient " + appointment.getPatient().getUser().getName() + " did not show up for the appointment.",
                        NotificationType.APPOINTMENT
                ));
            }
        }

        return toResponseDTO(updatedAppointment);
    }

    public AppointmentResponseDTO addDoctorNotes(@org.springframework.lang.NonNull UUID id, String notes) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        appointment.setDoctorNotes(notes);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return toResponseDTO(updatedAppointment);
    }

    public AppointmentResponseDTO updateAppointment(@org.springframework.lang.NonNull UUID id, AppointmentRequestDTO request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        // If updating slot, handle slot changes
        if (request.getSlotId() != null && !appointment.getSlot().getId().equals(request.getSlotId())) {
            // Decrement old slot count
            slotService.decrementAppointmentCount(appointment.getSlot().getId());
            // Validate new slot
            Slot newSlot = slotRepository.findById(Objects.requireNonNull(request.getSlotId(), "Slot ID cannot be null"))
                    .orElseThrow(() -> new ResourceNotFoundException("Slot not found with ID: " + request.getSlotId()));
            if (!slotService.isSlotAvailable(request.getSlotId())) {
                throw new ConflictException("New slot is not available");
            }
            appointment.setSlot(newSlot);
            appointment.setAppointmentDate(newSlot.getStartTime());
            // Increment new slot count
            slotService.incrementAppointmentCount(request.getSlotId());
        }

        appointment.setReason(request.getReason());
        appointment.setPatientNotes(request.getPatientNotes());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return toResponseDTO(updatedAppointment);
    }

    public void deleteAppointment(@org.springframework.lang.NonNull UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        // Decrement slot count before deleting
        slotService.decrementAppointmentCount(appointment.getSlot().getId());
        appointmentRepository.deleteById(id);
    }

    public Page<AppointmentResponseDTO> filterAppointments(AppointmentFilterDTO filterDTO) {
        // Build pageable with sorting
        // Build pageable with sorting
        String sortDirection = filterDTO.getSortDirection();
        String sortBy = filterDTO.getSortBy();

        if (sortDirection == null || sortBy == null) {
            throw new BadRequestException("Sort direction and sort by are required");
        }
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(filterDTO.getPage(), filterDTO.getSize(), sort);

        Page<Appointment> appointmentPage;

        // Apply filters based on what's provided
        boolean hasDoctor = filterDTO.getDoctorId() != null;
        boolean hasPatient = filterDTO.getPatientId() != null;
        boolean hasStatus = filterDTO.getStatus() != null;
        boolean hasDateRange = filterDTO.getStartDate() != null && filterDTO.getEndDate() != null;

        if (hasDoctor && hasStatus && hasDateRange) {
            // Doctor + Status + Date Range
            appointmentPage = appointmentRepository.findByDoctorStatusAndDateRange(
                    filterDTO.getDoctorId(),
                    filterDTO.getStatus(),
                    filterDTO.getStartDate(),
                    filterDTO.getEndDate(),
                    pageable
            );
        } else if (hasPatient && hasStatus && hasDateRange) {
            // Patient + Status + Date Range
            appointmentPage = appointmentRepository.findByPatientStatusAndDateRange(
                    filterDTO.getPatientId(),
                    filterDTO.getStatus(),
                    filterDTO.getStartDate(),
                    filterDTO.getEndDate(),
                    pageable
            );
        } else if (hasDoctor && hasStatus) {
            // Doctor + Status
            appointmentPage = appointmentRepository.findByDoctor_IdAndStatus(
                    filterDTO.getDoctorId(),
                    filterDTO.getStatus(),
                    pageable
            );
        } else if (hasPatient && hasStatus) {
            // Patient + Status
            appointmentPage = appointmentRepository.findByPatient_IdAndStatus(
                    filterDTO.getPatientId(),
                    filterDTO.getStatus(),
                    pageable
            );
        } else if (hasDoctor && hasDateRange) {
            // Doctor + Date Range
            appointmentPage = appointmentRepository.findByDoctor_IdAndAppointmentDateBetween(
                    filterDTO.getDoctorId(),
                    filterDTO.getStartDate(),
                    filterDTO.getEndDate(),
                    pageable
            );
        } else if (hasPatient && hasDateRange) {
            // Patient + Date Range
            appointmentPage = appointmentRepository.findByPatient_IdAndAppointmentDateBetween(
                    filterDTO.getPatientId(),
                    filterDTO.getStartDate(),
                    filterDTO.getEndDate(),
                    pageable
            );
        } else if (hasDoctor) {
            // Just Doctor
            appointmentPage = appointmentRepository.findByDoctor_Id(
                    filterDTO.getDoctorId(),
                    pageable
            );
        } else if (hasPatient) {
            // Just Patient
            appointmentPage = appointmentRepository.findByPatient_Id(
                    filterDTO.getPatientId(),
                    pageable
            );
        } else if (hasStatus) {
            // Just Status
            appointmentPage = appointmentRepository.findByStatus(
                    filterDTO.getStatus(),
                    pageable
            );
        } else if (hasDateRange) {
            // Just Date Range
            appointmentPage = appointmentRepository.findByAppointmentDateBetween(
                    filterDTO.getStartDate(),
                    filterDTO.getEndDate(),
                    pageable
            );
        } else {
            // No filters - return all
            appointmentPage = appointmentRepository.findAll(pageable);
        }

        // Convert to DTOs
        return appointmentPage.map(this::toResponseDTO);
    }

    // Helper method for DTO conversion (NO MAPPER)
    private AppointmentResponseDTO toResponseDTO(Appointment appointment) {
        return new AppointmentResponseDTO(
                appointment.getId(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getUser().getName(),
                appointment.getDoctor().getSpecialization(),
                appointment.getPatient().getId(),
                appointment.getPatient().getUser().getName(),
                appointment.getSlot().getId(),
                appointment.getSlot().getStartTime(),
                appointment.getSlot().getEndTime(),
                appointment.getAppointmentDate(),
                appointment.getStatus().name(),
                appointment.getReason(),
                appointment.getDoctorNotes(),
                appointment.getPatientNotes(),
                appointment.getConsultationFee(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }

    public List<AppointmentResponseDTO> getPendingAppointmentsByDoctorId(UUID doctorId) {
        return appointmentRepository.findByDoctor_IdAndStatus(doctorId, AppointmentStatus.PENDING)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }
}
