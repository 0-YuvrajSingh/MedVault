package com.medvault.controller;

import com.medvault.dto.ChangePasswordRequest;
import com.medvault.dto.NotificationPreferencesRequest;
import com.medvault.dto.UpdateProfileRequest;
import com.medvault.dto.UserProfileResponse;
import com.medvault.entity.User;
import com.medvault.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(toResponse(userProfileService.getProfile(userId)));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(toResponse(userProfileService.updateProfile(userId, request)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        userProfileService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/notifications")
    public ResponseEntity<UserProfileResponse> updateNotificationPreferences(
            @RequestBody NotificationPreferencesRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(toResponse(userProfileService.updateNotificationPreferences(userId, request)));
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .profilePhoto(user.getProfilePhoto())
                .emailNotifications(user.isEmailNotifications())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
