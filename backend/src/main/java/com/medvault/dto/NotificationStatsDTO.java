package com.medvault.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationStatsDTO {
    
    private Long totalNotifications;
    private Long unreadNotifications;
    private Long readNotifications;
    private Double readRate;
    
    // By type
    private Long appointmentNotifications;
    private Long documentNotifications;
    private Long emergencyNotifications;
    private Long reviewNotifications;
    private Long generalNotifications;
}
