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
public class CandidateSummaryDto {
    private UUID studentId;
    private String fullName;
    private String educationLevel;
    private String institution;
    private String branch;
    private Integer graduationYear;
    private String targetCareerName;
    private BigDecimal overallProficiency;
    private BigDecimal careerReadiness;
    private String readinessLevel;
    private long verifiedCredentialsCount;
    private List<StudentSkillDto> topSkills;
    private OffsetDateTime sharedAt;
    private String shareNotes;
}
