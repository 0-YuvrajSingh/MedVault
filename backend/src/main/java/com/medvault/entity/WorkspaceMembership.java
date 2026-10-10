package com.medvault.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Membership of a user in a workspace. Membership is the workspace-level access
 * prerequisite; it never grants privileges beyond the member's global role and
 * never bypasses assignment/clinical ownership checks. Removal deactivates the
 * row (history preserved) instead of deleting it.
 */
@Entity
@Table(name = "workspace_memberships",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_membership_workspace_user",
                columnNames = {"workspace_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkspaceMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
