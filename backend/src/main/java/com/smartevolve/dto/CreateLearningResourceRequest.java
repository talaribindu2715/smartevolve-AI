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
public class CreateLearningResourceRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    @Builder.Default
    private String difficulty = "BEGINNER";

    @Builder.Default
    private String contentType = "ARTICLE";

    private String contentBody;

    private String externalUrl;

    @Builder.Default
    private Integer estimatedMinutes = 30;

    private List<UUID> prerequisiteResourceIds;
}
