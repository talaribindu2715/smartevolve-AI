package com.smartevolve.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class ProficiencyCalculatorTest {

    private ProficiencyCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new ProficiencyCalculator();
    }

    @Test
    @DisplayName("Assessment score higher than current proficiency increases proficiency adaptively")
    void shouldIncreaseProficiencyOnHighAssessmentScore() {
        BigDecimal current = new BigDecimal("45.00");
        BigDecimal conf = new BigDecimal("0.40");
        BigDecimal score = new BigDecimal("85.00");

        var result = calculator.calculateAssessmentImpact(current, conf, score, "INTERMEDIATE", 1);

        assertTrue(result.getNewProficiency().compareTo(current) > 0, "New proficiency must be higher than current");
        assertTrue(result.getDelta().compareTo(BigDecimal.ZERO) > 0);
        assertTrue(result.getConfidence().compareTo(conf) > 0, "Confidence should increase with assessment evidence");
        assertNotNull(result.getChangeReason());
    }

    @Test
    @DisplayName("Repeated attempts should apply damping to prevent excessive score swings")
    void shouldApplyAttemptDamping() {
        BigDecimal current = new BigDecimal("50.00");
        BigDecimal score = new BigDecimal("90.00");

        var attempt1 = calculator.calculateAssessmentImpact(current, new BigDecimal("0.50"), score, "INTERMEDIATE", 1);
        var attempt4 = calculator.calculateAssessmentImpact(current, new BigDecimal("0.50"), score, "INTERMEDIATE", 4);

        assertTrue(attempt1.getDelta().compareTo(attempt4.getDelta()) > 0,
                "Delta for attempt 1 should be larger than delta for attempt 4 due to damping factor");
    }

    @Test
    @DisplayName("Proficiency must remain strictly bounded between 0 and 100")
    void shouldBoundProficiencyStrictly() {
        var high = calculator.calculateAssessmentImpact(new BigDecimal("98.00"), new BigDecimal("0.80"), new BigDecimal("100.00"), "ADVANCED", 1);
        assertTrue(high.getNewProficiency().compareTo(new BigDecimal("100.00")) <= 0);

        var low = calculator.calculateAssessmentImpact(new BigDecimal("10.00"), new BigDecimal("0.80"), new BigDecimal("0.00"), "ADVANCED", 1);
        assertTrue(low.getNewProficiency().compareTo(BigDecimal.ZERO) >= 0);
    }
}
