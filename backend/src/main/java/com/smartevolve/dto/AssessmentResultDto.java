package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentResultDto {
    private UUID attemptId;
    private UUID assessmentId;
    private String assessmentTitle;
    private UUID skillId;
    private String skillName;
    private BigDecimal score;
    private BigDecimal maximumScore;
    private BigDecimal percentage;
    private int attemptNumber;
    private int timeTakenSeconds;
    private OffsetDateTime submittedAt;

    // Adaptive AI Profile Update feedback
    private BigDecimal previousProficiency;
    private BigDecimal newProficiency;
    private BigDecimal proficiencyDelta;
    private BigDecimal updatedConfidence;
    private String evolutionReason;

    // Review of questions with explanations after submission
    private List<QuestionReviewItem> questionReviews;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionReviewItem {
        private UUID questionId;
        private String questionText;
        private String submittedAnswer;
        private String correctAnswer;
        private boolean isCorrect;
        private BigDecimal awardedMarks;
        private String explanation;
    }
}
