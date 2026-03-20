package com.medvault.service;

import com.medvault.model.Appointment;
import com.medvault.model.AppointmentStatus;
import com.medvault.model.Doctor;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduledTaskService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledTaskService.class);
    
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final EmailService emailService;

    public ScheduledTaskService(AppointmentRepository appointmentRepository,
                               DoctorRepository doctorRepository,
                               EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.emailService = emailService;
    }

    /**
     * Send daily schedule reminder to all doctors at 7:00 AM every day
     * Cron format: second, minute, hour, day of month, month, day of week
     */
    @Scheduled(cron = "0 0 7 * * *", zone = "UTC")
    public void sendDailyDoctorScheduleReminders() {
        logger.info("Starting daily doctor schedule reminder task...");
        
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();

        // Get all active doctors
        List<Doctor> doctors = doctorRepository.findAll();
        
        for (Doctor doctor : doctors) {
            try {
                // Get today's appointments for this doctor
                List<Appointment> todaysAppointments = appointmentRepository
                    .findByDoctor_IdAndAppointmentDateBetween(
                        doctor.getId(), 
                        startOfDay, 
                        endOfDay
                    )
                    .stream()
                    .filter(apt -> apt.getStatus() == AppointmentStatus.CONFIRMED || 
                                  apt.getStatus() == AppointmentStatus.PENDING)
                    .collect(Collectors.toList());

                if (!todaysAppointments.isEmpty()) {
                    String scheduleDetails = buildScheduleDetails(todaysAppointments);
                    
                    emailService.sendDoctorDailyScheduleReminder(
                        doctor.getUser().getEmail(),
                        doctor.getUser().getName(),
                        scheduleDetails,
                        todaysAppointments.size()
                    );
                    
                    logger.info("Daily schedule reminder sent to Dr. {} ({} appointments)", 
                        doctor.getUser().getName(), todaysAppointments.size());
                }
            } catch (Exception e) {
                logger.error("Failed to send daily schedule reminder to Dr. {}: {}", 
                    doctor.getUser().getName(), e.getMessage());
            }
        }
        
        logger.info("Daily doctor schedule reminder task completed");
    }

    /**
     * Build HTML schedule details from appointments
     */
    private String buildScheduleDetails(List<Appointment> appointments) {
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        
        StringBuilder html = new StringBuilder();
        
        for (Appointment apt : appointments) {
            String time = apt.getAppointmentDate().format(timeFormatter);
            String patientName = apt.getPatient().getUser().getName();
            String reason = apt.getReason() != null && !apt.getReason().isEmpty() 
                ? apt.getReason() : "General consultation";
            String status = apt.getStatus().name();
            String statusColor = apt.getStatus() == AppointmentStatus.CONFIRMED ? "#4CAF50" : "#FF9800";
            
            html.append(String.format("""
                <div style="background: white; padding: 15px; margin: 10px 0; border-left: 4px solid %s; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #667eea; font-size: 16px;">🕐 %s</strong><br>
                            <span style="color: #333; font-size: 14px;">👤 Patient: %s</span><br>
                            <span style="color: #666; font-size: 13px;">📝 %s</span><br>
                            <span style="background: %s; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px; display: inline-block; margin-top: 5px;">%s</span>
                        </div>
                    </div>
                </div>
                """, statusColor, time, patientName, reason, statusColor, status));
        }
        
        if (html.length() == 0) {
            html.append("<p style='color: #666;'>No appointments scheduled for today.</p>");
        }
        
        return html.toString();
    }

    /**
     * Optional: Clean up expired OTPs and reset tokens (run every hour)
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredTokens() {
        // This is handled automatically by the ConcurrentHashMap in EmailService
        // but you can add additional cleanup logic here if needed
        logger.info("Token cleanup task executed");
    }

    /**
     * Optional: Send appointment reminders 24 hours before appointment
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendAppointmentReminders() {
        logger.info("Starting appointment reminder task...");
        
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);
        LocalDateTime startOfDay = tomorrow.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = tomorrow.toLocalDate().plusDays(1).atStartOfDay();

        List<Appointment> tomorrowAppointments = appointmentRepository
            .findByAppointmentDateBetween(startOfDay, endOfDay)
            .stream()
            .filter(apt -> apt.getStatus() == AppointmentStatus.CONFIRMED)
            .collect(Collectors.toList());

        for (Appointment apt : tomorrowAppointments) {
            try {
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
                
                String time = apt.getAppointmentDate().format(timeFormatter);
                
                // Send reminder to patient
                emailService.sendGeneralNotification(
                    apt.getPatient().getUser().getEmail(),
                    apt.getPatient().getUser().getName(),
                    "Appointment Reminder - Tomorrow",
                    String.format("This is a friendly reminder about your appointment with Dr. %s tomorrow at %s. Please arrive 10 minutes early.",
                        apt.getDoctor().getUser().getName(), time)
                );
                
                logger.info("Appointment reminder sent to patient: {}", apt.getPatient().getUser().getName());
            } catch (Exception e) {
                logger.error("Failed to send appointment reminder: {}", e.getMessage());
            }
        }
        
        logger.info("Appointment reminder task completed. {} reminders sent", tomorrowAppointments.size());
    }
}
