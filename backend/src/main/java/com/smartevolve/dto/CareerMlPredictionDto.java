package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class CareerMlPredictionDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionResult {
        private String topCareerMatch;
        private double topCareerConfidencePct;
        private String readinessLevel; // JOB_READY, HIGH_POTENTIAL, DEVELOPING, EXPLORING
        private List<CareerMatchScore> rankedCareerMatches;
        private List<String> topContributingSkills;
        private List<SkillGapDetail> criticalGapsToBridge;
        private String explainableAiInsight;
        private ModelMetadata modelMetadata;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerMatchScore {
        private String careerName;
        private double matchProbabilityPct;
        private double vectorSimilarityScore;
        private String readinessLevel;
        private int matchedSkillsCount;
        private int missingSkillsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapDetail {
        private String skillName;
        private double currentProficiency;
        private double targetBenchmark;
        private double deficit;
        private double importanceGiniWeight;
        private String priority;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModelMetadata {
        private String modelType;
        private double accuracy5FoldPct;
        private double f1MacroScorePct;
        private int trainingSamples;
        private int distinctCareersCount;
        private int inputFeaturesCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimulationRequest {
        private Map<String, Double> simulatedSkillOverrides;
    }
}

