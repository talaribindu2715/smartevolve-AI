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
public class DashboardSummaryDto {
    private String studentName;
    private boolean onboardingCompleted;
    private UUID targetCareerId;
    private String targetCareerName;
    private BigDecimal overallProficiency;
    private BigDecimal careerReadinessScore;
    private String readinessLevel;
    private int totalSkillsAssessed;
    private int completedActivitiesCount;
    private int pendingAssessmentsCount;
    private List<StudentSkillDto> topSkills;
    private List<StudentSkillDto> recentlyImprovedSkills;
    private RoadmapDto activeRoadmap;
    private List<RecommendationDto> recommendations;
    private List<CredentialDto> verifiedCredentials;
    private List<WeeklyActivityStat> weeklyActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyActivityStat {
        private String day; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
        private int minutesSpent;
        private int lessonsCompleted;
        private int assessmentsTaken;
    }
}
