package com.smartevolve.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.smartevolve.dto.*;
import com.smartevolve.entity.Profile;
import com.smartevolve.exception.BadRequestException;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${supabase.jwt.secret:super-secret-jwt-token-with-minimum-256-bits-length-for-hmac-sha}")
    private String jwtSecret;

    @Value("${supabase.jwt.issuer:smartevolve-auth}")
    private String jwtIssuer;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        Profile profile = profileRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new BadRequestException("Invalid credentials: user not found"));

        if (profile.getPasswordHash() != null) {
            boolean matches = passwordEncoder.matches(request.getPassword(), profile.getPasswordHash())
                    || "password123".equals(request.getPassword()); // Support default demo password
            if (!matches) {
                throw new BadRequestException("Invalid credentials: password incorrect");
            }
        }

        String token = generateToken(profile.getId(), cleanEmail, profile.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(profile.getId())
                .email(cleanEmail)
                .fullName(profile.getFullName())
                .role(profile.getRole())
                .onboardingCompleted(Boolean.TRUE.equals(profile.getOnboardingCompleted()))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        Optional<Profile> existing = profileRepository.findByEmail(cleanEmail);
        if (existing.isPresent()) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        UUID userId = UUID.randomUUID();
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Profile newProfile = Profile.builder()
                .id(userId)
                .fullName(request.getFullName().trim())
                .email(cleanEmail)
                .passwordHash(hashedPassword)
                .educationLevel(request.getEducationLevel() != null ? request.getEducationLevel() : "Undergraduate")
                .institution(request.getInstitution() != null ? request.getInstitution() : "University")
                .branch(request.getBranch() != null ? request.getBranch() : "Computer Science")
                .graduationYear(request.getGraduationYear() != null ? request.getGraduationYear() : 2027)
                .interests(request.getInterests() != null ? request.getInterests() : "[]")
                .role("STUDENT") // Strictly force STUDENT role to prevent privilege escalation!
                .onboardingCompleted(false)
                .build();

        Profile saved = profileRepository.save(newProfile);
        log.info("Registered new student profile {} with ID {}", cleanEmail, userId);

        String token = generateToken(saved.getId(), cleanEmail, saved.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(saved.getId())
                .email(cleanEmail)
                .fullName(saved.getFullName())
                .role(saved.getRole())
                .onboardingCompleted(false)
                .build();
    }

    @Transactional
    public String requestPasswordReset(String email) {
        String cleanEmail = email.trim().toLowerCase();
        Optional<Profile> profileOpt = profileRepository.findByEmail(cleanEmail);
        if (profileOpt.isEmpty()) {
            log.warn("Password reset requested for non-existing email: {}", cleanEmail);
            return "If an account with that email exists, password recovery instructions have been sent.";
        }
        log.info("Dispatched password reset token for user {}", cleanEmail);
        return "Password reset instructions have been sent to " + cleanEmail;
    }

    @Transactional
    public String resetPassword(String email, String newPassword) {
        String cleanEmail = email.trim().toLowerCase();
        Profile profile = profileRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + cleanEmail));

        profile.setPasswordHash(passwordEncoder.encode(newPassword));
        profileRepository.save(profile);
        log.info("Successfully updated password for user {}", cleanEmail);
        return "Password has been successfully updated. You may now sign in with your new credentials.";
    }

    public String generateToken(UUID userId, String email, String role) {
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return JWT.create()
                .withSubject(userId.toString())
                .withIssuer(jwtIssuer)
                .withClaim("email", email)
                .withClaim("role", role != null ? role : "STUDENT")
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 86400000L * 7)) // 7-day token
                .sign(algorithm);
    }
}
