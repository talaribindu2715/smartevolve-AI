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
public class MentorAssignResourceRequest {
    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Resource ID is required")
    private UUID resourceId;

    @Builder.Default
    private String priority = "HIGH";

    private String note;
}
