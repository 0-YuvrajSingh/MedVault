package com.medvault.controller;

import com.medvault.dto.*;
import com.medvault.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ─── User listings ──────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<UserResponse>> getDoctors() {
        return ResponseEntity.ok(adminService.getDoctors());
    }

    @GetMapping("/patients")
    public ResponseEntity<List<UserResponse>> getPatients() {
        return ResponseEntity.ok(adminService.getPatients());
    }

    // ─── Doctor workflow ────────────────────────────────────────────────────

    @PostMapping("/doctors/{id}/approve")
    public ResponseEntity<UserResponse> approveDoctor(@PathVariable UUID id, Principal principal) {
        return ResponseEntity.ok(adminService.approveDoctor(id, UUID.fromString(principal.getName())));
    }

    @PostMapping("/doctors/{id}/reject")
    public ResponseEntity<UserResponse> rejectDoctor(@PathVariable UUID id, Principal principal) {
        return ResponseEntity.ok(adminService.rejectDoctor(id, UUID.fromString(principal.getName())));
    }

    @PostMapping("/doctors/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateDoctor(@PathVariable UUID id, Principal principal) {
        return ResponseEntity.ok(adminService.deactivateDoctor(id, UUID.fromString(principal.getName())));
    }

    // ─── Assignments ────────────────────────────────────────────────────────

    @PostMapping("/assignments")
    public ResponseEntity<AssignmentResponse> assignDoctor(
            @Valid @RequestBody AssignDoctorRequest request, Principal principal) {
        return ResponseEntity.ok(adminService.assignDoctorToPatient(request, UUID.fromString(principal.getName())));
    }

    @PutMapping("/assignments/{assignmentId}")
    public ResponseEntity<AssignmentResponse> reassignPatient(
            @PathVariable UUID assignmentId,
            @Valid @RequestBody ReassignPatientRequest request,
            Principal principal) {
        return ResponseEntity.ok(
                adminService.reassignPatient(assignmentId, request.getNewDoctorId(), UUID.fromString(principal.getName()))
        );
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<Void> unassignPatient(@PathVariable UUID assignmentId, Principal principal) {
        adminService.unassignPatient(assignmentId, UUID.fromString(principal.getName()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentResponse>> getActiveAssignments() {
        return ResponseEntity.ok(adminService.getAllActiveAssignments());
    }

    // ─── Audit ──────────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<PlatformAuditLogResponse>> getPlatformAuditLogs(
            @PageableDefault(size = 20, sort = "performedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getPlatformAuditLogs(pageable));
    }

    @GetMapping("/records/{recordId}/audit")
    public ResponseEntity<List<AuditLogResponse>> getRecordAuditLog(@PathVariable UUID recordId) {
        return ResponseEntity.ok(adminService.getRecordAuditLog(recordId));
    }

    // ─── Patient records (admin visibility) ─────────────────────────────────

    @GetMapping("/patients/{patientId}/records")
    public ResponseEntity<Page<MedicalRecordResponse>> getPatientRecords(
            @PathVariable UUID patientId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getPatientRecords(patientId, pageable));
    }
}
