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
public class SkillGapAnalyzer {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapItem {
        private UUID skillId;
        private String skillName;
        private String category;
        private BigDecimal currentProficiency;
        private BigDecimal requiredProficiency;
        private BigDecimal gap; // required - current (if > 0)
        private BigDecimal importanceWeight;
        private BigDecimal weightedDeficit;
        private String priority; // CRITICAL, HIGH, MEDIUM, MASTERED
        private boolean isMet;
    }

    public List<SkillGapItem> analyzeGaps(
            Map<UUID, BigDecimal> studentSkills,
            List<CareerSkillRequirement> requirements) {

        List<SkillGapItem> gapItems = new ArrayList<>();

        for (CareerSkillRequirement req : requirements) {
            BigDecimal current = studentSkills.getOrDefault(req.getSkillId(), BigDecimal.ZERO);
            BigDecimal required = req.getRequiredProficiency();
            BigDecimal diff = required.subtract(current);

            BigDecimal gap = diff.compareTo(BigDecimal.ZERO) > 0 ? diff : BigDecimal.ZERO;
            boolean isMet = current.compareTo(required) >= 0;

            BigDecimal weight = req.getImportanceWeight() != null ? req.getImportanceWeight() : BigDecimal.ONE;
            BigDecimal weightedDeficit = gap.multiply(weight).setScale(2, RoundingMode.HALF_UP);

            String priority;
            if (isMet) {
                priority = "MASTERED";
            } else if (gap.compareTo(new BigDecimal("35.0")) >= 0) {
                priority = "CRITICAL";
            } else if (gap.compareTo(new BigDecimal("20.0")) >= 0) {
                priority = "HIGH";
            } else {
                priority = "MEDIUM";
            }

            gapItems.add(SkillGapItem.builder()
                    .skillId(req.getSkillId())
                    .skillName(req.getSkillName())
                    .category(req.getCategory())
                    .currentProficiency(current)
                    .requiredProficiency(required)
                    .gap(gap.setScale(2, RoundingMode.HALF_UP))
                    .importanceWeight(weight)
                    .weightedDeficit(weightedDeficit)
                    .priority(priority)
                    .isMet(isMet)
                    .build());
        }

        // Sort by weighted deficit descending (highest gap impact first)
        gapItems.sort((a, b) -> b.getWeightedDeficit().compareTo(a.getWeightedDeficit()));

        return gapItems;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CareerSkillRequirement {
        private UUID skillId;
        private String skillName;
        private String category;
        private BigDecimal requiredProficiency;
        private BigDecimal importanceWeight;
    }
}
