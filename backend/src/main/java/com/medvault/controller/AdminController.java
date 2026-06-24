package com.medvault.controller;

import com.medvault.dto.AssignDoctorRequest;
import com.medvault.dto.UserResponse;
import com.medvault.entity.UserRole;
import com.medvault.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@RequestParam UserRole role) {
        List<UserResponse> users = adminService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/doctors/{id}/activate")
    public ResponseEntity<UserResponse> activateDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleAccountStatus(id, true));
    }

    @PatchMapping("/doctors/{id}/deactivate")
    public ResponseEntity<UserResponse> deactivateDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleAccountStatus(id, false));
    }

    @PostMapping("/assignments")
    public ResponseEntity<Void> assignDoctor(@Valid @RequestBody AssignDoctorRequest request) {
        adminService.assignDoctorToPatient(request);
        return ResponseEntity.ok().build();
    }
}
