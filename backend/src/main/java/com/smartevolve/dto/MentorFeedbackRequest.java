package com.smartevolve.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorFeedbackRequest {
    @NotBlank(message = "Feedback content is required")
    private String feedbackText;
    private UUID suggestedSkillId;
    private String priority; // HIGH, MEDIUM, LOW
}
