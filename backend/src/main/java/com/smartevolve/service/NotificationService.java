package com.smartevolve.service;

import com.smartevolve.dto.NotificationDto;
import com.smartevolve.entity.Notification;
import com.smartevolve.entity.Profile;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.NotificationRepository;
import com.smartevolve.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification does not belong to user");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    @Transactional
    public NotificationDto createNotification(UUID userId, String title, String message, String type, String actionUrl) {
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type != null ? type : "SYSTEM")
                .read(false)
                .actionUrl(actionUrl)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification for user {}: '{}'", userId, title);
        return mapToDto(saved);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(Boolean.TRUE.equals(n.getRead()))
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
