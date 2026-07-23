package com.medvault.controller;

import com.medvault.dto.NotificationResponse;
import com.medvault.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/doctor/notifications")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<NotificationResponse>> getDoctorNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getNotifications(UUID.fromString(principal.getName())));
    }

    @GetMapping("/patient/notifications")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<NotificationResponse>> getPatientNotifications(Principal principal) {
        return ResponseEntity.ok(notificationService.getNotifications(UUID.fromString(principal.getName())));
    }

    @PatchMapping("/notifications/{id}/read")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, Principal principal) {
        notificationService.markAsRead(id, UUID.fromString(principal.getName()));
        return ResponseEntity.ok().build();
    }
}
