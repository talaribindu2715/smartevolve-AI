package com.smartevolve.controller;

import com.smartevolve.dto.CareerDetailDto;
import com.smartevolve.dto.CareerDto;
import com.smartevolve.dto.SetCareerGoalRequest;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.CareerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/careers")
@RequiredArgsConstructor
@Tag(name = "Careers", description = "Career Exploration & Compatibility Analysis")
public class CareerController {

    private final CareerService careerService;

    @GetMapping
    @Operation(summary = "Get all 15 industry careers with dynamic compatibility score for authenticated student")
    public ResponseEntity<List<CareerDto>> getCareers() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(careerService.getAllCareersWithCompatibility(studentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed career compatibility breakdown and skill gap analysis")
    public ResponseEntity<CareerDetailDto> getCareerDetail(@PathVariable UUID id) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(careerService.getCareerDetail(studentId, id));
    }

    @PostMapping("/{id}/set-goal")
    @Operation(summary = "Set target career goal and generate personalized adaptive roadmap")
    public ResponseEntity<Map<String, String>> setCareerGoal(@PathVariable UUID id) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        careerService.setCareerGoal(studentId, id);
        return ResponseEntity.ok(Map.of("message", "Career goal updated successfully and roadmap refreshed."));
    }
}
