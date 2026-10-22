package com.smartevolve.controller;

import com.smartevolve.dto.LearningResourceDto;
import com.smartevolve.dto.UpdateProgressRequest;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.LearningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
@Tag(name = "Learning", description = "Learning Resources & Progress Tracking")
public class LearningController {

    private final LearningService learningService;

    @GetMapping
    @Operation(summary = "Get all active learning resources with unlock and progress status")
    public ResponseEntity<List<LearningResourceDto>> getResources() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(learningService.getResources(studentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full resource detail, prerequisites, and learning content body")
    public ResponseEntity<LearningResourceDto> getResourceDetail(@PathVariable UUID id) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(learningService.getResourceDetail(studentId, id));
    }

    @PostMapping("/progress")
    @Operation(summary = "Update learning progress (start, mark complete) and unlock roadmap successors")
    public ResponseEntity<LearningResourceDto> updateProgress(@Valid @RequestBody UpdateProgressRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(learningService.updateProgress(studentId, request));
    }
}
