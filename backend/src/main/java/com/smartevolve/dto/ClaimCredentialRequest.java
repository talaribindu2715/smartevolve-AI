package com.smartevolve.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimCredentialRequest {
    @NotNull(message = "Skill ID is required")
    private UUID skillId;
    private String achievementTitle;
}
