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
public class CandidateDossierDto {
    private UUID studentId;
    private String fullName;
    private String educationLevel;
    private String institution;
    private String branch;
    private Integer graduationYear;
    private List<String> interests;
    private String academicGoals;
    private String targetCareerName;
    private BigDecimal careerReadiness;
    private String readinessLevel;
    private BigDecimal overallProficiency;
    private List<StudentSkillDto> skills;
    private List<CredentialDto> verifiedCredentials;
    private List<RoadmapStepDto> roadmapMilestones;
    private OffsetDateTime sharedAt;
}
