package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentSkillDto {
    private UUID id;
    private UUID skillId;
    private String skillName;
    private String category;
    private BigDecimal proficiency;
    private BigDecimal confidence;
    private String evidenceType;
    private OffsetDateTime lastAssessedAt;
}
