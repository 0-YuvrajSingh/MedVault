package com.medvault.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.medvault.dto.ActivityTrendDTO;
import com.medvault.dto.NotificationRequestDTO;
import com.medvault.dto.NotificationResponseDTO;
import com.medvault.dto.NotificationStatsDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.exception.UnauthorizedException;
import com.medvault.model.Notification;
import com.medvault.model.NotificationType;
import com.medvault.model.User;
import com.medvault.repository.NotificationRepository;
import com.medvault.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, 
                              UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public NotificationResponseDTO createNotification(NotificationRequestDTO requestDTO) {
        User user = userRepository.findById(Objects.requireNonNull(requestDTO.getUserId(), "User ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + requestDTO.getUserId()));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(requestDTO.getTitle());
        notification.setMessage(requestDTO.getMessage());
        notification.setType(requestDTO.getType());
        notification.setIsRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        NotificationResponseDTO responseDTO = toResponseDTO(savedNotification);

        return responseDTO;
    }

    public List<NotificationResponseDTO> getAllNotifications(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Notification> notifications = notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
        return notifications.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<NotificationResponseDTO> getUnreadNotifications(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Notification> notifications = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        return notifications.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public Long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return notificationRepository.countByUser_IdAndIsReadFalse(user.getId());
    }

    public NotificationResponseDTO markAsRead(UUID notificationId, String email) {
        Notification notification = notificationRepository.findById(Objects.requireNonNull(notificationId, "Notification ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Verify the notification belongs to this user
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Cannot access another user's notification");
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);

        return toResponseDTO(updatedNotification);
    }

    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Notification> unreadNotifications = notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(UUID notificationId, String email) {
        Notification notification = notificationRepository.findById(Objects.requireNonNull(notificationId, "Notification ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + notificationId));

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Verify the notification belongs to this user
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Cannot delete another user's notification");
        }

        notificationRepository.delete(notification);
    }

    // Analytics Methods
    public NotificationStatsDTO getNotificationStats(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Long total = notificationRepository.countByUser_Id(user.getId());
        Long unread = notificationRepository.countByUser_IdAndIsReadFalse(user.getId());
        Long read = total - unread;

        NotificationStatsDTO stats = new NotificationStatsDTO();
        stats.setTotalNotifications(total);
        stats.setUnreadNotifications(unread);
        stats.setReadNotifications(read);
        stats.setReadRate(total > 0 ? (read * 100.0 / total) : 0.0);
        
        // Count by type
        List<Notification> allNotifications = notificationRepository.findByUser_Id(user.getId());
        long appointmentCount = allNotifications.stream().filter(n -> n.getType() == NotificationType.APPOINTMENT).count();
        long documentCount = allNotifications.stream().filter(n -> n.getType() == NotificationType.DOCUMENT).count();
        long reviewCount = allNotifications.stream().filter(n -> n.getType() == NotificationType.REVIEW).count();
        long generalCount = allNotifications.stream().filter(n -> n.getType() == NotificationType.GENERAL).count();
        
        stats.setAppointmentNotifications(appointmentCount);
        stats.setDocumentNotifications(documentCount);
        stats.setEmergencyNotifications(0L);
        stats.setReviewNotifications(reviewCount);
        stats.setGeneralNotifications(generalCount);
        
        return stats;
    }

    public Map<String, Long> getNotificationsByType(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Notification> notifications = notificationRepository.findByUser_Id(user.getId());
        
        Map<String, Long> typeCount = new HashMap<>();
        for (NotificationType type : NotificationType.values()) {
            typeCount.put(type.name(), 0L);
        }
        
        notifications.forEach(n -> {
            String typeName = n.getType().name();
            typeCount.put(typeName, typeCount.get(typeName) + 1);
        });
        
        return typeCount;
    }

    public List<ActivityTrendDTO> getRecentActivity(String email, int days) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Notification> recentNotifications = notificationRepository
                .findByUser_IdAndCreatedAtAfterOrderByCreatedAtDesc(user.getId(), startDate);

        // Group by date
        Map<String, Long> dailyCount = recentNotifications.stream()
                .collect(Collectors.groupingBy(
                        n -> n.getCreatedAt().toLocalDate().toString(),
                        Collectors.counting()
                ));

        return dailyCount.entrySet().stream()
                .map(entry -> {
                    ActivityTrendDTO dto = new ActivityTrendDTO();
                    dto.setPeriod(entry.getKey());
                    dto.setNotificationsSent(entry.getValue());
                    dto.setNotificationsRead(recentNotifications.stream()
                            .filter(n -> n.getCreatedAt().toLocalDate().toString().equals(entry.getKey()) && n.getIsRead())
                            .count());
                    return dto;
                })
                .sorted((a, b) -> a.getPeriod().compareTo(b.getPeriod()))
                .collect(Collectors.toList());
    }

    private NotificationResponseDTO toResponseDTO(Notification notification) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser().getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
