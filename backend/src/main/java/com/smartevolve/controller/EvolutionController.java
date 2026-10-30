package com.smartevolve.controller;

import com.smartevolve.ai.PerformanceTrendAnalyzer;
import com.smartevolve.dto.EvolutionHistoryDto;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.EvolutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evolution")
@RequiredArgsConstructor
@Tag(name = "Evolution", description = "Student Skill Evolution History & Trends")
public class EvolutionController {

    private final EvolutionService evolutionService;

    @GetMapping("/history")
    @Operation(summary = "Get timeline of student skill changes and assessment evidence history")
    public ResponseEntity<List<EvolutionHistoryDto>> getHistory() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(evolutionService.getEvolutionHistory(studentId));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get growth trajectory, velocity, and top improving skills")
    public ResponseEntity<PerformanceTrendAnalyzer.TrendAnalysisSummary> getTrends() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(evolutionService.getTrendAnalysis(studentId));
    }

    @org.springframework.web.bind.annotation.PostMapping("/recalculate")
    @Operation(summary = "Trigger AI evolution cycle recalculating recommendations and trajectory")
    public ResponseEntity<PerformanceTrendAnalyzer.TrendAnalysisSummary> recalculateEvolution() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(evolutionService.triggerEvolutionCycle(studentId));
    }
}
