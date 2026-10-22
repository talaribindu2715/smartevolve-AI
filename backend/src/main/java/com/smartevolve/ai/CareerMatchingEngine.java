package com.smartevolve.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
public class CareerMatchingEngine {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerMatchResult {
        private UUID careerId;
        private String careerName;
        private String category;
        private BigDecimal compatibilityScore; // 0 - 100%
        private int totalSkillsCount;
        private int matchedSkillsCount;
        private int partiallyMatchedCount;
        private int missingSkillsCount;
        private List<SkillMatchDetail> matchedSkills;
        private List<SkillMatchDetail> partiallyMatchedSkills;
        private List<SkillMatchDetail> missingSkills;
        private String readinessLevel; // READY, HIGH_POTENTIAL, DEVELOPING, EARLY_STAGE
        private String explanation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillMatchDetail {
        private UUID skillId;
        private String skillName;
        private String category;
        private BigDecimal currentProficiency;
        private BigDecimal requiredProficiency;
        private BigDecimal fulfillmentPercentage; // (current / required) * 100 capped at 100%
        private BigDecimal importanceWeight;
        private String status; // MATCHED, PARTIAL, MISSING
    }

    public CareerMatchResult evaluateCompatibility(
            UUID careerId,
            String careerName,
            String category,
            Map<UUID, BigDecimal> studentProficiencies,
            List<SkillGapAnalyzer.CareerSkillRequirement> requirements) {

        if (requirements == null || requirements.isEmpty()) {
            return CareerMatchResult.builder()
                    .careerId(careerId)
                    .careerName(careerName)
                    .category(category)
                    .compatibilityScore(BigDecimal.ZERO)
                    .readinessLevel("EARLY_STAGE")
                    .explanation("No skill requirements defined for this career path.")
                    .matchedSkills(Collections.emptyList())
                    .partiallyMatchedSkills(Collections.emptyList())
                    .missingSkills(Collections.emptyList())
                    .build();
        }

        BigDecimal totalWeightedFulfillment = BigDecimal.ZERO;
        BigDecimal totalWeights = BigDecimal.ZERO;

        List<SkillMatchDetail> matchedList = new ArrayList<>();
        List<SkillMatchDetail> partialList = new ArrayList<>();
        List<SkillMatchDetail> missingList = new ArrayList<>();

        for (SkillGapAnalyzer.CareerSkillRequirement req : requirements) {
            BigDecimal current = studentProficiencies.getOrDefault(req.getSkillId(), BigDecimal.ZERO);
            BigDecimal required = req.getRequiredProficiency();
            BigDecimal weight = req.getImportanceWeight() != null ? req.getImportanceWeight() : BigDecimal.ONE;

            // Fulfillment ratio = min(1.0, current / required)
            BigDecimal ratio = required.compareTo(BigDecimal.ZERO) > 0
                    ? current.divide(required, 4, RoundingMode.HALF_UP).min(BigDecimal.ONE)
                    : BigDecimal.ONE;

            BigDecimal fulfillmentPct = ratio.multiply(new BigDecimal("100.0")).setScale(1, RoundingMode.HALF_UP);

            String status;
            SkillMatchDetail detail = SkillMatchDetail.builder()
                    .skillId(req.getSkillId())
                    .skillName(req.getSkillName())
                    .category(req.getCategory())
                    .currentProficiency(current)
                    .requiredProficiency(required)
                    .fulfillmentPercentage(fulfillmentPct)
                    .importanceWeight(weight)
                    .build();

            if (current.compareTo(required) >= 0) {
                status = "MATCHED";
                detail.setStatus(status);
                matchedList.add(detail);
            } else if (current.compareTo(required.multiply(new BigDecimal("0.50"))) >= 0) {
                status = "PARTIAL";
                detail.setStatus(status);
                partialList.add(detail);
            } else {
                status = "MISSING";
                detail.setStatus(status);
                missingList.add(detail);
            }

            totalWeightedFulfillment = totalWeightedFulfillment.add(ratio.multiply(weight));
            totalWeights = totalWeights.add(weight);
        }

        BigDecimal overallScore = totalWeights.compareTo(BigDecimal.ZERO) > 0
                ? totalWeightedFulfillment.divide(totalWeights, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.0")).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String readiness;
        if (overallScore.compareTo(new BigDecimal("85.0")) >= 0) {
            readiness = "READY";
        } else if (overallScore.compareTo(new BigDecimal("65.0")) >= 0) {
            readiness = "HIGH_POTENTIAL";
        } else if (overallScore.compareTo(new BigDecimal("40.0")) >= 0) {
            readiness = "DEVELOPING";
        } else {
            readiness = "EARLY_STAGE";
        }

        String explanation = generateExplanation(careerName, overallScore, matchedList.size(), requirements.size(), missingList);

        return CareerMatchResult.builder()
                .careerId(careerId)
                .careerName(careerName)
                .category(category)
                .compatibilityScore(overallScore)
                .totalSkillsCount(requirements.size())
                .matchedSkillsCount(matchedList.size())
                .partiallyMatchedCount(partialList.size())
                .missingSkillsCount(missingList.size())
                .matchedSkills(matchedList)
                .partiallyMatchedSkills(partialList)
                .missingSkills(missingList)
                .readinessLevel(readiness)
                .explanation(explanation)
                .build();
    }

    private String generateExplanation(String careerName, BigDecimal score, int matched, int total, List<SkillMatchDetail> missing) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("You are at %.1f%% compatibility for %s. ", score.doubleValue(), careerName));
        sb.append(String.format("You fully meet the proficiency bar for %d of %d required skills. ", matched, total));

        if (!missing.isEmpty()) {
            sb.append("Priority skill growth needed in: ");
            for (int i = 0; i < Math.min(3, missing.size()); i++) {
                if (i > 0) sb.append(", ");
                sb.append(missing.get(i).getSkillName());
            }
            sb.append(". Completing target modules in these areas will accelerate your career readiness.");
        } else if (score.compareTo(new BigDecimal("85.0")) >= 0) {
            sb.append("You are exceptionally well prepared! Consider requesting blockchain credential certification.");
        } else {
            sb.append("Focus on deepening your intermediate skills to achieve career readiness.");
        }

        return sb.toString();
    }
}
