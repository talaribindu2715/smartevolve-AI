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
public class CareerDto {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private BigDecimal compatibilityScore; // Computed dynamically for current user
    private String readinessLevel;
    private int requiredSkillsCount;
    private String difficulty; // BEGINNER_FRIENDLY, INTERMEDIATE, ADVANCED
    private int estimatedPreparationWeeks;
}
