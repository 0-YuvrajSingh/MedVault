package com.medvault.controller;

import com.medvault.dto.NotificationRequestDTO;
import com.medvault.dto.NotificationResponseDTO;
import com.medvault.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.medvault.dto.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getMyNotifications(Authentication authentication) {
        String email = authentication.getName();
        List<NotificationResponseDTO> notifications = notificationService.getAllNotifications(email);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> getUnreadNotifications(Authentication authentication) {
        String email = authentication.getName();
        List<NotificationResponseDTO> notifications = notificationService.getUnreadNotifications(email);
        return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved", notifications));
    }

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        String email = authentication.getName();
        Long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> createNotification(@Valid @RequestBody NotificationRequestDTO requestDTO) {
        NotificationResponseDTO created = notificationService.createNotification(requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Notification created", created));
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> markAsRead(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        String email = authentication.getName();
        NotificationResponseDTO updated = notificationService.markAsRead(notificationId, email);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @PutMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationResponseDTO>> markAsReadPut(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        String email = authentication.getName();
        NotificationResponseDTO updated = notificationService.markAsRead(notificationId, email);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @DeleteMapping("/{notificationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @PathVariable UUID notificationId,
            Authentication authentication) {
        String email = authentication.getName();
        notificationService.deleteNotification(notificationId, email);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }

    @GetMapping("/analytics/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getNotificationStats(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Notification stats retrieved", notificationService.getNotificationStats(email)));
    }

    @GetMapping("/analytics/by-type")
    public ResponseEntity<ApiResponse<?>> getNotificationsByType(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Notifications by type retrieved", notificationService.getNotificationsByType(email)));
    }

    @GetMapping("/analytics/recent-activity")
    public ResponseEntity<ApiResponse<?>> getRecentActivity(
            @RequestParam(defaultValue = "7") int days,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success("Recent activity retrieved", notificationService.getRecentActivity(email, days)));
    }
}