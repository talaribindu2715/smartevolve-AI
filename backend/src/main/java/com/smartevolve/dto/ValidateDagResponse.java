package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateDagResponse {
    private boolean valid;
    private int totalNodes;
    private int totalEdges;
    private int cycleCount;
    private List<String> cycleDetails;
    private String algorithmUsed;
    private String statusMessage;
}
