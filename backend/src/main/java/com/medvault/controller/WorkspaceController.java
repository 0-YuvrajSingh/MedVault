package com.medvault.controller;

import com.medvault.dto.AddWorkspaceMemberRequest;
import com.medvault.dto.CreateWorkspaceRequest;
import com.medvault.dto.WorkspaceMemberResponse;
import com.medvault.dto.WorkspaceResponse;
import com.medvault.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * Admin-only workspace and membership management. Only a global {@code ROLE_ADMIN}
 * can create workspaces or manage membership; there is no self-join and no
 * workspace-owner role in this phase.
 */
@RestController
@RequestMapping("/api/admin/workspaces")
@PreAuthorize("hasRole('ADMIN')")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request, Principal principal) {
        return ResponseEntity.ok(workspaceService.createWorkspace(
                request.getName(), UUID.fromString(principal.getName())));
    }

    @GetMapping
    public ResponseEntity<Page<WorkspaceResponse>> listWorkspaces(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(workspaceService.listWorkspaces(pageable));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId));
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceMemberResponse> addMember(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody AddWorkspaceMemberRequest request, Principal principal) {
        return ResponseEntity.ok(workspaceService.addMember(
                workspaceId, request.getUserId(), UUID.fromString(principal.getName())));
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceMemberResponse>> listMembers(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(workspaceService.listMembers(workspaceId));
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID workspaceId, @PathVariable UUID userId, Principal principal) {
        workspaceService.removeMember(workspaceId, userId, UUID.fromString(principal.getName()));
        return ResponseEntity.noContent().build();
    }
}
