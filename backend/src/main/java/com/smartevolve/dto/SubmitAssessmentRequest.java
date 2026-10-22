package com.smartevolve.dto;

import jakarta.validation.constraints.NotEmpty;
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
public class SubmitAssessmentRequest {

    @NotNull(message = "Assessment ID is required")
    private UUID assessmentId;

    private Integer timeTakenSeconds;

    @NotEmpty(message = "Responses must not be empty")
    private List<QuestionResponseItem> responses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponseItem {
        @NotNull(message = "Question ID is required")
        private UUID questionId;

        @NotNull(message = "Submitted answer is required")
        private String submittedAnswer;
    }
}
