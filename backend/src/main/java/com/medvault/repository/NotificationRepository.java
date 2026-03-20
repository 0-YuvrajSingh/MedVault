package com.medvault.repository;

import com.medvault.model.Notification;
import com.medvault.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

    Long countByUser_IdAndIsReadFalse(UUID userId);
    
    // Analytics methods
    Long countByUser_Id(UUID userId);
    
    Long countByUser_IdAndIsReadTrue(UUID userId);
    
    Long countByType(NotificationType type);
    
    List<Notification> findByUser_Id(UUID userId);
    
    List<Notification> findByUser_IdAndCreatedAtAfterOrderByCreatedAtDesc(UUID userId, LocalDateTime startDate);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.type = :type")
    Long countByUserIdAndType(@Param("userId") UUID userId, @Param("type") NotificationType type);
}
