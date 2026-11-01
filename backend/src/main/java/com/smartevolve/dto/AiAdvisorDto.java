package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiAdvisorDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillAnalysisResponse {
        private String studentHeadline;
        private String targetCareer;
        private List<String> topStrengths;
        private List<String> criticalGrowthAreas;
        private String cognitiveAnalysis;
        private String personalizedStudyStrategy;
        private boolean isGeminiPowered;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerGuidanceResponse {
        private String careerName;
        private String readinessAssessment;
        private int estimatedWeeksToReadiness;
        private List<String> prioritizedLearningMilestones;
        private List<String> portfolioProjectIdeas;
        private List<String> interviewPreparationAdvice;
        private String motivationalSummary;
        private boolean isGeminiPowered;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRecommendationResponse {
        private String title;
        private String domain;
        private String difficulty;
        private String reasonForRecommendation;
        private List<String> suggestedTopics;
        private String handsOnProject;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorChatRequest {
        private String message;
        private String currentCareerContext;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorChatResponse {
        private String reply;
        private List<String> followUpQuestions;
        private boolean isGeminiPowered;
    }
}

