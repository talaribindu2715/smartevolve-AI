package com.smartevolve.controller;

import com.smartevolve.dto.AuthDto;
import com.smartevolve.service.EmailOtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & OTP", description = "Email OTP Verification & Google SMTP Password Reset Flow")
public class AuthController {

    private final EmailOtpService emailOtpService;

    @PostMapping("/send-signup-otp")
    @Operation(summary = "Generate and send a 6-digit signup verification OTP via Google SMTP")
    public ResponseEntity<AuthDto.AuthResponse> sendSignupOtp(@Valid @RequestBody AuthDto.SendOtpRequest request) {
        return ResponseEntity.ok(emailOtpService.sendSignupOtp(request.getEmail()));
    }

    @PostMapping("/verify-signup-otp")
    @Operation(summary = "Verify the 6-digit signup OTP before finalizing account creation")
    public ResponseEntity<AuthDto.AuthResponse> verifySignupOtp(@Valid @RequestBody AuthDto.VerifyOtpRequest request) {
        AuthDto.AuthResponse response = emailOtpService.verifySignupOtp(request.getEmail(), request.getOtp());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send password reset email containing one-click reset link and 6-digit OTP code")
    public ResponseEntity<AuthDto.AuthResponse> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request) {
        return ResponseEntity.ok(emailOtpService.sendForgotPasswordLink(request.getEmail()));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using verification token or 6-digit OTP")
    public ResponseEntity<AuthDto.AuthResponse> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest request) {
        AuthDto.AuthResponse response = emailOtpService.resetPassword(
                request.getEmail(),
                request.getToken(),
                request.getNewPassword()
        );
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}

