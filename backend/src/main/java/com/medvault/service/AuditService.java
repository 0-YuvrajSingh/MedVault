package com.medvault.service;

import com.medvault.model.AuditLog;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Log an audit event asynchronously
     */
    @Async
    public void logAction(User user, String action, String entityType, UUID entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(user.getId());
        log.setUserName(user.getName());
        log.setUserRole(user.getRole());
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        
        // Get IP address and user agent from request context
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                log.setIpAddress(getClientIpAddress(request));
                log.setUserAgent(request.getHeader("User-Agent"));
            }
        } catch (Exception e) {
            // Silently fail if request context is not available
        }
        
        auditLogRepository.save(log);
    }

    /**
     * Log an action with user ID only (when full User object is not available)
     */
    @Async
    public void logActionWithUserId(UUID userId, String userName, Role userRole, 
                                    String action, String entityType, UUID entityId, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setUserName(userName);
        log.setUserRole(userRole);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                log.setIpAddress(getClientIpAddress(request));
                log.setUserAgent(request.getHeader("User-Agent"));
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AuditService.class).error("Failed to enrich audit log with request info", e);
        }
        auditLogRepository.save(log);
    }

    /**
     * Get audit logs for a specific user
     */
    public Page<AuditLog> getUserAuditLogs(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findByUserId(userId, pageable);
    }

    /**
     * Get audit logs for a specific entity
     */
    public List<AuditLog> getEntityAuditLogs(String entityType, UUID entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * Search audit logs with filters
     */
    public Page<AuditLog> searchAuditLogs(UUID userId, String action, String entityType, 
                                         LocalDateTime startDate, LocalDateTime endDate, 
                                         int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.searchAuditLogs(userId, action, entityType, startDate, endDate, pageable);
    }

    /**
     * Get all audit logs with pagination
     */
    public Page<AuditLog> getAllAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findAll(pageable);
    }

    /**
     * Get audit logs by action
     */
    public Page<AuditLog> getAuditLogsByAction(String action, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findByAction(action, pageable);
    }

    /**
     * Get audit logs by entity type
     */
    public Page<AuditLog> getAuditLogsByEntityType(String entityType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findByEntityType(entityType, pageable);
    }

    /**
     * Get audit logs by date range
     */
    public Page<AuditLog> getAuditLogsByDateRange(LocalDateTime start, LocalDateTime end, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return auditLogRepository.findByTimestampBetween(start, end, pageable);
    }

    /**
     * Extract client IP address from request (handles proxy scenarios)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For can contain multiple IPs, return the first one
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }
}
