package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDto {
    private UUID id;
    private String fullName;
    private String educationLevel;
    private String institution;
    private String branch;
    private Integer graduationYear;
    private List<String> interests;
    private Boolean onboardingCompleted;
    private OffsetDateTime createdAt;
}
