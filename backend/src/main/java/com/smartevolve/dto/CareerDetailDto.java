package com.smartevolve.dto;

import com.smartevolve.ai.CareerMatchingEngine;
import com.smartevolve.ai.SkillGapAnalyzer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerDetailDto {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private boolean isCurrentGoal;
    private BigDecimal compatibilityScore;
    private String readinessLevel;
    private String explanation;
    private List<CareerMatchingEngine.SkillMatchDetail> matchedSkills;
    private List<CareerMatchingEngine.SkillMatchDetail> partiallyMatchedSkills;
    private List<CareerMatchingEngine.SkillMatchDetail> missingSkills;
    private List<SkillGapAnalyzer.SkillGapItem> skillGaps;
}
