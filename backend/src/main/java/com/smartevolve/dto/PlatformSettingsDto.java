package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformSettingsDto {
    private String aiModel;
    private String recommendationEngineVersion;
    private String blockchainNetwork;
    private String smartContractAddress;
    private boolean rlsEnforced;
    private boolean strictModeEnabled;
    private boolean allowStudentRegistration;
}
