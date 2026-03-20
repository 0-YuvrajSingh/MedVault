package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityTrendDTO {
    
    private String period; // e.g., "2025-11-18", "Week 46", "November 2025"
    
    private Long newUsers;
    private Long newDoctors;
    private Long newPatients;
    
    private Long appointmentsCreated;
    private Long appointmentsCompleted;
    private Long appointmentsCancelled;
    
    private Long documentsUploaded;
    private Long documentsVerified;
    
    private Long reviewsSubmitted;
    private Double averageRating;
    
    private Long emergenciesCreated;
    private Long emergenciesResolved;
    
    private Long notificationsSent;
    private Long notificationsRead;
}
