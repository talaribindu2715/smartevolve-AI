package com.smartevolve.controller;

import com.smartevolve.dto.*;
import com.smartevolve.exception.ForbiddenException;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Platform Administration, User Governance & Benchmark Settings")
public class AdminController {

    private final AdminService adminService;

    private void checkAdmin() {
        if (!SecurityUtils.isAdmin()) {
            throw new ForbiddenException("Access Denied: Platform Administrator privileges required.");
        }
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform administrative metrics, user counts, and system status")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        checkAdmin();
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }

    @GetMapping("/users")
    @Operation(summary = "List all platform users with optional role filtering")
    public ResponseEntity<List<AdminUserDto>> getUsers(
            @RequestParam(required = false, defaultValue = "ALL") String role) {
        checkAdmin();
        return ResponseEntity.ok(adminService.getAllUsers(role));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Change a user's role (Admin privilege required)")
    public ResponseEntity<AdminUserDto> updateUserRole(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        checkAdmin();
        return ResponseEntity.ok(adminService.updateUserRole(userId, request.getRole()));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get platform runtime configuration and AI/blockchain settings")
    public ResponseEntity<PlatformSettingsDto> getSettings() {
        checkAdmin();
        return ResponseEntity.ok(adminService.getPlatformSettings());
    }

    @PutMapping("/settings")
    @Operation(summary = "Update platform runtime configuration")
    public ResponseEntity<PlatformSettingsDto> updateSettings(
            @Valid @RequestBody PlatformSettingsDto settings) {
        checkAdmin();
        return ResponseEntity.ok(adminService.updatePlatformSettings(settings));
    }

    @PostMapping("/resources")
    @Operation(summary = "Create learning module with optional prerequisite dependencies")
    public ResponseEntity<com.smartevolve.entity.LearningResource> createLearningResource(
            @Valid @RequestBody CreateLearningResourceRequest request) {
        checkAdmin();
        return ResponseEntity.ok(adminService.createLearningResource(request));
    }

    @PostMapping("/assessments")
    @Operation(summary = "Create skill assessment and question benchmark pool")
    public ResponseEntity<com.smartevolve.entity.Assessment> createAssessment(
            @Valid @RequestBody CreateAssessmentRequest request) {
        checkAdmin();
        return ResponseEntity.ok(adminService.createAssessment(request));
    }

    @GetMapping("/roadmaps/validate-cycles")
    @Operation(summary = "Validate curriculum prerequisite DAG cycles using Kahn's algorithm")
    public ResponseEntity<ValidateDagResponse> validateCurriculumCycles() {
        checkAdmin();
        return ResponseEntity.ok(adminService.validatePrerequisiteDagCycles());
    }
}
