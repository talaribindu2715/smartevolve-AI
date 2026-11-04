package com.smartevolve.controller;

import com.smartevolve.ai.GeminiAiService;
import com.smartevolve.dto.AiAdvisorDto;
import com.smartevolve.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Advisor Controller", description = "Google Gemini & Adaptive AI powered skill analysis, career mentoring, and recommendations")
public class AiAdvisorController {

    private final GeminiAiService geminiAiService;

    @GetMapping("/health")
    @Operation(summary = "Check Google Gemini AI connection and health status")
    public ResponseEntity<java.util.Map<String, Object>> getAiHealth() {
        return ResponseEntity.ok(geminiAiService.checkGeminiHealth());
    }

    @GetMapping("/skill-analysis")
    @Operation(summary = "Perform deep AI skill analysis", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AiAdvisorDto.SkillAnalysisResponse> getSkillAnalysis(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID studentId = principal != null ? principal.getId() : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.ok(geminiAiService.analyzeStudentSkills(studentId));
    }

    @GetMapping("/career-guidance/{careerId}")
    @Operation(summary = "Generate tailored career guidance & project recommendations", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AiAdvisorDto.CareerGuidanceResponse> getCareerGuidance(
            @PathVariable UUID careerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID studentId = principal != null ? principal.getId() : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.ok(geminiAiService.generateCareerGuidance(studentId, careerId));
    }

    @PostMapping("/chat")
    @Operation(summary = "Interactive AI Career Mentor chat session", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AiAdvisorDto.MentorChatResponse> chatWithMentor(
            @RequestBody AiAdvisorDto.MentorChatRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID studentId = principal != null ? principal.getId() : UUID.fromString("00000000-0000-0000-0000-000000000001");
        return ResponseEntity.ok(geminiAiService.chatWithMentor(studentId, request.getMessage(), request.getCurrentCareerContext()));
    }
}
