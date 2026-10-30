package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YouTubeVideoDto {
    private UUID id;
    private String videoId;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String channelTitle;
    private String duration;
    private Integer estimatedMinutes;
    private String difficulty;
    private UUID skillId;
    private String skillName;
    private String category;
    private String viewCount;
    private String videoUrl;
    private String embedUrl;

    // Student Watch Progress
    private String watchStatus; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private BigDecimal progressPercentage;
    private Integer watchedSeconds;
    private Integer totalSeconds;
    private OffsetDateTime lastWatchedAt;
    private String recommendationReason;
    private Boolean isSavedForLater;
}
