package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private long totalUsers;
    private long studentCount;
    private long mentorCount;
    private long adminCount;
    private long recruiterCount;
    private long totalSkills;
    private long totalCareers;
    private long totalLearningResources;
    private long totalCredentialsIssued;
    private String systemHealthStatus;
    private String activeNetwork;
    private String recommendationEngine;
    private List<AdminUserDto> recentUsers;
}
