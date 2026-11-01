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
public class StudyAssistantRequest {
    @NotBlank(message = "Question or prompt cannot be blank")
    private String question;
    private UUID skillId;
    private String topicTitle;
    private UUID targetCareerId;
    @Builder.Default
    private String contextMode = "GENERAL"; // EXPLANATION, QUIZ_PREP, STUDY_PLAN, GENERAL
}
