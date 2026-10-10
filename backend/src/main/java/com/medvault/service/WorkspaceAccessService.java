package com.medvault.service;

import com.medvault.entity.Workspace;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.WorkspaceMembershipRepository;
import com.medvault.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Workspace membership gate (D1, access-control only).
 *
 * <p>Denial contract: a caller who is not an active member of a workspace-scoped
 * resource's workspace receives {@link ResourceNotFoundException} (→ HTTP 404) so
 * workspace/resource existence is not disclosed. Missing IDs also map to 404.
 * Existing assignment/ownership failures keep their 403 mapping and are checked
 * separately by the owning service — this gate never replaces them.
 */
@Service
public class WorkspaceAccessService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;

    public WorkspaceAccessService(WorkspaceRepository workspaceRepository,
                                  WorkspaceMembershipRepository membershipRepository) {
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
    }

    @Transactional(readOnly = true)
    public boolean isActiveMember(UUID workspaceId, UUID userId) {
        if (workspaceId == null || userId == null) {
            return false;
        }
        return membershipRepository.existsByWorkspaceIdAndUserIdAndIsActiveTrue(workspaceId, userId);
    }

    /**
     * Loads a workspace for a member; 404 when the workspace is missing or the
     * caller is not an active member.
     */
    @Transactional(readOnly = true)
    public Workspace requireMemberWorkspace(UUID workspaceId, UUID userId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
        requireMemberOf(workspace, userId);
        return workspace;
    }

    /**
     * No-op for unscoped (null-workspace, V1) resources. Otherwise 404 unless the
     * caller is an active member.
     */
    @Transactional(readOnly = true)
    public void requireMemberOf(Workspace workspace, UUID userId) {
        if (workspace == null) {
            return;
        }
        if (!isActiveMember(workspace.getId(), userId)) {
            throw new ResourceNotFoundException("Workspace not found");
        }
    }
}
