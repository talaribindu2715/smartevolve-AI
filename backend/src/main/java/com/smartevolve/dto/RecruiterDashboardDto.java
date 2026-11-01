package com.smartevolve.dto;

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
public class RecruiterDashboardDto {
    private UUID recruiterId;
    private String recruiterName;
    private String organization;
    private long sharedCandidatesCount;
    private long verifiedCredentialsCount;
    private List<CandidateSummaryDto> candidates;
}
