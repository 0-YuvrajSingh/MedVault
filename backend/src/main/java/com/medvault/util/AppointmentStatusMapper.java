package com.medvault.util;

import com.medvault.model.AppointmentStatus;
import org.springframework.stereotype.Component;

@Component
public class AppointmentStatusMapper {

    public static AppointmentStatus fromString(String status) {
        if (status == null) {
            return null;
        }
        try {
            return AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid appointment status: " + status);
        }
    }

    public static String toString(AppointmentStatus status) {
        return status != null ? status.name() : null;
    }

    public static boolean isValidStatus(String status) {
        if (status == null) {
            return false;
        }
        try {
            AppointmentStatus.valueOf(status.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
