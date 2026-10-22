package com.smartevolve.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class AdaptiveRecommendationEngine {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationCandidate {
        private UUID skillId;
        private String skillName;
        private UUID resourceId;
        private String resourceTitle;
        private String difficulty;
        private int estimatedMinutes;
        private String recommendationType; // SKILL_GAP, PREREQUISITE, CAREER_ALIGNMENT
        private String priority; // CRITICAL, HIGH, MEDIUM
        private String reason;
        private double rankingScore;
    }

    /**
     * Synthesizes actionable, non-repetitive learning recommendations
     * based on student skill gaps, target career, and satisfied prerequisites.
     */
    public List<RecommendationCandidate> generateRecommendations(
            String targetCareerName,
            List<SkillGapAnalyzer.SkillGapItem> gapItems,
            List<PrerequisiteResolver.ResourceNode> orderedResources,
            Set<UUID> completedResourceIds) {

        List<RecommendationCandidate> candidates = new ArrayList<>();
        Map<UUID, SkillGapAnalyzer.SkillGapItem> gapBySkill = new HashMap<>();

        for (SkillGapAnalyzer.SkillGapItem item : gapItems) {
            if (!item.isMet() && item.getGap().compareTo(BigDecimal.ZERO) > 0) {
                gapBySkill.put(item.getSkillId(), item);
            }
        }

        for (PrerequisiteResolver.ResourceNode res : orderedResources) {
            // Skip already completed resources
            if (completedResourceIds.contains(res.getResourceId())) {
                continue;
            }

            SkillGapAnalyzer.SkillGapItem gapItem = gapBySkill.get(res.getSkillId());
            if (gapItem == null) {
                continue; // Skill is already mastered; don't recommend redundant courses
            }

            // Check if prerequisites are satisfied
            boolean prereqsSatisfied = res.getPrerequisiteResourceIds().isEmpty()
                    || completedResourceIds.containsAll(res.getPrerequisiteResourceIds());

            String reason;
            String priority = gapItem.getPriority();
            double rankScore = gapItem.getWeightedDeficit().doubleValue();

            if (prereqsSatisfied) {
                reason = String.format("Directly addresses your %.1f%% deficit in %s for %s. Foundational prerequisites are complete.",
                        gapItem.getGap().doubleValue(), gapItem.getSkillName(), targetCareerName);
                rankScore += 50.0; // Boost available items
            } else {
                priority = "MEDIUM";
                reason = String.format("Addresses upcoming %s requirement for %s. Unlock this by finishing prerequisite modules first.",
                        gapItem.getSkillName(), targetCareerName);
            }

            candidates.add(RecommendationCandidate.builder()
                    .skillId(res.getSkillId())
                    .skillName(gapItem.getSkillName())
                    .resourceId(res.getResourceId())
                    .resourceTitle(res.getTitle())
                    .difficulty(res.getDifficulty())
                    .estimatedMinutes(res.getEstimatedMinutes())
                    .recommendationType("SKILL_GAP")
                    .priority(priority)
                    .reason(reason)
                    .rankingScore(rankScore)
                    .build());
        }

        // Rank by highest score descending
        candidates.sort((a, b) -> Double.compare(b.getRankingScore(), a.getRankingScore()));

        // Return top 5 most urgent and actionable recommendations
        return candidates.subList(0, Math.min(candidates.size(), 5));
    }
}
