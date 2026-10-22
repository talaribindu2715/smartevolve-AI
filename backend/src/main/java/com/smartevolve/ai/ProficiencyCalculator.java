package com.smartevolve.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class ProficiencyCalculator {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProficiencyUpdateResult {
        private BigDecimal previousProficiency;
        private BigDecimal newProficiency;
        private BigDecimal delta;
        private BigDecimal confidence;
        private String changeReason;
    }

    /**
     * Adaptively recalculates proficiency based on assessment score evidence.
     *
     * @param currentProficiency Current recorded proficiency [0.0 - 100.0]
     * @param currentConfidence Current confidence level [0.0 - 1.0]
     * @param assessmentPercentage Score achieved [0.0 - 100.0]
     * @param difficulty Assessment difficulty ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
     * @param attemptNumber Number of attempts (1-indexed)
     */
    public ProficiencyUpdateResult calculateAssessmentImpact(
            BigDecimal currentProficiency,
            BigDecimal currentConfidence,
            BigDecimal assessmentPercentage,
            String difficulty,
            int attemptNumber) {

        BigDecimal prev = currentProficiency != null ? currentProficiency : BigDecimal.ZERO;
        BigDecimal conf = currentConfidence != null ? currentConfidence : new BigDecimal("0.40");

        // Base learning rate based on difficulty weight
        double baseRate;
        switch (difficulty != null ? difficulty.toUpperCase() : "INTERMEDIATE") {
            case "ADVANCED" -> baseRate = 0.45;
            case "BEGINNER" -> baseRate = 0.25;
            default -> baseRate = 0.35;
        }

        // Attempt damping: repeated attempts reduce swing to prevent score hacking
        double damping = 1.0 / Math.sqrt(Math.max(1, attemptNumber));
        double effectiveRate = baseRate * damping;

        double prevVal = prev.doubleValue();
        double scoreVal = assessmentPercentage.doubleValue();

        // Calculate delta: delta = (score - prev) * effectiveRate
        double deltaVal = (scoreVal - prevVal) * effectiveRate;

        // Apply bonus when achieving high mastery on hard assessments
        if (scoreVal >= 85.0 && "ADVANCED".equalsIgnoreCase(difficulty)) {
            deltaVal += 3.0;
        }

        double newVal = Math.max(0.0, Math.min(100.0, prevVal + deltaVal));

        // Confidence increases with verified assessment evidence
        double newConfVal = Math.min(0.95, conf.doubleValue() + 0.15 * damping);

        BigDecimal newProficiency = BigDecimal.valueOf(newVal).setScale(2, RoundingMode.HALF_UP);
        BigDecimal delta = newProficiency.subtract(prev);
        BigDecimal newConfidence = BigDecimal.valueOf(newConfVal).setScale(2, RoundingMode.HALF_UP);

        String sign = delta.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "";
        String reason = String.format("Assessment score of %.1f%% (%s difficulty, attempt #%d) resulted in %s%.1f%% proficiency update.",
                scoreVal, difficulty, attemptNumber, sign, delta.doubleValue());

        return ProficiencyUpdateResult.builder()
                .previousProficiency(prev)
                .newProficiency(newProficiency)
                .delta(delta)
                .confidence(newConfidence)
                .changeReason(reason)
                .build();
    }

    /**
     * Calculates baseline initial proficiency from self-reporting with appropriate modest confidence.
     */
    public BigDecimal calculateInitialSelfReportProficiency(int rating1To5) {
        int bounded = Math.max(1, Math.min(5, rating1To5));
        return switch (bounded) {
            case 1 -> new BigDecimal("15.00");
            case 2 -> new BigDecimal("35.00");
            case 3 -> new BigDecimal("55.00");
            case 4 -> new BigDecimal("75.00");
            case 5 -> new BigDecimal("90.00");
            default -> new BigDecimal("20.00");
        };
    }
}
