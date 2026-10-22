package com.smartevolve.controller;

import com.smartevolve.dto.AnalyticsDto;
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
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Performance Analytics & Skill Radar")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @Operation(summary = "Get skill category breakdown, growth velocity, and historical timeline")
    public ResponseEntity<AnalyticsDto> getAnalytics() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getAnalytics(studentId));
    }
}
