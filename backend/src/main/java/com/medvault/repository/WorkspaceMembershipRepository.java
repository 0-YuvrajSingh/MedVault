package com.medvault.repository;

import com.medvault.entity.WorkspaceMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceMembershipRepository extends JpaRepository<WorkspaceMembership, UUID> {

    boolean existsByWorkspaceIdAndUserIdAndIsActiveTrue(UUID workspaceId, UUID userId);

    Optional<WorkspaceMembership> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    List<WorkspaceMembership> findByWorkspaceIdAndIsActiveTrue(UUID workspaceId);
}
