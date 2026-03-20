package com.medvault.controller;

import com.medvault.dto.AuditLogSearchDTO;
import com.medvault.model.AuditLog;
import com.medvault.dto.ApiResponse;
import com.medvault.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditService.getAllAuditLogs(page, size);
        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched", logs));
    }

    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> searchAuditLogs(@RequestBody AuditLogSearchDTO searchDTO) {
        Page<AuditLog> logs = auditService.searchAuditLogs(
                searchDTO.getUserId(),
                searchDTO.getAction(),
                searchDTO.getEntityType(),
                searchDTO.getStartDate(),
                searchDTO.getEndDate(),
                searchDTO.getPage(),
                searchDTO.getSize()
        );
        return ResponseEntity.ok(ApiResponse.success("Audit logs search results", logs));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getUserAuditLogs(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditService.getUserAuditLogs(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("User audit logs fetched", logs));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getEntityAuditLogs(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {
        List<AuditLog> logs = auditService.getEntityAuditLogs(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success("Entity audit logs fetched", logs));
    }

    @GetMapping("/action/{action}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditService.getAuditLogsByAction(action, page, size);
        return ResponseEntity.ok(ApiResponse.success("Audit logs by action fetched", logs));
    }

    @GetMapping("/type/{entityType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogsByEntityType(
            @PathVariable String entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditService.getAuditLogsByEntityType(entityType, page, size);
        return ResponseEntity.ok(ApiResponse.success("Audit logs by entity type fetched", logs));
    }
}
