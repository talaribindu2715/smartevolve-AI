package com.smartevolve.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        private String email;

        private String purpose; // "SIGNUP" or "FORGOT_PASSWORD"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        private String email;

        @NotBlank(message = "OTP code is required")
        @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
        private String otp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        private String email;

        @NotBlank(message = "Reset token or OTP is required")
        private String token;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String newPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String email;
        private Integer expiresInMinutes;
        private String resetToken;
        private String debugOtp;
    }
}

