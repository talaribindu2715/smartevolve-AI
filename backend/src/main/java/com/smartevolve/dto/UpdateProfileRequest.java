package com.smartevolve.dto;

import jakarta.validation.constraints.NotBlank;
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
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String educationLevel;
    private String institution;
    private String branch;
    private Integer graduationYear;
    private List<String> interests;
    private String preferredLearningStyle;
    private String academicGoals;
    private UUID targetCareerId;
    private Boolean onboardingCompleted;
}
