package com.smartevolve.controller;

import com.smartevolve.dto.RoadmapDto;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.RoadmapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
@Tag(name = "Roadmaps", description = "Personalized Learning Roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping("/active")
    @Operation(summary = "Get active prerequisite-aware learning roadmap for student's career goal")
    public ResponseEntity<RoadmapDto> getActiveRoadmap() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return roadmapService.getActiveRoadmap(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/refresh/{careerId}")
    @Operation(summary = "Regenerate personalized roadmap for a career goal")
    public ResponseEntity<RoadmapDto> refreshRoadmap(@PathVariable UUID careerId) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(roadmapService.generateOrRefreshRoadmap(studentId, careerId));
    }
}
