package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YouTubeSkillSummaryDto {
    private UUID skillId;
    private String skillName;
    private String category;
    private long videoCount;
}
