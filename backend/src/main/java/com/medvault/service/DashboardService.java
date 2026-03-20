
package com.medvault.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Service;

import com.medvault.dto.AppointmentSeriesDTO;
import com.medvault.dto.DashboardSummaryDTO;
import com.medvault.model.AppointmentStatus;
import com.medvault.repository.AppointmentRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.DocumentRepository;
import com.medvault.repository.FeedbackRepository;
import com.medvault.repository.FileMetadataRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.ReviewRepository;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final DocumentRepository documentRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final FeedbackRepository feedbackRepository;

    // Simple in-memory cache for summary (refresh every 30s)
    private final AtomicReference<DashboardSummaryDTO> cachedSummary = new AtomicReference<>();
    private volatile long summaryCacheTimestamp = 0L;
    private static final long SUMMARY_CACHE_TTL_MS = 30_000;

    public DashboardService(PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository,
                            ReviewRepository reviewRepository,
                            DocumentRepository documentRepository,
                            FileMetadataRepository fileMetadataRepository,
                            FeedbackRepository feedbackRepository) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.reviewRepository = reviewRepository;
        this.documentRepository = documentRepository;
        this.fileMetadataRepository = fileMetadataRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public DashboardSummaryDTO getSummary() {
        long nowMs = System.currentTimeMillis();
        DashboardSummaryDTO cached = cachedSummary.get();
        if (cached != null && (nowMs - summaryCacheTimestamp) < SUMMARY_CACHE_TTL_MS) {
            return cached;
        }
        long patients = patientRepository.count();
        long doctors = doctorRepository.count();
        long appointments = appointmentRepository.count();
        long reviews = reviewRepository.count();
        long documents = documentRepository.count();
        long files = fileMetadataRepository.count();
        long feedback = feedbackRepository.count();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in7 = now.plusDays(7);
        long upcoming = appointmentRepository.findByAppointmentDateBetween(now, in7).size();
        long pendingAppointments = appointmentRepository.findByStatus(AppointmentStatus.PENDING).size();
        DashboardSummaryDTO dto = new DashboardSummaryDTO(patients, doctors, appointments, reviews, documents, files, feedback, upcoming, pendingAppointments);
        cachedSummary.set(dto);
        summaryCacheTimestamp = nowMs;
        return dto;
    }

    public AppointmentSeriesDTO getAppointmentSeries(int days) {
        if (days < 1) days = 7;
        if (days > 30) days = 30;
        LocalDate today = LocalDate.now();
        Map<String, Long> series = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime start = d.atStartOfDay();
            LocalDateTime end = d.plusDays(1).atStartOfDay().minusNanos(1);
            long count = appointmentRepository.findByAppointmentDateBetween(start, end).size();
            series.put(d.toString(), count);
        }
        return new AppointmentSeriesDTO(days, null, null, series);
    }

    public AppointmentSeriesDTO getAppointmentSeriesByDoctor(UUID doctorId, int days) {
        if (days < 1) days = 7;
        if (days > 30) days = 30;
        LocalDate today = LocalDate.now();
        Map<String, Long> series = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime start = d.atStartOfDay();
            LocalDateTime end = d.plusDays(1).atStartOfDay().minusNanos(1);
            long count = appointmentRepository.findByDoctor_IdAndAppointmentDateBetween(doctorId, start, end).size();
            series.put(d.toString(), count);
        }
        return new AppointmentSeriesDTO(days, doctorId, null, series);
    }

    public AppointmentSeriesDTO getAppointmentSeriesByPatient(UUID patientId, int days) {
        if (days < 1) days = 7;
        if (days > 30) days = 30;
        LocalDate today = LocalDate.now();
        Map<String, Long> series = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime start = d.atStartOfDay();
            LocalDateTime end = d.plusDays(1).atStartOfDay().minusNanos(1);
            long count = appointmentRepository.findByPatient_IdAndAppointmentDateBetween(patientId, start, end).size();
            series.put(d.toString(), count);
        }
        return new AppointmentSeriesDTO(days, null, patientId, series);
    }
}
