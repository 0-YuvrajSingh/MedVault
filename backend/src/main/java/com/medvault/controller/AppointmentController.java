package com.medvault.controller;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medvault.dto.ApiResponse;
import com.medvault.dto.AppointmentFilterDTO;
import com.medvault.dto.AppointmentRequestDTO;
import com.medvault.dto.AppointmentResponseDTO;
import com.medvault.service.AppointmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/doctor/{doctorId}/pending")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getPendingAppointmentsByDoctorId(@PathVariable UUID doctorId) {
        List<AppointmentResponseDTO> appointments = appointmentService.getPendingAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Pending doctor appointments retrieved", appointments));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @com.medvault.annotation.LogAudit(action = "CREATE_APPOINTMENT", details = "Creating new appointment")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> createAppointment(@Valid @RequestBody AppointmentRequestDTO request) {
        AppointmentResponseDTO response = appointmentService.createAppointment(request);
        return new ResponseEntity<>(ApiResponse.success("Appointment created", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getAllAppointments() {
        List<AppointmentResponseDTO> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", appointments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> getAppointmentById(@PathVariable UUID id) {
        AppointmentResponseDTO appointment = appointmentService.getAppointmentById(Objects.requireNonNull(id, "Appointment ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved", appointment));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getAppointmentsByDoctorId(@PathVariable UUID doctorId) {
        List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByDoctorId(Objects.requireNonNull(doctorId, "Doctor ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved", appointments));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getAppointmentsByPatientId(@PathVariable UUID patientId) {
        List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByPatientId(Objects.requireNonNull(patientId, "Patient ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Patient appointments retrieved", appointments));
    }

    @GetMapping("/doctor/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getMyDoctorAppointments(org.springframework.security.core.Authentication authentication) {
        List<AppointmentResponseDTO> appointments = appointmentService.getMyAppointmentsAsDoctor(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved", appointments));
    }

    @GetMapping("/patient/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getMyPatientAppointments(org.springframework.security.core.Authentication authentication) {
        List<AppointmentResponseDTO> appointments = appointmentService.getMyAppointmentsAsPatient(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Patient appointments retrieved", appointments));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDTO>>> getAppointmentsByStatus(@PathVariable String status) {
        List<AppointmentResponseDTO> appointments = appointmentService.getAppointmentsByStatus(Objects.requireNonNull(status, "Status cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Appointments by status retrieved", appointments));
    }

    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<Page<AppointmentResponseDTO>>> filterAppointments(@RequestBody AppointmentFilterDTO filterDTO) {
        Page<AppointmentResponseDTO> appointments = appointmentService.filterAppointments(filterDTO);
        return ResponseEntity.ok(ApiResponse.success("Filtered appointments retrieved", appointments));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','PATIENT')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> updateAppointmentStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> statusUpdate,
            Authentication authentication) {
        String status = statusUpdate.get("status");
        // Only restrict patients
        boolean isPatient = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"));
        if (isPatient) {
            AppointmentResponseDTO appointment = appointmentService.getAppointmentById(id);
            if (appointment.getAppointmentDate() != null) {
                java.time.ZonedDateTime appointmentTime = appointment.getAppointmentDate().atZone(java.time.ZoneId.systemDefault());
                java.time.ZonedDateTime now = java.time.ZonedDateTime.now(appointmentTime.getZone());
                java.time.Duration duration = java.time.Duration.between(now, appointmentTime);
                if (duration.toHours() < 24) {
                    throw new com.medvault.exception.UnauthorizedException("You cannot change the appointment status within 24 hours of the appointment time.");
                }
            }
        }
        AppointmentResponseDTO updated = appointmentService.updateAppointmentStatus(Objects.requireNonNull(id, "Appointment ID cannot be null"), Objects.requireNonNull(status, "Status cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated", updated));
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> addDoctorNotes(
            @PathVariable UUID id,
            @RequestBody Map<String, String> notesUpdate) {
        String notes = notesUpdate.get("doctorNotes");
        AppointmentResponseDTO updated = appointmentService.addDoctorNotes(Objects.requireNonNull(id, "Appointment ID cannot be null"), Objects.requireNonNull(notes, "Doctor notes cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Doctor notes added", updated));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @com.medvault.annotation.LogAudit(action = "UPDATE_APPOINTMENT", details = "Updating appointment details")
    public ResponseEntity<ApiResponse<AppointmentResponseDTO>> updateAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequestDTO request) {
        AppointmentResponseDTO updated = appointmentService.updateAppointment(Objects.requireNonNull(id, "Appointment ID cannot be null"), request);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @com.medvault.annotation.LogAudit(action = "CANCEL_APPOINTMENT", details = "Cancelling appointment")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable UUID id) {
        appointmentService.deleteAppointment(Objects.requireNonNull(id, "Appointment ID cannot be null"));
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted", null));
    }
}
