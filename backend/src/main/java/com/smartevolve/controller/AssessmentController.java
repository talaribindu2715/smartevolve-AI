package com.smartevolve.controller;

import com.smartevolve.dto.AssessmentDto;
import com.smartevolve.dto.AssessmentResultDto;
import com.smartevolve.dto.SubmitAssessmentRequest;
import com.smartevolve.dto.CourseQuizSubmissionRequest;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.AssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@Tag(name = "Assessments", description = "Quizzes, Evaluations & Adaptive Scoring")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping
    @Operation(summary = "Get all available assessments and quizzes")
    public ResponseEntity<List<AssessmentDto>> getAssessments() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(assessmentService.getAssessments(studentId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assessment questions for taking quiz (correct answers omitted for security)")
    public ResponseEntity<AssessmentDto> getAssessmentQuestions(@PathVariable UUID id) {
        return ResponseEntity.ok(assessmentService.getAssessmentWithQuestions(id));
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit quiz responses, calculate score, evolve skill proficiency, and return review")
    public ResponseEntity<AssessmentResultDto> submitAssessment(@Valid @RequestBody SubmitAssessmentRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(assessmentService.submitAssessment(studentId, request));
    }

    @PostMapping("/course-quiz/submit")
    @Operation(summary = "Submit course or video quiz marks and persist results in database")
    public ResponseEntity<AssessmentResultDto> submitCourseQuiz(
            @Valid @RequestBody CourseQuizSubmissionRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(assessmentService.submitCourseQuizResult(studentId, request));
    }
}
