package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEngagementDTO {
    
    private String userId;
    private String name;
    private String email;
    private String role;
    
    private Long totalAppointments;
    private Long completedAppointments;
    private Long cancelledAppointments;
    
    private Long totalDocuments;
    private Long verifiedDocuments;
    
    private Long totalReviews;
    private Double averageRatingGiven;
    private Double averageRatingReceived;
    
    private Long emergencyRequests;
    private Long resolvedEmergencies;
    
    private Long notificationsSent;
    private Long notificationsRead;
    private Double notificationReadRate;
    
    private LocalDateTime lastActive;
    private LocalDateTime registeredAt;
}
