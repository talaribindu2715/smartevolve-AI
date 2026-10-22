package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapDto {
    private UUID id;
    private UUID careerId;
    private String careerName;
    private Integer version;
    private String status;
    private int totalSteps;
    private int completedSteps;
    private BigDecimal progressPercentage;
    private OffsetDateTime generatedAt;
    private List<RoadmapStepDto> steps;
}
