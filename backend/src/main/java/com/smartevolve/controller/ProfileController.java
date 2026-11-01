package com.smartevolve.controller;

import com.smartevolve.dto.*;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.ProfileService;
import com.smartevolve.service.RecruiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Student Profile Management & Recruiter Access Sharing")
public class ProfileController {

    private final ProfileService profileService;
    private final RecruiterService recruiterService;

    @GetMapping("/me")
    @Operation(summary = "Get authenticated user profile and assigned role")
    public ResponseEntity<ProfileDto> getMyProfile() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getProfileDto(studentId));
    }

    @PutMapping("/me")
    @Operation(summary = "Update authenticated profile (Role changes restricted to Admins)")
    public ResponseEntity<ProfileDto> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.updateProfile(studentId, request));
    }

    @GetMapping("/shares")
    @Operation(summary = "View recruiters with whom student has shared their profile")
    public ResponseEntity<List<ProfileShareDto>> getMyShares() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(recruiterService.getStudentShares(studentId));
    }

    @PostMapping("/shares")
    @Operation(summary = "Explicitly grant a recruiter access to student dossier & verified credentials")
    public ResponseEntity<ProfileShareDto> shareProfile(@Valid @RequestBody ShareProfileRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(recruiterService.shareProfileWithRecruiter(studentId, request.getRecruiterId(), request.getNotes()));
    }

    @GetMapping("/recruiters")
    @Operation(summary = "List verified recruiters eligible for candidate profile sharing")
    public ResponseEntity<List<AdminUserDto>> getAvailableRecruiters() {
        return ResponseEntity.ok(recruiterService.getAvailableRecruiters());
    }
}
