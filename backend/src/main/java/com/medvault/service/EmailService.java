package com.medvault.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.medvault.config.EnvironmentValidator;
import com.medvault.model.EmailVerificationOtp;
import com.medvault.model.PasswordResetToken;
import com.medvault.repository.EmailVerificationOtpRepository;
import com.medvault.repository.PasswordResetTokenRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String fromName;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailVerificationOtpRepository otpRepository;
    private final SecureRandom random = new SecureRandom();

    public EmailService(JavaMailSender mailSender, 
                       EnvironmentValidator envValidator,
                       PasswordResetTokenRepository resetTokenRepository,
                       EmailVerificationOtpRepository otpRepository) {
        this.mailSender = mailSender;
        this.fromEmail = envValidator.requireProperty("medvault.mail.from");
        this.fromName = envValidator.getPropertyOrDefault("medvault.mail.fromName", "MedVault Platform");
        this.resetTokenRepository = resetTokenRepository;
        this.otpRepository = otpRepository;
        logger.info("EmailService initialized with from: {}", fromEmail);
    }


    /**
     * Send HTML email asynchronously
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            if (fromEmail != null && fromName != null) {
                helper.setFrom(fromEmail, fromName);
            }
            if (to != null) {
                helper.setTo(to);
            }
            if (subject != null) {
                helper.setSubject(subject);
            }
            if (htmlContent != null) {
                helper.setText(htmlContent, true);
            }
            mailSender.send(message);
            logger.info("✅ Email sent to: {} | Subject: {}", to, subject);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            logger.error("❌ Failed to send email to: {} | Error: {}", to, e.getMessage(), e);
        }
    }

    // ========== NEW EMAIL FEATURES ==========

    /**
     * 1. Send welcome email after registration (patient/doctor/admin)
     */
    @Async
    public void sendWelcomeEmail(String to, String name, String role) {
        String subject = "Welcome to MedVault - Your Account is Ready!";
        String htmlContent = buildWelcomeEmailTemplate(name, role);
        sendHtmlEmail(to, subject, htmlContent);
        logger.info("Welcome email sent to: {} as {}", to, role);
    }

    /**
     * 2. Generate and send password reset email with one-time token
     */
    @Async
    public String sendPasswordResetEmail(String to, String name) {
        // Generate secure token
        String resetToken = generateSecureToken();
        
        // Store token in database with expiration (15 minutes)
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);
        PasswordResetToken tokenEntity = new PasswordResetToken(resetToken, to, expiresAt);
        resetTokenRepository.save(tokenEntity);
        
        String subject = "Reset Your MedVault Password";
        String htmlContent = buildPasswordResetEmailTemplate(name, resetToken);
        sendHtmlEmail(to, subject, htmlContent);
        logger.info("Password reset email sent to: {}", to);
        
        return resetToken;
    }

    /**
     * Validate password reset token
     */
    public boolean validateResetToken(String token, String email) {
        return resetTokenRepository.findByToken(token)
            .map(tokenEntity -> {
                if (!tokenEntity.getEmail().equals(email)) {
                    logger.warn("Token email mismatch for: {}", email);
                    return false;
                }
                if (tokenEntity.isUsed()) {
                    logger.warn("Token already used: {}", token);
                    return false;
                }
                if (tokenEntity.isExpired()) {
                    logger.warn("Token expired for: {}", email);
                    resetTokenRepository.delete(tokenEntity);
                    return false;
                }
                logger.info("Token validated successfully for: {}", email);
                return true;
            })
            .orElseGet(() -> {
                logger.warn("Invalid reset token attempted: {}", token);
                return false;
            });
    }

    /**
     * Invalidate password reset token after use
     */
    public void invalidateResetToken(String token) {
        resetTokenRepository.findByToken(token).ifPresent(tokenEntity -> {
            tokenEntity.setUsed(true);
            resetTokenRepository.save(tokenEntity);
            logger.info("Reset token invalidated: {}", token);
        });
    }

    /**
     * 3. Send email verification OTP
     */
    @Async
    public String sendEmailVerificationOtp(String to, String name) {
        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));
        
        // Store OTP in database with expiration (10 minutes)
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        EmailVerificationOtp otpEntity = new EmailVerificationOtp(to, otp, expiresAt);
        otpRepository.save(otpEntity);
        
        String subject = "Verify Your MedVault Email";
        String htmlContent = buildEmailVerificationTemplate(name, otp);
        sendHtmlEmail(to, subject, htmlContent);
        logger.info("Email verification OTP sent to: {}", to);
        
        return otp;
    }

    /**
     * Validate email verification OTP
     */
    public boolean validateEmailOtp(String email, String otp) {
        return otpRepository.findByEmailAndUsedFalse(email)
            .map(otpEntity -> {
                if (!otpEntity.getOtp().equals(otp)) {
                    logger.warn("Invalid OTP for email: {}", email);
                    return false;
                }
                if (otpEntity.isExpired()) {
                    logger.warn("Expired OTP for: {}", email);
                    otpRepository.delete(otpEntity);
                    return false;
                }
                // Mark as used
                otpEntity.setUsed(true);
                otpRepository.save(otpEntity);
                logger.info("Email verified successfully: {}", email);
                return true;
            })
            .orElseGet(() -> {
                logger.warn("No OTP found for email: {}", email);
                return false;
            });
    }

    /**
     * Resend OTP
     */
    @Async
    public void resendEmailVerificationOtp(String to, String name) {
        // Invalidate old OTPs
        otpRepository.findByEmailAndUsedFalse(to).ifPresent(oldOtp -> {
            oldOtp.setUsed(true);
            otpRepository.save(oldOtp);
        });
        
        // Send new OTP
        sendEmailVerificationOtp(to, name);
    }

    /**
     * 5. Send doctor daily schedule reminder
     */
    @Async
    public void sendDoctorDailyScheduleReminder(String to, String doctorName, String scheduleDetails, int appointmentCount) {
        String subject = "Your Daily Schedule - " + java.time.LocalDate.now();
        String htmlContent = buildDoctorScheduleReminderTemplate(doctorName, scheduleDetails, appointmentCount);
        sendHtmlEmail(to, subject, htmlContent);
        logger.info("Daily schedule reminder sent to Dr. {}", doctorName);
    }

    // ========== EXISTING EMAIL FEATURES (PRESERVED) ==========

    /**
     * 4. Send appointment confirmation email
     */
    @Async
    public void sendAppointmentConfirmation(String to, String patientName, String doctorName, 
                                           String date, String time, String reason) {
        String subject = "Appointment Confirmation - MedVault";
        String htmlContent = buildAppointmentEmailTemplate(patientName, doctorName, date, time, reason, "confirmed");
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send appointment notification to doctor
     */
    @Async
    public void sendAppointmentNotificationToDoctor(String to, String doctorName, String patientName, 
                                                    String date, String time, String reason) {
        String subject = "New Appointment Booking - MedVault";
        String htmlContent = buildDoctorAppointmentEmailTemplate(doctorName, patientName, date, time, reason);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send appointment cancellation email
     */
    @Async
    public void sendAppointmentCancellation(String to, String patientName, String doctorName, 
                                           String date, String time) {
        String subject = "Appointment Cancelled - MedVault";
        String htmlContent = buildAppointmentEmailTemplate(patientName, doctorName, date, time, "", "cancelled");
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send appointment rescheduled email (parity stub)
     */
    @Async
    public void sendAppointmentRescheduled(String to, String patientName, String doctorName,
                                           String oldDate, String oldTime,
                                           String newDate, String newTime, String reason) {
        String subject = "Appointment Rescheduled - MedVault";
        String detail = "Rescheduled from " + oldDate + " " + oldTime + " to " + newDate + " " + newTime + (reason != null && !reason.isBlank() ? (". Reason: " + reason) : "");
        String htmlContent = buildGeneralEmailTemplate(patientName,
                "Appointment Rescheduled",
                "<p>Dear " + patientName + ",</p><p>Your appointment with Dr. " + doctorName + " has been rescheduled.</p><p>" + detail + "</p>");
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Notify doctor of appointment reschedule (parity stub)
     */
    @Async
    public void notifyDoctorAppointmentRescheduled(String to, String doctorName, String patientName,
                                                   String oldDate, String oldTime,
                                                   String newDate, String newTime, String reason) {
        String subject = "Patient Appointment Rescheduled";
        String detail = "Rescheduled from " + oldDate + " " + oldTime + " to " + newDate + " " + newTime + (reason != null && !reason.isBlank() ? (". Reason: " + reason) : "");
        String htmlContent = buildGeneralEmailTemplate(doctorName,
                "Appointment Rescheduled",
                "<p>Patient: <strong>" + patientName + "</strong></p><p>" + detail + "</p>");
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send document verification email
     */
    @Async
    public void sendDocumentVerification(String to, String patientName, String documentName, 
                                        String verifiedBy, boolean isVerified) {
        String subject = isVerified ? "Document Verified - MedVault" : "Document Rejected - MedVault";
        String htmlContent = buildDocumentEmailTemplate(patientName, documentName, verifiedBy, isVerified);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send emergency request notification
     */
    @Async
    public void sendEmergencyNotification(String to, String recipientName, String patientName, 
                                         String reason, String severity, boolean isDoctor) {
        String subject = "⚠️ Emergency Request - MedVault";
        String htmlContent = buildEmergencyEmailTemplate(recipientName, patientName, reason, severity, isDoctor);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send general notification email
     */
    @Async
    public void sendGeneralNotification(String to, String recipientName, String title, String message) {
        String subject = title + " - MedVault";
        String htmlContent = buildGeneralEmailTemplate(recipientName, title, message);
        sendHtmlEmail(to, subject, htmlContent);
    }

    // ========== HELPER METHODS ==========

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        random.nextBytes(tokenBytes);
        StringBuilder token = new StringBuilder();
        for (byte b : tokenBytes) {
            token.append(String.format("%02x", b));
        }
        return token.toString();
    }


    // ========== HTML EMAIL TEMPLATES ==========

    /**
     * Welcome email template
     */
    private String buildWelcomeEmailTemplate(String name, String role) {
        String roleMessage = switch (role.toUpperCase()) {
            case "PATIENT" -> "You can now book appointments, manage your medical records, and communicate with healthcare professionals.";
            case "DOCTOR" -> "You can now manage your schedule, view patient appointments, and access medical records.";
            case "ADMIN" -> "You have full administrative access to manage users, verify documents, and oversee the platform.";
            default -> "Welcome to the MedVault platform!";
        };

        String roleIcon = switch (role.toUpperCase()) {
            case "PATIENT" -> "👤";
            case "DOCTOR" -> "👨‍⚕️";
            case "ADMIN" -> "🔐";
            default -> "🏥";
        };

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 32px; }
                    .content { padding: 40px 30px; line-height: 1.8; }
                    .welcome-badge { display: inline-block; padding: 10px 20px; background: #667eea; color: white; border-radius: 25px; font-size: 18px; margin: 20px 0; }
                    .feature-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
                    .feature-title { font-weight: bold; color: #667eea; margin-bottom: 10px; font-size: 16px; }
                    .cta-button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 Welcome to MedVault</h1>
                        <p style="font-size: 18px; margin-top: 10px;">Your Healthcare, Simplified</p>
                    </div>
                    <div class="content">
                        <div class="welcome-badge">%s %s Account Created</div>
                        
                        <p>Dear <strong>%s</strong>,</p>
                        
                        <p>We're thrilled to have you join the MedVault community! Your account has been successfully created and is ready to use.</p>
                        
                        <div class="feature-box">
                            <div class="feature-title">🎉 What's Next?</div>
                            <p>%s</p>
                        </div>
                        
                        <div class="feature-box">
                            <div class="feature-title">🔐 Security First</div>
                            <p>Your data is protected with industry-standard encryption. We take your privacy seriously and comply with all healthcare data protection regulations.</p>
                        </div>
                        
                        <div class="feature-box">
                            <div class="feature-title">💡 Quick Tips</div>
                            <p>• Complete your profile for a personalized experience<br>
                               • Enable notifications to stay updated<br>
                               • Explore the dashboard to familiarize yourself with features</p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:5174/login" class="cta-button">Get Started Now →</a>
                        </div>
                        
                        <p style="margin-top: 30px; color: #666;">If you have any questions or need assistance, our support team is here to help 24/7.</p>
                    </div>
                    <div class="footer">
                        <p><strong>MedVault Healthcare Platform</strong></p>
                        <p>© 2025 MedVault. All rights reserved.</p>
                        <p style="font-size: 12px; margin-top: 10px;">This email was sent to you because you registered on MedVault.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(roleIcon, role, name, roleMessage);
    }

    /**
     * Password reset email template
     */
    private String buildPasswordResetEmailTemplate(String name, String resetToken) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #f44336 0%%, #e91e63 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; line-height: 1.8; }
                    .token-box { background: #fff3cd; border: 2px dashed #ff9800; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px; }
                    .token { font-size: 24px; font-weight: bold; color: #d32f2f; letter-spacing: 2px; font-family: 'Courier New', monospace; }
                    .warning-box { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
                    .cta-button { display: inline-block; padding: 15px 40px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                        <p>MedVault Security</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        
                        <p>We received a request to reset your password. Use the token below to complete the password reset process.</p>
                        
                        <div class="token-box">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Reset Token:</p>
                            <div class="token">%s</div>
                            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">This token is valid for 15 minutes</p>
                        </div>
                        
                        <div class="warning-box">
                            <strong>⚠️ Security Notice:</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>This token can only be used once</li>
                                <li>Never share this token with anyone</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:5174/reset-password?token=%s" class="cta-button">Reset Password Now →</a>
                        </div>
                        
                        <p style="margin-top: 30px; color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:<br>
                        <span style="color: #667eea; word-break: break-all;">http://localhost:5174/reset-password?token=%s</span></p>
                    </div>
                    <div class="footer">
                        <p><strong>MedVault Healthcare Platform</strong></p>
                        <p>© 2025 MedVault. All rights reserved.</p>
                        <p style="font-size: 12px; margin-top: 10px;">If you didn't request a password reset, please contact support immediately.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, resetToken, resetToken, resetToken);
    }

    /**
     * Email verification OTP template
     */
    private String buildEmailVerificationTemplate(String name, String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #4CAF50 0%%, #45a049 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; line-height: 1.8; text-align: center; }
                    .otp-box { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding: 30px; margin: 30px 0; border-radius: 10px; }
                    .otp { font-size: 48px; font-weight: bold; color: white; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
                    .info-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; text-align: left; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Verify Your Email</h1>
                        <p>MedVault Email Verification</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        
                        <p>To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>
                        
                        <div class="otp-box">
                            <div class="otp">%s</div>
                            <p style="color: white; margin: 15px 0 0 0; font-size: 14px;">Valid for 10 minutes</p>
                        </div>
                        
                        <div class="info-box">
                            <strong>📌 Important:</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>This OTP is case-sensitive</li>
                                <li>Do not share this OTP with anyone</li>
                                <li>This OTP will expire in 10 minutes</li>
                                <li>If you didn't request this, please ignore this email</li>
                            </ul>
                        </div>
                        
                        <p style="margin-top: 30px; color: #666;">Enter this OTP on the verification page to activate your account.</p>
                    </div>
                    <div class="footer">
                        <p><strong>MedVault Healthcare Platform</strong></p>
                        <p>© 2025 MedVault. All rights reserved.</p>
                        <p style="font-size: 12px; margin-top: 10px;">This is an automated security email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(name, otp);
    }

    /**
     * Doctor daily schedule reminder template
     */
    private String buildDoctorScheduleReminderTemplate(String doctorName, String scheduleDetails, int appointmentCount) {
        String greeting = java.time.LocalTime.now().getHour() < 12 ? "Good Morning" : 
                         java.time.LocalTime.now().getHour() < 17 ? "Good Afternoon" : "Good Evening";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #FF9800 0%%, #F57C00 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 40px 30px; line-height: 1.8; }
                    .summary-box { background: #fff3cd; border-left: 4px solid #FF9800; padding: 20px; margin: 20px 0; }
                    .count-badge { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 25px; font-size: 24px; font-weight: bold; margin: 15px 0; }
                    .schedule-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Daily Schedule Reminder</h1>
                        <p>%s</p>
                    </div>
                    <div class="content">
                        <p><strong>%s, Dr. %s!</strong></p>
                        
                        <div class="summary-box">
                            <strong>📊 Today's Overview:</strong>
                            <p style="margin: 10px 0 0 0;">You have <span class="count-badge">%d</span> appointment(s) scheduled for today.</p>
                        </div>
                        
                        <div class="schedule-box">
                            <strong>🕐 Your Schedule:</strong>
                            <div style="margin-top: 15px;">
                                %s
                            </div>
                        </div>
                        
                        <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
                            <strong>💡 Reminder:</strong>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Review patient notes before appointments</li>
                                <li>Check for any emergency requests</li>
                                <li>Keep your schedule updated</li>
                            </ul>
                        </div>
                        
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5174/doctor/appointments" style="display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Dashboard →</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p><strong>MedVault Healthcare Platform</strong></p>
                        <p>© 2025 MedVault. All rights reserved.</p>
                        <p style="font-size: 12px; margin-top: 10px;">This is an automated daily reminder.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(java.time.LocalDate.now(), greeting, doctorName, appointmentCount, scheduleDetails);
    }

    // ========== HTML Email Templates ==========

    private String buildAppointmentEmailTemplate(String patientName, String doctorName, 
                                                 String date, String time, String reason, String status) {
        String statusColor = status.equals("confirmed") ? "#4CAF50" : "#F44336";
        String statusText = status.equals("confirmed") ? "Confirmed" : "Cancelled";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; }
                    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
                    .detail-row { margin: 15px 0; padding: 12px; background: #f9f9f9; border-left: 4px solid #667eea; }
                    .detail-label { font-weight: bold; color: #555; margin-bottom: 5px; }
                    .detail-value { color: #333; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 MedVault</h1>
                        <p>Appointment %s</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        <p>Your appointment has been <strong>%s</strong>.</p>
                        
                        <div class="status-badge" style="background-color: %s;">%s</div>
                        
                        <div class="detail-row">
                            <div class="detail-label">👨‍⚕️ Doctor</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">📅 Date</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">🕒 Time</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        %s
                        
                        <p style="margin-top: 30px;">If you have any questions, please contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 MedVault. All rights reserved.</p>
                        <p>This is an automated email, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                statusText,
                patientName,
                status,
                statusColor,
                statusText,
                doctorName,
                date,
                time,
                reason.isEmpty() ? "" : 
                    "<div class=\"detail-row\"><div class=\"detail-label\">📝 Reason</div><div class=\"detail-value\">" + reason + "</div></div>"
            );
    }

    private String buildDoctorAppointmentEmailTemplate(String doctorName, String patientName, 
                                                       String date, String time, String reason) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; }
                    .detail-row { margin: 15px 0; padding: 12px; background: #f9f9f9; border-left: 4px solid #667eea; }
                    .detail-label { font-weight: bold; color: #555; margin-bottom: 5px; }
                    .detail-value { color: #333; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 MedVault</h1>
                        <p>New Appointment Booking</p>
                    </div>
                    <div class="content">
                        <p>Dear Dr. %s,</p>
                        <p>A new appointment has been booked with you.</p>
                        
                        <div class="detail-row">
                            <div class="detail-label">👤 Patient</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">📅 Date</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">🕒 Time</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">📝 Reason</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <p style="margin-top: 30px;">Please log in to your dashboard to view and manage this appointment.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 MedVault. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(doctorName, patientName, date, time, reason);
    }

    private String buildDocumentEmailTemplate(String patientName, String documentName, 
                                              String verifiedBy, boolean isVerified) {
        String statusColor = isVerified ? "#4CAF50" : "#F44336";
        String statusText = isVerified ? "✅ Verified" : "❌ Rejected";
        String message = isVerified ? 
            "Your document has been verified and is now available in your medical records." :
            "Your document verification was not successful. Please upload a valid document or contact support.";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; }
                    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
                    .detail-row { margin: 15px 0; padding: 12px; background: #f9f9f9; border-left: 4px solid #667eea; }
                    .detail-label { font-weight: bold; color: #555; margin-bottom: 5px; }
                    .detail-value { color: #333; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 MedVault</h1>
                        <p>Document Verification Update</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="status-badge" style="background-color: %s;">%s</div>
                        
                        <p>%s</p>
                        
                        <div class="detail-row">
                            <div class="detail-label">📄 Document</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">👨‍⚕️ Verified By</div>
                            <div class="detail-value">%s</div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2025 MedVault. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(patientName, statusColor, statusText, message, documentName, verifiedBy);
    }

    private String buildEmergencyEmailTemplate(String recipientName, String patientName, 
                                               String reason, String severity, boolean isDoctor) {
        String recipientMessage = isDoctor ?
            "An emergency request has been assigned to you." :
            "Your emergency request has been submitted successfully. A doctor will be assigned shortly.";
        
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #f44336 0%, #e91e63 100%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; }
                    .alert-box { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; }
                    .detail-row { margin: 15px 0; padding: 12px; background: #f9f9f9; border-left: 4px solid #f44336; }
                    .detail-label { font-weight: bold; color: #555; margin-bottom: 5px; }
                    .detail-value { color: #333; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Emergency Alert</h1>
                        <p>MedVault Emergency Services</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="alert-box">
                            <strong>⚠️ URGENT:</strong> %s
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">👤 Patient</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">🚨 Severity</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">📝 Reason</div>
                            <div class="detail-value">%s</div>
                        </div>
                        
                        <p style="margin-top: 30px; color: #d32f2f; font-weight: bold;">
                            Please respond as soon as possible.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2025 MedVault. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(recipientName, recipientMessage, patientName, severity, reason);
    }

    private String buildGeneralEmailTemplate(String recipientName, String title, String message) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px; line-height: 1.6; }
                    .message-box { background: #f9f9f9; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
                    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 MedVault</h1>
                        <p>%s</p>
                    </div>
                    <div class="content">
                        <p>Dear %s,</p>
                        
                        <div class="message-box">
                            %s
                        </div>
                        
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 MedVault. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(title, recipientName, message);
    }
}
