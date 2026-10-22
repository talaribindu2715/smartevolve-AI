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
public class RecommendationDto {
    private UUID id;
    private UUID skillId;
    private String skillName;
    private UUID resourceId;
    private String resourceTitle;
    private String difficulty;
    private Integer estimatedMinutes;
    private UUID careerId;
    private String careerName;
    private String recommendationType;
    private String priority;
    private String reason;
    private String status;
    private OffsetDateTime createdAt;
}
