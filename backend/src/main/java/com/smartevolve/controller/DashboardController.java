package com.smartevolve.controller;

import com.smartevolve.dto.DashboardSummaryDto;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Real-time Aggregated Dashboard Metrics")
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get aggregated student dashboard metrics, roadmap, recommendations, and recent activity")
    public ResponseEntity<DashboardSummaryDto> getDashboard() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getDashboardSummary(studentId));
    }
}
