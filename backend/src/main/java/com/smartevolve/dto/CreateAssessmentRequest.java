package com.smartevolve.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssessmentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    @Builder.Default
    private Integer passingScore = 70;

    @Builder.Default
    private Integer timeLimitMinutes = 20;

    private List<CreateQuestionRequest> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateQuestionRequest {
        @NotBlank(message = "Question text is required")
        private String questionText;

        @Builder.Default
        private String questionType = "MULTIPLE_CHOICE";

        private List<String> options;

        @NotBlank(message = "Correct answer is required")
        private String correctAnswer;

        @Builder.Default
        private Integer points = 10;

        private String explanation;
    }
}
