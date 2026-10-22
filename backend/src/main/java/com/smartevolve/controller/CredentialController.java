package com.smartevolve.controller;

import com.smartevolve.dto.CredentialDto;
import com.smartevolve.dto.VerifyCredentialResponse;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.CredentialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/credentials")
@RequiredArgsConstructor
@Tag(name = "Credentials", description = "Blockchain-Backed Credential Verification")
public class CredentialController {

    private final CredentialService credentialService;

    @GetMapping
    @Operation(summary = "Get all blockchain credentials issued to authenticated student")
    public ResponseEntity<List<CredentialDto>> getCredentials() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(credentialService.getStudentCredentials(studentId));
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "Verify credential on-chain against the Ethereum smart contract")
    public ResponseEntity<VerifyCredentialResponse> verifyCredential(@PathVariable UUID id) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(credentialService.verifyCredentialOnChain(studentId, id));
    }
}
