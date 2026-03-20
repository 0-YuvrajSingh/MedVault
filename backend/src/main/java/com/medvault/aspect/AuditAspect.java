package com.medvault.aspect;

import com.medvault.annotation.LogAudit;
import com.medvault.service.AuditService;
import com.medvault.service.UserService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Aspect for handling automated audit logging
 * Intercepts methods annotated with @LogAudit
 */
@Aspect
@Component
public class AuditAspect {

    private final AuditService auditService;
    private final UserService userService;

    public AuditAspect(AuditService auditService, UserService userService) {
        this.auditService = auditService;
        this.userService = userService;
    }

    @AfterReturning(pointcut = "@annotation(com.medvault.annotation.LogAudit)", returning = "result")
    public void logAuditActivity(JoinPoint joinPoint, Object result) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            LogAudit logAudit = method.getAnnotation(LogAudit.class);

            final String action = logAudit.action();
            final String detailsValue = logAudit.details().isEmpty() 
                ? "Executed " + method.getName() 
                : logAudit.details();

            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser")) {
                
                String email = authentication.getName();
                // Assuming UserService has a method to find by email
                // If not, we might need to fetch UserDetails or use a different approach
                // For now, we'll try to find the user
                
                // Note: This depends on UserService implementation. 
                // If UserService is not available or throws exception, we catch it.
                 userService.findByEmail(email).ifPresent(user -> {
                     auditService.logAction(user, action, getEntityType(joinPoint), null, detailsValue);
                 });
            }
        } catch (Exception e) {
            // Silently fail to not disrupt the main flow
            // System.err.println("Audit logging failed: " + e.getMessage());
        }
    }

    private String getEntityType(JoinPoint joinPoint) {
        // Simple heuristic to guess entity type from class name
        String className = joinPoint.getTarget().getClass().getSimpleName();
        if (className.endsWith("Controller")) {
            return className.replace("Controller", "");
        }
        return className;
    }
}
