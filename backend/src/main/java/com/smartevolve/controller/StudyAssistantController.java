package com.smartevolve.controller;

import com.smartevolve.dto.StudyAssistantRequest;
import com.smartevolve.dto.StudyAssistantResponse;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.StudyAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/assistant")
@RequiredArgsConstructor
@Tag(name = "AI Study Assistant", description = "AI-powered personalized tutoring, quiz preparation, and topic explanations")
public class StudyAssistantController {

    private final StudyAssistantService studyAssistantService;

    @PostMapping("/ask")
    @Operation(summary = "Ask AI Study Assistant a conceptual or practical learning question")
    public ResponseEntity<StudyAssistantResponse> askAssistant(@Valid @RequestBody StudyAssistantRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(studyAssistantService.askAssistant(studentId, request));
    }

    @GetMapping("/explain/{topic}")
    @Operation(summary = "Get an instant structured explanation for a technical topic")
    public ResponseEntity<StudyAssistantResponse> explainTopic(@PathVariable String topic) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(studyAssistantService.explainTopic(studentId, topic));
    }

    @GetMapping("/quiz-prep/{skillId}")
    @Operation(summary = "Generate targeted quiz preparation notes and a practice question for a skill")
    public ResponseEntity<StudyAssistantResponse> quizPrep(@PathVariable UUID skillId) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(studyAssistantService.generateQuizPrep(studentId, skillId));
    }
}
