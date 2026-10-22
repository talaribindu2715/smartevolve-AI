package com.smartevolve.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class CareerMatchingEngineTest {

    private CareerMatchingEngine engine;

    @BeforeEach
    void setUp() {
        engine = new CareerMatchingEngine();
    }

    @Test
    @DisplayName("Should evaluate career compatibility score, categorize matched/partial/missing skills, and generate explainable text")
    void shouldEvaluateCompatibilityAccurately() {
        UUID careerId = UUID.randomUUID();
        UUID s1 = UUID.randomUUID(); // Python
        UUID s2 = UUID.randomUUID(); // SQL
        UUID s3 = UUID.randomUUID(); // Statistics

        // Student proficiency
        Map<UUID, BigDecimal> studentProf = Map.of(
                s1, new BigDecimal("80.00"), // Matched (Req 75)
                s2, new BigDecimal("45.00"), // Partial (Req 80, >= 40)
                s3, new BigDecimal("10.00")  // Missing (Req 70, < 35)
        );

        List<SkillGapAnalyzer.CareerSkillRequirement> reqs = List.of(
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(s1).skillName("Python").category("Programming")
                        .requiredProficiency(new BigDecimal("75.00")).importanceWeight(new BigDecimal("1.20")).build(),
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(s2).skillName("SQL").category("Programming")
                        .requiredProficiency(new BigDecimal("80.00")).importanceWeight(new BigDecimal("1.50")).build(),
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(s3).skillName("Statistics").category("Data Analysis")
                        .requiredProficiency(new BigDecimal("70.00")).importanceWeight(new BigDecimal("1.00")).build()
        );

        var result = engine.evaluateCompatibility(careerId, "Data Analyst", "Data & Analytics", studentProf, reqs);

        assertEquals(1, result.getMatchedSkillsCount());
        assertEquals(1, result.getPartiallyMatchedCount());
        assertEquals(1, result.getMissingSkillsCount());

        assertTrue(result.getCompatibilityScore().doubleValue() > 0);
        assertTrue(result.getCompatibilityScore().doubleValue() < 100);
        assertNotNull(result.getExplanation());
        assertTrue(result.getExplanation().contains("Data Analyst"));
    }
}
