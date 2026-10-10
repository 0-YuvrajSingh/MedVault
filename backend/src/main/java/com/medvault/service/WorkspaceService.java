package com.medvault.service;

import com.medvault.dto.WorkspaceMemberResponse;
import com.medvault.dto.WorkspaceResponse;
import com.medvault.entity.User;
import com.medvault.entity.Workspace;
import com.medvault.entity.WorkspaceMembership;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.UserRepository;
import com.medvault.repository.WorkspaceMembershipRepository;
import com.medvault.repository.WorkspaceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Admin-only workspace and membership management.
 *
 * <p>Rules: only a global {@code ROLE_ADMIN} reaches this service (controller-level
 * {@code @PreAuthorize}); no self-join, no invitations, no workspace-owner role.
 * Membership never grants privileges beyond the member's global role.
 */
@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMembershipRepository membershipRepository,
                            UserRepository userRepository,
                            AuditService auditService) {
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public WorkspaceResponse createWorkspace(String name, UUID adminId) {
        Workspace workspace = Workspace.builder()
                .name(name.trim())
                .createdBy(adminId)
                .build();
        workspaceRepository.save(workspace);

        auditService.logPlatformEvent(adminId, "WORKSPACE_CREATED", "Workspace",
                workspace.getId(), "Workspace created: " + workspace.getName());

        return mapToResponse(workspace);
    }

    @Transactional(readOnly = true)
    public Page<WorkspaceResponse> listWorkspaces(Pageable pageable) {
        return workspaceRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(UUID workspaceId) {
        return mapToResponse(getWorkspaceOrThrow(workspaceId));
    }

    @Transactional
    public WorkspaceMemberResponse addMember(UUID workspaceId, UUID userId, UUID adminId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<WorkspaceMembership> existingOpt =
                membershipRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
        WorkspaceMembership membership;
        if (existingOpt.isPresent()) {
            membership = existingOpt.get();
            membership.setActive(true);
        } else {
            membership = WorkspaceMembership.builder()
                    .workspace(workspace)
                    .user(user)
                    .isActive(true)
                    .build();
        }
        membershipRepository.save(membership);

        auditService.logPlatformEvent(adminId, "WORKSPACE_MEMBER_ADDED", "Workspace",
                workspaceId, "User " + user.getEmail() + " added to workspace " + workspace.getName());

        return mapToMemberResponse(membership);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> listMembers(UUID workspaceId) {
        getWorkspaceOrThrow(workspaceId);
        return membershipRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId).stream()
                .map(this::mapToMemberResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID userId, UUID adminId) {
        Workspace workspace = getWorkspaceOrThrow(workspaceId);
        WorkspaceMembership membership = membershipRepository
                .findByWorkspaceIdAndUserId(workspaceId, userId)
                .filter(WorkspaceMembership::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

        membership.setActive(false);
        membershipRepository.save(membership);

        auditService.logPlatformEvent(adminId, "WORKSPACE_MEMBER_REMOVED", "Workspace",
                workspaceId, "User " + membership.getUser().getEmail()
                        + " removed from workspace " + workspace.getName());
    }

    private Workspace getWorkspaceOrThrow(UUID workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
    }

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return new WorkspaceResponse(
                workspace.getId(), workspace.getName(),
                workspace.getCreatedBy(), workspace.getCreatedAt());
    }

    private WorkspaceMemberResponse mapToMemberResponse(WorkspaceMembership membership) {
        User user = membership.getUser();
        return new WorkspaceMemberResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getRole(),
                membership.isActive());
    }
}
