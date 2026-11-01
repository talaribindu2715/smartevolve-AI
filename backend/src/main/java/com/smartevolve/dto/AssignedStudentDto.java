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
public class AssignedStudentDto {
    private UUID studentId;
    private String fullName;
    private String branch;
    private String institution;
    private Integer graduationYear;
    private String targetCareerName;
    private BigDecimal overallProficiency;
    private BigDecimal careerReadiness;
    private String readinessLevel;
    private long completedModulesCount;
    private String assignmentStatus;
    private String mentorNotes;
    private List<StudentSkillDto> topSkills;
    private OffsetDateTime assignedAt;
}
