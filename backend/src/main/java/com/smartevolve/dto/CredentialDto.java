package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CredentialDto {
    private UUID id;
    private String credentialType;
    private UUID skillId;
    private String skillName;
    private String achievementTitle;
    private String achievementDataHash;
    private String issuerAddress;
    private String networkId;
    private String contractAddress;
    private String transactionHash;
    private Long blockNumber;
    private String status; // PENDING, CONFIRMED, FAILED, REVOKED
    private OffsetDateTime issuedAt;
    private OffsetDateTime verifiedAt;
}
