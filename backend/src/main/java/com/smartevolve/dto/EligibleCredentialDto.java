package com.smartevolve.dto;

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
public class EligibleCredentialDto {
    private UUID skillId;
    private String skillName;
    private String achievementTitle;
    private String milestoneType;
    private BigDecimal scoreOrProficiency;
    private String criteriaDescription;
    private boolean eligible;
}
