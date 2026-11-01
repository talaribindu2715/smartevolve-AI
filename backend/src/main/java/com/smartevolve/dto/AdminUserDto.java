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
public class AdminUserDto {
    private UUID id;
    private String fullName;
    private String role;
    private String institution;
    private String branch;
    private String educationLevel;
    private Integer graduationYear;
    private Boolean onboardingCompleted;
    private OffsetDateTime createdAt;
}
