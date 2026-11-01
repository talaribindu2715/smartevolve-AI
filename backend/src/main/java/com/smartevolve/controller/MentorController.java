package com.smartevolve.controller;

import com.smartevolve.dto.*;
import com.smartevolve.exception.ForbiddenException;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.security.UserRole;
import com.smartevolve.service.MentorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
@Tag(name = "Mentor", description = "Mentor & Faculty Student Oversight Endpoints")
public class MentorController {

    private final MentorService mentorService;

    private void checkMentorOrAdmin() {
        UserRole role = SecurityUtils.getCurrentUserRole();
        if (role != UserRole.MENTOR && role != UserRole.ADMIN) {
            throw new ForbiddenException("Access Denied: Mentor or Faculty privileges required.");
        }
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get mentor cohort overview and assigned students list")
    public ResponseEntity<MentorDashboardDto> getDashboard() {
        checkMentorOrAdmin();
        UUID mentorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(mentorService.getMentorDashboard(mentorId));
    }

    @GetMapping("/students")
    @Operation(summary = "List all students assigned to the authenticated mentor")
    public ResponseEntity<List<AssignedStudentDto>> getAssignedStudents() {
        checkMentorOrAdmin();
        UUID mentorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(mentorService.getAssignedStudents(mentorId));
    }

    @GetMapping("/students/{studentId}")
    @Operation(summary = "View detailed learning data and roadmap for an assigned student")
    public ResponseEntity<CandidateDossierDto> getStudentDetail(@PathVariable UUID studentId) {
        checkMentorOrAdmin();
        UUID mentorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(mentorService.getStudentDossierForMentor(mentorId, studentId));
    }

    @PostMapping("/students/{studentId}/feedback")
    @Operation(summary = "Submit mentor feedback and personalized guidance for an assigned student")
    public ResponseEntity<AssignedStudentDto> submitFeedback(
            @PathVariable UUID studentId,
            @Valid @RequestBody MentorFeedbackRequest request) {
        checkMentorOrAdmin();
        UUID mentorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(mentorService.addMentorFeedback(mentorId, studentId, request));
    }

    @PostMapping("/resources")
    @Operation(summary = "Assign a learning module/resource to an assigned student")
    public ResponseEntity<com.smartevolve.entity.Recommendation> assignResource(
            @Valid @RequestBody MentorAssignResourceRequest request) {
        checkMentorOrAdmin();
        UUID mentorId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(mentorService.assignResourceToStudent(mentorId, request));
    }
}
