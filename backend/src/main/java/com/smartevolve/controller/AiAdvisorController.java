package com.smartevolve.controller;

import com.smartevolve.ai.GeminiAiService;
import com.smartevolve.dto.AiAdvisorDto;
import com.smartevolve.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Advisor Controller", description = "Google Gemini & Adaptive AI powered skill analysis, career mentoring, and recommendations")
public class AiAdvisorController {

    private final GeminiAiService geminiAiService;

    @GetMapping("/health")
    @Operation(summary = "Check Google Gemini AI connection and health status")
    public ResponseEntity<java.util.Map<String, Object>> getAiHealth() {
        try {
            return ResponseEntity.ok(geminiAiService.checkGeminiHealth());
        } catch (Exception ex) {
            log.warn("getAiHealth notice: {}", ex.getMessage());
            java.util.Map<String, Object> fallback = new java.util.HashMap<>();
            fallback.put("status", "ERROR");
            fallback.put("working", false);
            fallback.put("message", "Service notice: " + ex.getMessage());
            return ResponseEntity.ok(fallback);
        }
    }

    @GetMapping("/skill-analysis")
    @Operation(summary = "Perform deep AI skill analysis", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AiAdvisorDto.SkillAnalysisResponse> getSkillAnalysis() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(geminiAiService.analyzeStudentSkills(studentId));
    }

    @GetMapping("/career-guidance/{careerId}")
    @Operation(summary = "Generate tailored career guidance & project recommendations", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AiAdvisorDto.CareerGuidanceResponse> getCareerGuidance(
            @PathVariable UUID careerId) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(geminiAiService.generateCareerGuidance(studentId, careerId));
    }

    @PostMapping("/chat")
    @Operation(summary = "Interactive AI Career Mentor chat session", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<AiAdvisorDto.MentorChatResponse> chatWithMentor(
            @RequestBody(required = false) AiAdvisorDto.MentorChatRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        String message = (request != null && request.getMessage() != null) ? request.getMessage() : "hi";
        String context = (request != null && request.getCurrentCareerContext() != null) ? request.getCurrentCareerContext() : "Software Engineering";
        String customKey = request != null ? request.getCustomApiKey() : null;
        String provider = request != null ? request.getProvider() : null;

        try {
            return ResponseEntity.ok(geminiAiService.chatWithMentor(
                    studentId,
                    message,
                    context,
                    customKey,
                    provider
            ));
        } catch (Exception ex) {
            log.error("AI mentor chat error (falling back gracefully): ", ex);
            return ResponseEntity.ok(geminiAiService.chatWithMentorFallback(studentId, message, context));
        }
    }
}
