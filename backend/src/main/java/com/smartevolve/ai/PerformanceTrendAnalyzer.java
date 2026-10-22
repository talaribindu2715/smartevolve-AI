package com.smartevolve.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;

@Component
public class PerformanceTrendAnalyzer {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvolutionEventDTO {
        private UUID skillId;
        private String skillName;
        private BigDecimal previousProficiency;
        private BigDecimal newProficiency;
        private BigDecimal delta;
        private String changeReason;
        private String evidenceType;
        private OffsetDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendAnalysisSummary {
        private BigDecimal overallAverageProficiency;
        private BigDecimal totalProficiencyGained;
        private double averageGrowthPerAttempt;
        private String trajectory; // ACCELERATING, STEADY, EARLY
        private List<String> topImprovingSkills;
    }

    public TrendAnalysisSummary analyzeTrends(
            Map<UUID, BigDecimal> currentSkills,
            List<EvolutionEventDTO> history) {

        if (currentSkills.isEmpty()) {
            return TrendAnalysisSummary.builder()
                    .overallAverageProficiency(BigDecimal.ZERO)
                    .totalProficiencyGained(BigDecimal.ZERO)
                    .averageGrowthPerAttempt(0.0)
                    .trajectory("EARLY")
                    .topImprovingSkills(Collections.emptyList())
                    .build();
        }

        // Calculate average proficiency
        BigDecimal sum = BigDecimal.ZERO;
        for (BigDecimal val : currentSkills.values()) {
            sum = sum.add(val);
        }
        BigDecimal avgProf = sum.divide(BigDecimal.valueOf(currentSkills.size()), 1, RoundingMode.HALF_UP);

        // Analyze history gains
        BigDecimal totalGain = BigDecimal.ZERO;
        Map<String, BigDecimal> gainBySkill = new HashMap<>();

        for (EvolutionEventDTO event : history) {
            BigDecimal delta = event.getNewProficiency().subtract(event.getPreviousProficiency());
            if (delta.compareTo(BigDecimal.ZERO) > 0) {
                totalGain = totalGain.add(delta);
                gainBySkill.put(event.getSkillName(),
                        gainBySkill.getOrDefault(event.getSkillName(), BigDecimal.ZERO).add(delta));
            }
        }

        double avgGrowth = history.isEmpty() ? 0.0 :
                totalGain.doubleValue() / Math.max(1, history.size());

        List<String> topSkills = gainBySkill.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        String trajectory;
        if (history.size() >= 5 && avgGrowth >= 10.0) {
            trajectory = "ACCELERATING";
        } else if (!history.isEmpty()) {
            trajectory = "STEADY";
        } else {
            trajectory = "EARLY";
        }

        return TrendAnalysisSummary.builder()
                .overallAverageProficiency(avgProf)
                .totalProficiencyGained(totalGain.setScale(1, RoundingMode.HALF_UP))
                .averageGrowthPerAttempt(Math.round(avgGrowth * 10.0) / 10.0)
                .trajectory(trajectory)
                .topImprovingSkills(topSkills)
                .build();
    }
}
