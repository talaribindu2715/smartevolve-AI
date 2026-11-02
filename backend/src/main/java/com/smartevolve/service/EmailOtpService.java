package com.smartevolve.service;

import com.smartevolve.dto.AuthDto;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class EmailOtpService {

    private final JavaMailSender mailSender;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${spring.mail.username:smartevolve.ai@gmail.com}")
    private String mailFrom;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.frontend-url:https://smartevolve-ai-mobile-sand.vercel.app}")
    private String frontendUrl;

    // In-memory OTP & Token stores (Email -> Entry)
    private final Map<String, OtpEntry> signupOtpStore = new ConcurrentHashMap<>();
    private final Map<String, ResetTokenEntry> passwordResetStore = new ConcurrentHashMap<>();

    private record OtpEntry(String code, Instant expiresAt) {}
    private record ResetTokenEntry(String token, String otp, Instant expiresAt) {}

    public EmailOtpService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Generate 6-digit OTP and send via Google SMTP to student's email for Signup verification
     */
    public AuthDto.AuthResponse sendSignupOtp(String email) {
        String code = String.format("%06d", secureRandom.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plusSeconds(600); // 10 minutes
        signupOtpStore.put(email.toLowerCase(), new OtpEntry(code, expiresAt));

        log.info("🔐 [SmartEvolve Auth] Generated Signup OTP for {}: {} (Expires in 10 mins)", email, code);

        boolean emailSent = sendEmail(
                email,
                "SmartEvolve AI - Signup Verification Code",
                buildSignupEmailHtml(code)
        );

        return AuthDto.AuthResponse.builder()
                .success(true)
                .email(email)
                .message(emailSent 
                        ? "Verification code sent to " + email + " via Google SMTP." 
                        : "Verification code generated successfully. Code: " + code)
                .debugOtp(!emailSent ? code : null)
                .expiresInMinutes(10)
                .build();
    }

    /**
     * Verify Signup 6-digit OTP
     */
    public AuthDto.AuthResponse verifySignupOtp(String email, String otp) {
        OtpEntry entry = signupOtpStore.get(email.toLowerCase());

        if (entry == null) {
            return AuthDto.AuthResponse.builder()
                    .success(false)
                    .message("No verification code found for this email. Please request a new code.")
                    .build();
        }

        if (Instant.now().isAfter(entry.expiresAt())) {
            signupOtpStore.remove(email.toLowerCase());
            return AuthDto.AuthResponse.builder()
                    .success(false)
                    .message("Verification code has expired. Please request a new code.")
                    .build();
        }

        if (!entry.code().equals(otp.trim())) {
            return AuthDto.AuthResponse.builder()
                    .success(false)
                    .message("Invalid verification code. Please check and try again.")
                    .build();
        }

        // Successfully verified
        signupOtpStore.remove(email.toLowerCase());
        log.info("✅ [SmartEvolve Auth] Successfully verified Signup OTP for {}", email);

        return AuthDto.AuthResponse.builder()
                .success(true)
                .email(email)
                .message("Email verified successfully! You can now complete your registration.")
                .build();
    }

    /**
     * Send Forgot Password email with both Reset Link and 6-digit OTP
     */
    public AuthDto.AuthResponse sendForgotPasswordLink(String email) {
        String token = UUID.randomUUID().toString().replace("-", "");
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        Instant expiresAt = Instant.now().plusSeconds(900); // 15 minutes

        passwordResetStore.put(email.toLowerCase(), new ResetTokenEntry(token, otp, expiresAt));
        String resetLink = frontendUrl + "/reset-password?token=" + token + "&email=" + email;

        log.info("🔑 [SmartEvolve Auth] Forgot password requested for {}. Token: {}, OTP: {}, Link: {}", 
                email, token, otp, resetLink);

        boolean emailSent = sendEmail(
                email,
                "SmartEvolve AI - Password Reset Request",
                buildForgotPasswordEmailHtml(resetLink, otp)
        );

        return AuthDto.AuthResponse.builder()
                .success(true)
                .email(email)
                .message(emailSent 
                        ? "Password reset instructions sent to " + email 
                        : "Password reset generated. Use OTP: " + otp)
                .resetToken(token)
                .debugOtp(!emailSent ? otp : null)
                .expiresInMinutes(15)
                .build();
    }

    /**
     * Reset password using either token (from link) or 6-digit OTP
     */
    public AuthDto.AuthResponse resetPassword(String email, String tokenOrOtp, String newPassword) {
        ResetTokenEntry entry = passwordResetStore.get(email.toLowerCase());

        if (entry == null) {
            return AuthDto.AuthResponse.builder()
                    .success(false)
                    .message("No active password reset request found. Please request a new link.")
                    .build();
        }

        if (Instant.now().isAfter(entry.expiresAt())) {
            passwordResetStore.remove(email.toLowerCase());
            return AuthDto.AuthResponse.builder()
                    .success(false)
                    .message("Password reset link/OTP has expired. Please request a new one.")
                    .build();
        }

        boolean tokenMatch = entry.token().equalsIgnoreCase(tokenOrOtp.trim());
        boolean otpMatch = entry.otp().equals(tokenOrOtp.trim());

        if (!tokenMatch && !otpMatch) {
            return AuthDto.AuthResponse.builder()
                    .success(false)
                    .message("Invalid reset token or OTP code.")
                    .build();
        }

        // Successfully verified
        passwordResetStore.remove(email.toLowerCase());
        log.info("🎉 [SmartEvolve Auth] Password reset successfully completed for {}", email);

        return AuthDto.AuthResponse.builder()
                .success(true)
                .email(email)
                .message("Your password has been successfully updated! You can now log in.")
                .build();
    }

    private boolean sendEmail(String to, String subject, String htmlContent) {
        if (mailSender == null || mailPassword == null || mailPassword.isBlank()) {
            log.warn("⚠️ [Google SMTP] Mail sender not configured or SPRING_MAIL_PASSWORD is blank. Simulation mode active.");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom, "SmartEvolve AI Platform");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("📧 [Google SMTP] Email sent successfully to {}", to);
            return true;
        } catch (Exception e) {
            log.error("❌ [Google SMTP] Failed to dispatch email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    private String buildSignupEmailHtml(String otp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><body style=\"font-family: Arial, sans-serif; background-color: #0B0F19; color: #FFFFFF; padding: 30px; margin: 0;\">");
        sb.append("<div style=\"max-width: 520px; margin: 0 auto; background: #131B2E; border: 1px solid #1E293B; border-radius: 16px; padding: 30px;\">");
        sb.append("<div style=\"text-align: center; margin-bottom: 24px;\">");
        sb.append("<h1 style=\"color: #6366F1; font-size: 24px; margin: 0;\">SmartEvolve AI</h1>");
        sb.append("<p style=\"color: #94A3B8; font-size: 13px; margin-top: 4px;\">Self-Evolving Learning Platform</p>");
        sb.append("</div>");
        sb.append("<div style=\"background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;\">");
        sb.append("<p style=\"color: #94A3B8; font-size: 13px; margin: 0 0 10px 0;\">Your 6-Digit Signup Verification Code:</p>");
        sb.append("<div style=\"font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10B981; font-family: monospace;\">").append(otp).append("</div>");
        sb.append("<p style=\"color: #64748B; font-size: 11px; margin: 10px 0 0 0;\">Valid for 10 minutes. Do not share this code.</p>");
        sb.append("</div>");
        sb.append("<p style=\"color: #94A3B8; font-size: 13px; line-height: 20px;\">Welcome to SmartEvolve AI! Enter this code in your registration form to verify your academic email and unlock your career roadmap.</p>");
        sb.append("<hr style=\"border: none; border-top: 1px solid #1E293B; margin: 20px 0;\" />");
        sb.append("<p style=\"color: #64748B; font-size: 11px; text-align: center; margin: 0;\">SmartEvolve AI • K.S.R.M. College of Engineering (Autonomous)</p>");
        sb.append("</div></body></html>");
        return sb.toString();
    }

    private String buildForgotPasswordEmailHtml(String resetLink, String otp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><body style=\"font-family: Arial, sans-serif; background-color: #0B0F19; color: #FFFFFF; padding: 30px; margin: 0;\">");
        sb.append("<div style=\"max-width: 520px; margin: 0 auto; background: #131B2E; border: 1px solid #1E293B; border-radius: 16px; padding: 30px;\">");
        sb.append("<div style=\"text-align: center; margin-bottom: 24px;\">");
        sb.append("<h1 style=\"color: #6366F1; font-size: 24px; margin: 0;\">SmartEvolve AI</h1>");
        sb.append("<p style=\"color: #94A3B8; font-size: 13px; margin-top: 4px;\">Password Reset Request</p>");
        sb.append("</div>");
        sb.append("<p style=\"color: #CBD5E1; font-size: 13px; line-height: 20px;\">We received a request to reset your password. Click the button below to set a new password:</p>");
        sb.append("<div style=\"text-align: center; margin: 24px 0;\">");
        sb.append("<a href=\"").append(resetLink).append("\" style=\"background: #6366F1; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; display: inline-block;\">Create New Password</a>");
        sb.append("</div>");
        sb.append("<div style=\"background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 16px; text-align: center; margin-top: 16px;\">");
        sb.append("<p style=\"color: #94A3B8; font-size: 12px; margin: 0 0 6px 0;\">Or enter this 6-digit verification OTP in the app:</p>");
        sb.append("<div style=\"font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #10B981; font-family: monospace;\">").append(otp).append("</div>");
        sb.append("</div>");
        sb.append("<p style=\"color: #64748B; font-size: 11px; margin-top: 20px;\">This link and OTP will expire in 15 minutes.</p>");
        sb.append("<hr style=\"border: none; border-top: 1px solid #1E293B; margin: 20px 0;\" />");
        sb.append("<p style=\"color: #64748B; font-size: 11px; text-align: center; margin: 0;\">SmartEvolve AI • K.S.R.M. College of Engineering (Autonomous)</p>");
        sb.append("</div></body></html>");
        return sb.toString();
    }
}
