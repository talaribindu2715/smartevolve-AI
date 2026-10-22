package com.smartevolve.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class AdaptiveRecommendationEngineTest {

    private AdaptiveRecommendationEngine engine;

    @BeforeEach
    void setUp() {
        engine = new AdaptiveRecommendationEngine();
    }

    @Test
    @DisplayName("Should generate actionable recommendations for unmastered skills and exclude already completed courses")
    void shouldGenerateTargetedRecommendations() {
        UUID skillPython = UUID.randomUUID();
        UUID skillSql = UUID.randomUUID();

        UUID resPyBasics = UUID.randomUUID();
        UUID resPyAdv = UUID.randomUUID();
        UUID resSqlBasics = UUID.randomUUID();

        // Skill gaps: SQL gap 50% (CRITICAL), Python gap 20% (HIGH)
        List<SkillGapAnalyzer.SkillGapItem> gapItems = List.of(
                SkillGapAnalyzer.SkillGapItem.builder()
                        .skillId(skillSql).skillName("SQL").category("Programming")
                        .currentProficiency(new BigDecimal("30.00")).requiredProficiency(new BigDecimal("80.00"))
                        .gap(new BigDecimal("50.00")).weightedDeficit(new BigDecimal("75.00"))
                        .priority("CRITICAL").isMet(false).build(),
                SkillGapAnalyzer.SkillGapItem.builder()
                        .skillId(skillPython).skillName("Python").category("Programming")
                        .currentProficiency(new BigDecimal("55.00")).requiredProficiency(new BigDecimal("75.00"))
                        .gap(new BigDecimal("20.00")).weightedDeficit(new BigDecimal("24.00"))
                        .priority("HIGH").isMet(false).build()
        );

        // Learning resources: PyBasics is already completed by student!
        Set<UUID> completedIds = Set.of(resPyBasics);

        List<PrerequisiteResolver.ResourceNode> orderedResources = List.of(
                PrerequisiteResolver.ResourceNode.builder()
                        .resourceId(resPyBasics).title("Python 101").skillId(skillPython)
                        .difficulty("BEGINNER").estimatedMinutes(30).prerequisiteResourceIds(Collections.emptySet()).build(),
                PrerequisiteResolver.ResourceNode.builder()
                        .resourceId(resSqlBasics).title("SQL Foundations").skillId(skillSql)
                        .difficulty("BEGINNER").estimatedMinutes(45).prerequisiteResourceIds(Collections.emptySet()).build(),
                PrerequisiteResolver.ResourceNode.builder()
                        .resourceId(resPyAdv).title("Advanced Python").skillId(skillPython)
                        .difficulty("INTERMEDIATE").estimatedMinutes(60).prerequisiteResourceIds(Set.of(resPyBasics)).build()
        );

        var recommendations = engine.generateRecommendations("Data Analyst", gapItems, orderedResources, completedIds);

        // resPyBasics must NOT be recommended again because it was completed
        boolean containsCompleted = recommendations.stream().anyMatch(r -> r.getResourceId().equals(resPyBasics));
        assertFalse(containsCompleted, "Completed resource should not be recommended again");

        // Top recommendation should be SQL Foundations due to CRITICAL priority and high weighted gap
        assertEquals(2, recommendations.size());
        assertEquals(resSqlBasics, recommendations.get(0).getResourceId());
        assertTrue(recommendations.get(0).getReason().contains("SQL"));
    }
}
