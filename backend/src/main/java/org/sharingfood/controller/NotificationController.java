package org.sharingfood.controller;

import org.sharingfood.dto.NotificationDto;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> getNotifications(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal user) {
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, user.getId()));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@AuthenticationPrincipal UserPrincipal user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
