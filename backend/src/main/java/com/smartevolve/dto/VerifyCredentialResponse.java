package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyCredentialResponse {
    private UUID credentialId;
    private String achievementTitle;
    private boolean valid;
    private String status; // CONFIRMED, FAILED, REVOKED, INVALID
    private String transactionHash;
    private String contractAddress;
    private String issuerAddress;
    private Instant onChainTimestamp;
    private String verificationMessage;
}
