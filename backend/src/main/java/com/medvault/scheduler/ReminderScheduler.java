package com.medvault.scheduler;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.medvault.dto.NotificationRequestDTO;
import com.medvault.model.Appointment;
import com.medvault.model.AppointmentStatus;
import com.medvault.model.Notification;
import com.medvault.model.NotificationType;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.NotificationRepository;
import com.medvault.service.EmailService;
import com.medvault.service.NotificationService;

@Component
public class ReminderScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReminderScheduler.class);

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public ReminderScheduler(AppointmentRepository appointmentRepository,
            NotificationService notificationService,
            EmailService emailService,
            NotificationRepository notificationRepository) {
        this.appointmentRepository = appointmentRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Send appointment reminders 24 hours before appointment time Runs every
     * hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at :00
    public void sendAppointmentReminders() {
        logger.info("🔔 Running appointment reminder scheduler...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindowStart = now.plusHours(23);
        LocalDateTime reminderWindowEnd = now.plusHours(25);

        // Find appointments in the next 23-25 hours with PENDING or CONFIRMED status
        List<Appointment> upcomingAppointments = appointmentRepository
                .findByAppointmentDateBetween(reminderWindowStart, reminderWindowEnd);

        int remindersSent = 0;
        for (Appointment appointment : upcomingAppointments) {
            // Only remind for pending or confirmed appointments
            if (appointment.getStatus() != AppointmentStatus.PENDING
                    && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
                continue;
            }

            // Check if reminder already sent (avoid duplicate reminders)
            long existingReminders = notificationRepository
                    .findByUser_IdOrderByCreatedAtDesc(appointment.getPatient().getUser().getId())
                    .stream()
                    .filter(n -> n.getTitle().contains("Appointment Reminder")
                    && n.getMessage().contains(appointment.getDoctor().getUser().getName())
                    && ChronoUnit.HOURS.between(n.getCreatedAt(), now) < 24)
                    .count();

            if (existingReminders > 0) {
                continue; // Already sent reminder
            }

            // Calculate hours until appointment
            long hoursUntil = ChronoUnit.HOURS.between(now, appointment.getAppointmentDate());

            // Send notification to patient
            String message = String.format(
                    "Your appointment with Dr. %s is scheduled in %d hours on %s at %s.",
                    appointment.getDoctor().getUser().getName(),
                    hoursUntil,
                    appointment.getAppointmentDate().toLocalDate(),
                    appointment.getAppointmentDate().toLocalTime()
            );

            notificationService.createNotification(new NotificationRequestDTO(
                    appointment.getPatient().getUser().getId(),
                    "⏰ Appointment Reminder",
                    message,
                    NotificationType.APPOINTMENT
            ));

            // Send email reminder
            emailService.sendGeneralNotification(
                    appointment.getPatient().getUser().getEmail(),
                    appointment.getPatient().getUser().getName(),
                    "Upcoming Appointment Reminder",
                    message + "\n\nPlease arrive 10 minutes early. If you need to cancel or reschedule, please contact us as soon as possible."
            );

            remindersSent++;
        }

        if (remindersSent > 0) {
            logger.info("✅ Sent {} appointment reminders", remindersSent);
        }
    }

    /**
     * Send health checkup reminders for patients with no recent appointments
     * Runs monthly on the 1st at 10 AM
     */
    @Scheduled(cron = "0 0 10 1 * *") // 1st of every month at 10 AM
    public void sendHealthCheckupReminders() {
        logger.info("🏥 Running health checkup reminder scheduler...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeMonthsAgo = now.minusMonths(3);

        // Find all appointments to identify patients who haven't visited in 3+ months
        List<Appointment> allAppointments = appointmentRepository.findAll();

        // Group by patient and check last visit
        allAppointments.stream()
                .collect(java.util.stream.Collectors.groupingBy(Appointment::getPatient))
                .forEach((patient, appointments) -> {
                    // Get most recent appointment
                    LocalDateTime lastVisit = appointments.stream()
                            .map(Appointment::getAppointmentDate)
                            .max(LocalDateTime::compareTo)
                            .orElse(null);

                    // If no visit in 3 months, send reminder
                    if (lastVisit == null || lastVisit.isBefore(threeMonthsAgo)) {
                        String message = "It's been a while since your last checkup. Regular health checkups are important for maintaining good health. Schedule an appointment today!";

                        notificationService.createNotification(new NotificationRequestDTO(
                                patient.getUser().getId(),
                                "🏥 Health Checkup Reminder",
                                message,
                                NotificationType.GENERAL
                        ));

                        emailService.sendGeneralNotification(
                                patient.getUser().getEmail(),
                                patient.getUser().getName(),
                                "Time for Your Health Checkup",
                                message + "\n\nStaying on top of your health with regular checkups can help detect issues early. Book your appointment through the MedVault portal."
                        );
                    }
                });

        logger.info("✅ Completed health checkup reminders");
    }

    /**
     * Automatically mark past appointments as COMPLETED Runs every day at
     * midnight
     */
    @Scheduled(cron = "0 0 0 * * *") // Every day at midnight
    public void autoCompleteAppointments() {
        logger.info("📋 Running auto-complete appointment scheduler...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);

        // Find confirmed appointments that are in the past
        List<Appointment> pastAppointments = appointmentRepository
                .findByStatusAndAppointmentDateBefore(AppointmentStatus.CONFIRMED, yesterday);

        int completedCount = 0;
        for (Appointment appointment : pastAppointments) {
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(appointment);

            // Notify patient
            notificationService.createNotification(new NotificationRequestDTO(
                    appointment.getPatient().getUser().getId(),
                    "Appointment Completed",
                    "Your appointment with Dr. " + appointment.getDoctor().getUser().getName() + " has been marked as completed.",
                    NotificationType.APPOINTMENT
            ));

            completedCount++;
        }

        if (completedCount > 0) {
            logger.info("✅ Auto-completed {} past appointments", completedCount);
        }
    }

    /**
     * Clean up old read notifications (older than 30 days) Runs weekly on
     * Sunday at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * SUN") // Every Sunday at 2 AM
    public void cleanupOldNotifications() {
        logger.info("🧹 Running notification cleanup scheduler...");

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // Find old read notifications
        List<Notification> oldNotifications = notificationRepository.findAll().stream()
                .filter(n -> n.getIsRead() && n.getCreatedAt().isBefore(thirtyDaysAgo))
                .toList();

        if (!oldNotifications.isEmpty()) {
            notificationRepository.deleteAll(oldNotifications);
            logger.info("✅ Deleted {} old notifications", oldNotifications.size());
        }
    }

    /**
     * Send daily summary to admins Runs every day at 8 AM
     */
    @Scheduled(cron = "0 0 8 * * *") // Every day at 8 AM
    public void sendDailySummaryToAdmins() {
        logger.info("📊 Running daily summary scheduler...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);

        // Count appointments for today
        long todayAppointments = appointmentRepository
                .findByAppointmentDateBetween(now, now.plusDays(1))
                .size();

        // Count yesterday's completed appointments
        long yesterdayCompleted = appointmentRepository
                .findByStatusAndAppointmentDateBetween(
                        AppointmentStatus.COMPLETED,
                        yesterday,
                        now
                ).size();

        String summary = String.format(
                """
                Daily Summary:
                - Today's Appointments: %d
                - Yesterday's Completed: %d
                - System Status: Running Smoothly
                """,
                todayAppointments,
                yesterdayCompleted
        );

        logger.info("📊 {}", summary);
        // Note: Could send this to admin users via notification/email
    }
}
