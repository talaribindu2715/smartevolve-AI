package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapStepDto {
    private UUID id;
    private UUID resourceId;
    private String resourceTitle;
    private String difficulty;
    private Integer estimatedMinutes;
    private UUID skillId;
    private String skillName;
    private Integer sequenceNumber;
    private String priority;
    private String reason;
    private String status; // LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED
    private String phase; // BEGINNER, INTERMEDIATE, ADVANCED
    private String contentType; // ARTICLE, VIDEO, etc.
    private String externalUrl;
    private java.math.BigDecimal progressPercentage;
    private List<UUID> prerequisiteResourceIds;
}
