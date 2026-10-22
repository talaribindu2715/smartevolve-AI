package com.smartevolve.controller;

import com.smartevolve.dto.ProfileDto;
import com.smartevolve.dto.UpdateProfileRequest;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Student Profile Management")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Get authenticated student profile")
    public ResponseEntity<ProfileDto> getMyProfile() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getProfileDto(studentId));
    }

    @PutMapping("/me")
    @Operation(summary = "Update authenticated student profile and onboarding status")
    public ResponseEntity<ProfileDto> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.updateProfile(studentId, request));
    }
}
