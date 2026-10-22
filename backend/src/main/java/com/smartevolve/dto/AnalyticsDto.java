package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDto {
    private BigDecimal overallProficiency;
    private BigDecimal totalGain;
    private double growthRatePerAttempt;
    private String trajectory;
    private int totalLessonsCompleted;
    private int totalAssessmentsTaken;
    private int totalCredentialsEarned;
    private Map<String, BigDecimal> categoryProficiencies; // Category -> Avg Proficiency
    private List<ProficiencyTimelinePoint> proficiencyTimeline;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProficiencyTimelinePoint {
        private String date;
        private BigDecimal averageProficiency;
    }
}
