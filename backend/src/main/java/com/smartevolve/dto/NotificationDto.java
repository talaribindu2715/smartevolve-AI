package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private UUID id;
    private UUID userId;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String actionUrl;
    private OffsetDateTime createdAt;
}
