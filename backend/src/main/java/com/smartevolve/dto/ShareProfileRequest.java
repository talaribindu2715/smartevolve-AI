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
public class ShareProfileRequest {
    @NotNull(message = "Recruiter ID is required")
    private UUID recruiterId;
    private String notes;
}
