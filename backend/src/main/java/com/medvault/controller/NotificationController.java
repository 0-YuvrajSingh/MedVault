package com.medvault.controller;

import com.medvault.dto.NotificationResponse;
import com.medvault.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
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
    public ResponseEntity<Page<NotificationResponse>> getDoctorNotifications(
            Principal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotifications(UUID.fromString(principal.getName()), pageable));
    }

    @GetMapping("/patient/notifications")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Page<NotificationResponse>> getPatientNotifications(
            Principal principal,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotifications(UUID.fromString(principal.getName()), pageable));
    }

    @PatchMapping("/notifications/{id}/read")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, Principal principal) {
        notificationService.markAsRead(id, UUID.fromString(principal.getName()));
        return ResponseEntity.ok().build();
    }
}
