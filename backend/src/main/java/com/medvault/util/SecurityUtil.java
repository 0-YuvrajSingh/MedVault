package com.medvault.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


public class SecurityUtil {

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getName();
    }

    public static String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return authentication.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .orElse(null);
    }

    public static boolean isAdmin() {
        String role = getCurrentUserRole();
        return "ADMIN".equals(role);
    }

    public static boolean isDoctor() {
        String role = getCurrentUserRole();
        return "DOCTOR".equals(role);
    }

    public static boolean isPatient() {
        String role = getCurrentUserRole();
        return "PATIENT".equals(role);
    }

    public static boolean hasRole(String roleName) {
        String role = getCurrentUserRole();
        return roleName.equals(role);
    }
}
