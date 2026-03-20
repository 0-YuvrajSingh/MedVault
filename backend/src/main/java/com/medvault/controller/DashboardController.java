package com.medvault.controller;

import com.medvault.dto.AppointmentSeriesDTO;
import com.medvault.dto.DashboardSummaryDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.model.User;
import com.medvault.service.DashboardService;
import com.medvault.repository.UserRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.util.SecurityUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public DashboardController(DashboardService dashboardService,
                               UserRepository userRepository,
                               DoctorRepository doctorRepository,
                               PatientRepository patientRepository) {
        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> summary() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard summary fetched", dashboardService.getSummary()));
    }

    @GetMapping("/series")
    public ResponseEntity<ApiResponse<AppointmentSeriesDTO>> appointmentSeries(@RequestParam(name = "days", defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success("Appointment series fetched", dashboardService.getAppointmentSeries(days)));
    }

    @GetMapping("/series/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<?>> doctorSeries(@PathVariable("doctorId") UUID doctorId,
                                          @RequestParam(name = "days", defaultValue = "7") int days) {
        if (!authorizedDoctor(doctorId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Doctor series access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success("Doctor appointment series fetched", dashboardService.getAppointmentSeriesByDoctor(doctorId, days)));
    }

    @GetMapping("/series/patient/{patientId}")
    public ResponseEntity<ApiResponse<?>> patientSeries(@PathVariable("patientId") UUID patientId,
                                           @RequestParam(name = "days", defaultValue = "7") int days) {
        if (!authorizedPatient(patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Patient series access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success("Patient appointment series fetched", dashboardService.getAppointmentSeriesByPatient(patientId, days)));
    }

    private boolean authorizedDoctor(UUID doctorId) {
        if (SecurityUtil.isAdmin()) return true;
        if (!SecurityUtil.isDoctor()) return false;
        String email = SecurityUtil.getCurrentUserEmail();
        if (email == null) return false;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        return doctorRepository.findByUserId(user.getId())
                .map(d -> d.getId().equals(doctorId))
                .orElse(false);
    }

    private boolean authorizedPatient(UUID patientId) {
        if (SecurityUtil.isAdmin()) return true;
        if (!SecurityUtil.isPatient()) return false;
        String email = SecurityUtil.getCurrentUserEmail();
        if (email == null) return false;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        return patientRepository.findByUserId(user.getId())
                .map(p -> p.getId().equals(patientId))
                .orElse(false);
    }
}
