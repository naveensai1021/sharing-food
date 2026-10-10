package org.sharingfood.service;

import org.sharingfood.dto.NotificationDto;
import org.sharingfood.entity.InAppNotification;
import org.sharingfood.entity.User;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.InAppNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final InAppNotificationRepository notificationRepository;

    public NotificationService(InAppNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public InAppNotification createNotification(User user, String title, String message, String type, String targetUrl) {
        InAppNotification notification = new InAppNotification(user, title, message, type, targetUrl);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(User user) {
        return getUserNotifications(user.getId());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(User user) {
        return getUnreadCount(user.getId());
    }

    @Transactional
    public NotificationDto markAsRead(UUID notificationId, UUID userId) {
        InAppNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot update another user's notification");
        }

        notification.setRead(true);
        InAppNotification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Transactional
    public NotificationDto markAsRead(UUID notificationId, User user) {
        return markAsRead(notificationId, user.getId());
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<InAppNotification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (InAppNotification notification : unread) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markAllAsRead(User user) {
        markAllAsRead(user.getId());
    }

    private NotificationDto mapToDto(InAppNotification n) {
        return new NotificationDto(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getTargetUrl(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
