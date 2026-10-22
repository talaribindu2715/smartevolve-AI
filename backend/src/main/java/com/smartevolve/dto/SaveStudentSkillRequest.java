package com.smartevolve.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveStudentSkillRequest {
    @NotNull(message = "Skill ID is required")
    private UUID skillId;

    @NotNull(message = "Proficiency is required")
    @Min(value = 0, message = "Proficiency must be between 0 and 100")
    @Max(value = 100, message = "Proficiency must be between 0 and 100")
    private BigDecimal proficiency;

    private Integer selfRating1To5; // Optional shortcut from 1 to 5
}
