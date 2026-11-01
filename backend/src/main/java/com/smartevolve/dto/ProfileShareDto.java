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
public class ProfileShareDto {
    private UUID id;
    private UUID recruiterId;
    private String recruiterName;
    private String recruiterCompany;
    private String status;
    private String notes;
    private OffsetDateTime sharedAt;
}
