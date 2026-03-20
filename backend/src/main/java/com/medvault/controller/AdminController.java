package com.medvault.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medvault.dto.ActivityTrendDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.dto.DashboardStatsDTO;
import com.medvault.dto.DoctorResponseDTO;
import com.medvault.dto.NotificationStatsDTO;
import com.medvault.dto.ReportStatsDTO;
import com.medvault.dto.UserEngagementDTO;
import com.medvault.dto.UserSummaryDTO;
import com.medvault.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @GetMapping("/analytics/report-stats")
    public ResponseEntity<ApiResponse<ReportStatsDTO>> getReportStats() {
        ReportStatsDTO stats = adminService.getReportStats();
        return ResponseEntity.ok(ApiResponse.success("Report stats retrieved", stats));
    }

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboardStats() {
        DashboardStatsDTO stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummaryDTO>>> getAllUsers(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate) {
        List<UserSummaryDTO> users;
        if (startDate != null && endDate != null) {
            java.time.LocalDateTime start = java.time.LocalDate.parse(startDate).atStartOfDay();
            java.time.LocalDateTime end = java.time.LocalDate.parse(endDate).atTime(23, 59, 59);
            users = adminService.getUsersByDateRange(start, end);
        } else {
            users = adminService.getAllUsers();
        }
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @GetMapping("/doctors/unverified")
    public ResponseEntity<ApiResponse<List<DoctorResponseDTO>>> getUnverifiedDoctors() {
        List<DoctorResponseDTO> doctors = adminService.getUnverifiedDoctors();
        return ResponseEntity.ok(ApiResponse.success("Unverified doctors retrieved", doctors));
    }

    @PatchMapping("/doctors/{userId}/verify")
    public ResponseEntity<ApiResponse<DoctorResponseDTO>> verifyDoctor(@PathVariable UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        DoctorResponseDTO verified = adminService.verifyDoctor(userId);
        return ResponseEntity.ok(ApiResponse.success("Doctor verified", verified));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    // Analytics endpoints
    @GetMapping("/analytics/notifications")
    public ResponseEntity<ApiResponse<NotificationStatsDTO>> getNotificationStats() {
        NotificationStatsDTO stats = adminService.getNotificationStats();
        return ResponseEntity.ok(ApiResponse.success("Notification stats retrieved", stats));
    }

    @GetMapping("/analytics/engagement")
    public ResponseEntity<ApiResponse<List<UserEngagementDTO>>> getUserEngagement() {
        List<UserEngagementDTO> engagement = adminService.getUserEngagementMetrics();
        return ResponseEntity.ok(ApiResponse.success("User engagement metrics retrieved", engagement));
    }

    @GetMapping("/analytics/engagement/{userId}")
    public ResponseEntity<ApiResponse<UserEngagementDTO>> getUserEngagementById(@PathVariable UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        UserEngagementDTO engagement = adminService.getUserEngagement(userId);
        return ResponseEntity.ok(ApiResponse.success("User engagement retrieved", engagement));
    }

    @GetMapping("/analytics/activity/today")
    public ResponseEntity<ApiResponse<ActivityTrendDTO>> getTodayActivity() {
        ActivityTrendDTO activity = adminService.getTodayActivity();
        return ResponseEntity.ok(ApiResponse.success("Today's activity retrieved", activity));
    }
}
