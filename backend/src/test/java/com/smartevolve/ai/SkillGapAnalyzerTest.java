package com.smartevolve.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class SkillGapAnalyzerTest {

    private SkillGapAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new SkillGapAnalyzer();
    }

    @Test
    @DisplayName("Should correctly identify critical and high skill gaps based on deficit thresholds")
    void shouldAnalyzeGapsAccurately() {
        UUID pythonId = UUID.randomUUID();
        UUID sqlId = UUID.randomUUID();
        UUID statsId = UUID.randomUUID();
        UUID powerBiId = UUID.randomUUID();

        // Student proficiency: Python=45%, SQL=30%, Statistics=20%, Power BI=15% (matching prompt example!)
        Map<UUID, BigDecimal> studentSkills = Map.of(
                pythonId, new BigDecimal("45.00"),
                sqlId, new BigDecimal("30.00"),
                statsId, new BigDecimal("20.00"),
                powerBiId, new BigDecimal("15.00")
        );

        // Career requirements for Data Analyst
        List<SkillGapAnalyzer.CareerSkillRequirement> reqs = List.of(
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(sqlId)
                        .skillName("SQL")
                        .category("Programming")
                        .requiredProficiency(new BigDecimal("85.00"))
                        .importanceWeight(new BigDecimal("1.50"))
                        .build(),
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(pythonId)
                        .skillName("Python")
                        .category("Programming")
                        .requiredProficiency(new BigDecimal("75.00"))
                        .importanceWeight(new BigDecimal("1.20"))
                        .build(),
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(statsId)
                        .skillName("Statistics")
                        .category("Data Analysis")
                        .requiredProficiency(new BigDecimal("70.00"))
                        .importanceWeight(new BigDecimal("1.10"))
                        .build(),
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(powerBiId)
                        .skillName("Power BI")
                        .category("Data Analysis")
                        .requiredProficiency(new BigDecimal("80.00"))
                        .importanceWeight(new BigDecimal("1.30"))
                        .build()
        );

        List<SkillGapAnalyzer.SkillGapItem> gaps = analyzer.analyzeGaps(studentSkills, reqs);

        assertEquals(4, gaps.size());

        // SQL: gap = 85 - 30 = 55 (>= 35 => CRITICAL), weightedDeficit = 55 * 1.5 = 82.5
        SkillGapAnalyzer.SkillGapItem sqlGap = gaps.stream()
                .filter(g -> g.getSkillId().equals(sqlId)).findFirst().orElseThrow();
        assertEquals("CRITICAL", sqlGap.getPriority());
        assertEquals(new BigDecimal("55.00"), sqlGap.getGap());
        assertFalse(sqlGap.isMet());

        // Python: gap = 75 - 45 = 30 (>= 20 => HIGH)
        SkillGapAnalyzer.SkillGapItem pyGap = gaps.stream()
                .filter(g -> g.getSkillId().equals(pythonId)).findFirst().orElseThrow();
        assertEquals("HIGH", pyGap.getPriority());
        assertEquals(new BigDecimal("30.00"), pyGap.getGap());

        // Top gap in sorted list should be SQL or Power BI based on weighted deficit
        assertTrue(gaps.get(0).getWeightedDeficit().compareTo(gaps.get(1).getWeightedDeficit()) >= 0);
    }

    @Test
    @DisplayName("Should mark skills as MASTERED when student proficiency meets or exceeds requirement")
    void shouldRecognizeMasteredSkills() {
        UUID skillId = UUID.randomUUID();
        Map<UUID, BigDecimal> studentSkills = Map.of(skillId, new BigDecimal("90.00"));

        List<SkillGapAnalyzer.CareerSkillRequirement> reqs = List.of(
                SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(skillId)
                        .skillName("Java")
                        .category("Programming")
                        .requiredProficiency(new BigDecimal("85.00"))
                        .importanceWeight(BigDecimal.ONE)
                        .build()
        );

        List<SkillGapAnalyzer.SkillGapItem> gaps = analyzer.analyzeGaps(studentSkills, reqs);
        assertEquals(1, gaps.size());
        assertEquals("MASTERED", gaps.get(0).getPriority());
        assertEquals(BigDecimal.ZERO.setScale(2), gaps.get(0).getGap());
        assertTrue(gaps.get(0).isMet());
    }
}
