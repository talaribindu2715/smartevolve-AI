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
public class EvolutionHistoryDto {
    private UUID id;
    private UUID skillId;
    private String skillName;
    private String category;
    private BigDecimal previousProficiency;
    private BigDecimal newProficiency;
    private BigDecimal delta;
    private String changeReason;
    private String evidenceType;
    private String evidenceReference;
    private Integer profileVersion;
    private OffsetDateTime createdAt;
}
