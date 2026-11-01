package com.smartevolve.controller;

import com.smartevolve.dto.*;
import com.smartevolve.exception.ForbiddenException;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.security.UserRole;
import com.smartevolve.service.CredentialService;
import com.smartevolve.service.RecruiterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
@Tag(name = "Recruiter", description = "Recruiter Talent Discovery & Certificate Verification")
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final CredentialService credentialService;

    private void checkRecruiterOrAdmin() {
        UserRole role = SecurityUtils.getCurrentUserRole();
        if (role != UserRole.RECRUITER && role != UserRole.ADMIN) {
            throw new ForbiddenException("Access Denied: Recruiter or Employer credentials required.");
        }
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get recruiter talent pipeline and shared candidate statistics")
    public ResponseEntity<RecruiterDashboardDto> getDashboard() {
        checkRecruiterOrAdmin();
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(recruiterService.getRecruiterDashboard(recruiterId));
    }

    @GetMapping("/candidates")
    @Operation(summary = "List only candidates who have explicitly shared their profiles with this recruiter")
    public ResponseEntity<List<CandidateSummaryDto>> getCandidates() {
        checkRecruiterOrAdmin();
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(recruiterService.getSharedCandidates(recruiterId));
    }

    @GetMapping("/candidates/{studentId}")
    @Operation(summary = "View comprehensive candidate dossier and verified blockchain credentials")
    public ResponseEntity<CandidateDossierDto> getCandidateDossier(@PathVariable UUID studentId) {
        checkRecruiterOrAdmin();
        UUID recruiterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(recruiterService.getCandidateDossier(recruiterId, studentId));
    }

    @PostMapping("/verify-certificate/{credentialId}")
    @Operation(summary = "Verify student credential cryptographic hash on the blockchain ledger")
    public ResponseEntity<VerifyCredentialResponse> verifyCertificate(@PathVariable UUID credentialId) {
        checkRecruiterOrAdmin();
        return ResponseEntity.ok(credentialService.getPublicVerification(credentialId));
    }
}
