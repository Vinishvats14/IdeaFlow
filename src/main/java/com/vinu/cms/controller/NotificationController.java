package com.vinu.cms.controller;

import com.vinu.cms.common.ApiResponse;
import com.vinu.cms.entity.Notification;
import com.vinu.cms.repository.NotificationRepository;
import com.vinu.cms.repository.UserRepository;
import com.vinu.cms.entity.User;
import com.vinu.cms.exception.ResourceNotFoundException;
import com.vinu.cms.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ApiResponse<List<Notification>> getNotifications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseUtil.success("Notifications fetched successfully",
                notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied");
        }
        notification.setReadFlag(true);
        notificationRepository.save(notification);
        return ResponseUtil.success("Notification marked as read");
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Notification notification : notifications) {
            notification.setReadFlag(true);
        }
        notificationRepository.saveAll(notifications);
        return ResponseUtil.success("All notifications marked as read");
    }
}
