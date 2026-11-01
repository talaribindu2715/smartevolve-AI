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
public class MentorDashboardDto {
    private UUID mentorId;
    private String mentorName;
    private String institution;
    private String branch;
    private long totalAssignedStudents;
    private BigDecimal averageCohortProficiency;
    private long activeRoadmapsCount;
    private List<AssignedStudentDto> students;
}
