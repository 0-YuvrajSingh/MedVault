package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private Long totalUsers;
    private Long totalDoctors;
    private Long totalPatients;
    private Long verifiedDoctors;
    private Long unverifiedDoctors;
    private Long totalAppointments;
    private Long pendingAppointments;
    private Long completedAppointments;
    private Long totalMedicalRecords;
    private Long totalDocuments;
    private Long unverifiedDocuments;
    private Long totalReviews;
    private Double averageRating;
    private Long totalEmergencyRequests;
    private Long pendingEmergencies;
    private Long criticalEmergencies;
}
