package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningResourceDto {
    private UUID id;
    private String title;
    private String description;
    private UUID skillId;
    private String skillName;
    private String difficulty;
    private String contentType;
    private String contentBody;
    private String externalUrl;
    private Integer estimatedMinutes;
    private List<UUID> prerequisiteResourceIds;
    private String progressStatus; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private BigDecimal progressPercentage;
    private boolean isUnlocked;
}
