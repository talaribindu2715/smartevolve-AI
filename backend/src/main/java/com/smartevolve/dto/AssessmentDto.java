package com.smartevolve.dto;

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
public class AssessmentDto {
    private UUID id;
    private String title;
    private UUID skillId;
    private String skillName;
    private String difficulty;
    private String assessmentType;
    private int totalQuestions;
    private BigDecimal latestScorePercentage;
    private int totalAttempts;
    private List<QuestionDto> questions;
}
