package com.smartevolve.service;

import com.smartevolve.ai.ProficiencyCalculator;
import com.smartevolve.dto.AssessmentDto;
import com.smartevolve.dto.AssessmentResultDto;
import com.smartevolve.dto.QuestionDto;
import com.smartevolve.dto.SubmitAssessmentRequest;
import com.smartevolve.dto.CourseQuizSubmissionRequest;
import com.smartevolve.entity.*;
import com.smartevolve.exception.BadRequestException;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentResponseRepository responseRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillEvolutionHistoryRepository evolutionHistoryRepository;
    private final ProfileRepository profileRepository;
    private final ProficiencyCalculator proficiencyCalculator;
    private final CredentialService credentialService;
    private final RoadmapService roadmapService;
    private final SkillRepository skillRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository questionRepository,
            AssessmentAttemptRepository attemptRepository,
            AssessmentResponseRepository responseRepository,
            StudentSkillRepository studentSkillRepository,
            SkillEvolutionHistoryRepository evolutionHistoryRepository,
            ProfileRepository profileRepository,
            ProficiencyCalculator proficiencyCalculator,
            @Lazy CredentialService credentialService,
            @Lazy RoadmapService roadmapService,
            SkillRepository skillRepository) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.responseRepository = responseRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.evolutionHistoryRepository = evolutionHistoryRepository;
        this.profileRepository = profileRepository;
        this.proficiencyCalculator = proficiencyCalculator;
        this.credentialService = credentialService;
        this.roadmapService = roadmapService;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<AssessmentDto> getAssessments(UUID studentId) {
        List<Assessment> assessments = assessmentRepository.findByActiveTrue();
        List<AssessmentAttempt> attempts = attemptRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);

        Map<UUID, List<AssessmentAttempt>> attemptMap = attempts.stream()
                .collect(Collectors.groupingBy(a -> a.getAssessment().getId()));

        return assessments.stream().map(a -> {
            List<AssessmentAttempt> myAttempts = attemptMap.getOrDefault(a.getId(), Collections.emptyList());
            BigDecimal latestPct = myAttempts.isEmpty() ? null : myAttempts.get(0).getPercentage();
            int count = (int) questionRepository.findByAssessmentIdOrderByOrderIndexAsc(a.getId()).size();

            return AssessmentDto.builder()
                    .id(a.getId())
                    .title(a.getTitle())
                    .skillId(a.getSkill().getId())
                    .skillName(a.getSkill().getName())
                    .difficulty(a.getDifficulty())
                    .assessmentType(a.getAssessmentType())
                    .totalQuestions(count)
                    .latestScorePercentage(latestPct)
                    .totalAttempts(myAttempts.size())
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AssessmentDto getAssessmentWithQuestions(UUID assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + assessmentId));

        List<AssessmentQuestion> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(assessmentId);

        // Security requirement: Exclude correctAnswer from QuestionDto before submission!
        List<QuestionDto> questionDtos = questions.stream().map(q ->
                QuestionDto.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionType(q.getQuestionType())
                        .options(q.getOptions())
                        .marks(q.getMarks())
                        .orderIndex(q.getOrderIndex())
                        .build()
        ).collect(Collectors.toList());

        return AssessmentDto.builder()
                .id(assessment.getId())
                .title(assessment.getTitle())
                .skillId(assessment.getSkill().getId())
                .skillName(assessment.getSkill().getName())
                .difficulty(assessment.getDifficulty())
                .assessmentType(assessment.getAssessmentType())
                .totalQuestions(questionDtos.size())
                .questions(questionDtos)
                .build();
    }

    @Transactional
    public AssessmentResultDto submitAssessment(UUID studentId, SubmitAssessmentRequest request) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        Assessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + request.getAssessmentId()));

        List<AssessmentQuestion> questions = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(assessment.getId());
        if (questions.isEmpty()) {
            throw new BadRequestException("Assessment has no questions configured.");
        }

        Map<UUID, String> responseMap = request.getResponses().stream()
                .collect(Collectors.toMap(SubmitAssessmentRequest.QuestionResponseItem::getQuestionId,
                        SubmitAssessmentRequest.QuestionResponseItem::getSubmittedAnswer, (a, b) -> a));

        int attemptNumber = (int) attemptRepository.countByStudentIdAndAssessmentId(studentId, assessment.getId()) + 1;

        BigDecimal totalScore = BigDecimal.ZERO;
        BigDecimal maxScore = BigDecimal.ZERO;

        List<AssessmentResultDto.QuestionReviewItem> reviewItems = new ArrayList<>();
        List<AssessmentResponse> savedResponses = new ArrayList<>();

        for (AssessmentQuestion q : questions) {
            BigDecimal questionMarks = BigDecimal.valueOf(q.getMarks());
            maxScore = maxScore.add(questionMarks);

            String submitted = responseMap.getOrDefault(q.getId(), "").trim();
            boolean isCorrect = q.getCorrectAnswer().equalsIgnoreCase(submitted);
            BigDecimal awarded = isCorrect ? questionMarks : BigDecimal.ZERO;
            totalScore = totalScore.add(awarded);

            reviewItems.add(AssessmentResultDto.QuestionReviewItem.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .submittedAnswer(submitted)
                    .correctAnswer(q.getCorrectAnswer())
                    .isCorrect(isCorrect)
                    .awardedMarks(awarded)
                    .explanation(q.getExplanation())
                    .build());
        }

        BigDecimal percentage = maxScore.compareTo(BigDecimal.ZERO) > 0
                ? totalScore.divide(maxScore, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100.0")).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Save Attempt
        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .student(profile)
                .assessment(assessment)
                .score(totalScore)
                .maximumScore(maxScore)
                .percentage(percentage)
                .attemptNumber(attemptNumber)
                .timeTakenSeconds(request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 0)
                .build();
        AssessmentAttempt savedAttempt = attemptRepository.save(attempt);

        // Save Individual Responses
        for (AssessmentQuestion q : questions) {
            String submitted = responseMap.getOrDefault(q.getId(), "").trim();
            boolean isCorrect = q.getCorrectAnswer().equalsIgnoreCase(submitted);
            BigDecimal awarded = isCorrect ? BigDecimal.valueOf(q.getMarks()) : BigDecimal.ZERO;

            AssessmentResponse resp = AssessmentResponse.builder()
                    .attempt(savedAttempt)
                    .question(q)
                    .submittedAnswer(submitted)
                    .awardedMarks(awarded)
                    .build();
            responseRepository.save(resp);
        }

        // ==============================================================================
        // ADAPTIVE AI ENGINE: UPDATE STUDENT SKILL PROFILE
        // ==============================================================================
        Skill skill = assessment.getSkill();
        StudentSkill studentSkill = studentSkillRepository
                .findByStudentIdAndSkillId(studentId, skill.getId())
                .orElse(StudentSkill.builder()
                        .student(profile)
                        .skill(skill)
                        .proficiency(BigDecimal.ZERO)
                        .confidence(new BigDecimal("0.40"))
                        .evidenceType("ASSESSMENT")
                        .build());

        BigDecimal previousProficiency = studentSkill.getProficiency();
        BigDecimal currentConfidence = studentSkill.getConfidence();

        var updateResult = proficiencyCalculator.calculateAssessmentImpact(
                previousProficiency,
                currentConfidence,
                percentage,
                assessment.getDifficulty(),
                attemptNumber
        );

        studentSkill.setProficiency(updateResult.getNewProficiency());
        studentSkill.setConfidence(updateResult.getConfidence());
        studentSkill.setEvidenceType("ASSESSMENT");
        studentSkill.setLastAssessedAt(OffsetDateTime.now());
        studentSkillRepository.save(studentSkill);

        // Record Evolution History Event
        SkillEvolutionHistory history = SkillEvolutionHistory.builder()
                .student(profile)
                .skill(skill)
                .previousProficiency(previousProficiency)
                .newProficiency(updateResult.getNewProficiency())
                .changeReason(updateResult.getChangeReason())
                .evidenceType("ASSESSMENT")
                .evidenceReference(assessment.getTitle() + " (Attempt #" + attemptNumber + ")")
                .profileVersion(attemptNumber)
                .build();
        evolutionHistoryRepository.save(history);

        log.info("Student {} completed assessment '{}': score={}/{} ({}%), proficiency updated from {} to {}",
                studentId, assessment.getTitle(), totalScore, maxScore, percentage, previousProficiency, updateResult.getNewProficiency());

        // Check if student earned a blockchain credential milestone (score >= 80% on intermediate/advanced)
        if (percentage.compareTo(new BigDecimal("80.0")) >= 0) {
            try {
                String certTitle = skill.getName() + " Verified Proficiency Mastery";
                credentialService.issueMilestoneCredential(studentId, skill.getId(), certTitle);
            } catch (Exception ex) {
                log.warn("Failed to auto-issue credential on assessment completion: {}", ex.getMessage());
            }
        }

        return AssessmentResultDto.builder()
                .attemptId(savedAttempt.getId())
                .assessmentId(assessment.getId())
                .assessmentTitle(assessment.getTitle())
                .skillId(skill.getId())
                .skillName(skill.getName())
                .score(totalScore)
                .maximumScore(maxScore)
                .percentage(percentage)
                .attemptNumber(attemptNumber)
                .timeTakenSeconds(savedAttempt.getTimeTakenSeconds())
                .submittedAt(savedAttempt.getSubmittedAt())
                .previousProficiency(previousProficiency)
                .newProficiency(updateResult.getNewProficiency())
                .proficiencyDelta(updateResult.getDelta())
                .updatedConfidence(updateResult.getConfidence())
                .evolutionReason(updateResult.getChangeReason())
                .questionReviews(reviewItems)
                .build();
    }

    @Transactional
    public AssessmentResultDto submitCourseQuizResult(UUID studentId, CourseQuizSubmissionRequest request) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        String targetSkill = (request.getSkillName() != null && !request.getSkillName().isBlank())
                ? request.getSkillName().trim()
                : "Computer Science";

        Skill skill = skillRepository.findByNameIgnoreCase(targetSkill)
                .orElseGet(() -> skillRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No skills configured in database")));

        String title = (request.getCourseTitle() != null && !request.getCourseTitle().isBlank())
                ? request.getCourseTitle().trim() + " Mastery Quiz"
                : skill.getName() + " Quiz";

        Assessment assessment = assessmentRepository.findBySkillIdAndActiveTrue(skill.getId()).stream()
                .filter(a -> a.getTitle().equalsIgnoreCase(title))
                .findFirst()
                .orElseGet(() -> assessmentRepository.save(Assessment.builder()
                        .title(title)
                        .skill(skill)
                        .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "INTERMEDIATE")
                        .assessmentType("QUIZ")
                        .active(true)
                        .build()));

        int attemptNumber = (int) attemptRepository.countByStudentIdAndAssessmentId(studentId, assessment.getId()) + 1;

        int scoreInt = request.getScore() != null ? Math.max(0, request.getScore()) : 0;
        int totalInt = request.getTotalQuestions() != null ? Math.max(1, request.getTotalQuestions()) : 10;

        BigDecimal totalScore = BigDecimal.valueOf(scoreInt);
        BigDecimal maxScore = BigDecimal.valueOf(totalInt);
        BigDecimal percentage = totalScore.divide(maxScore, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100.0")).setScale(1, RoundingMode.HALF_UP);

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .student(profile)
                .assessment(assessment)
                .score(totalScore)
                .maximumScore(maxScore)
                .percentage(percentage)
                .attemptNumber(attemptNumber)
                .timeTakenSeconds(request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 60)
                .build();
        AssessmentAttempt savedAttempt = attemptRepository.save(attempt);

        // Adaptive AI proficiency update
        StudentSkill studentSkill = studentSkillRepository
                .findByStudentIdAndSkillId(studentId, skill.getId())
                .orElse(StudentSkill.builder()
                        .student(profile)
                        .skill(skill)
                        .proficiency(BigDecimal.ZERO)
                        .confidence(new BigDecimal("0.40"))
                        .evidenceType("QUIZ")
                        .build());

        BigDecimal previousProficiency = studentSkill.getProficiency();
        BigDecimal currentConfidence = studentSkill.getConfidence();

        var updateResult = proficiencyCalculator.calculateAssessmentImpact(
                previousProficiency,
                currentConfidence,
                percentage,
                assessment.getDifficulty(),
                attemptNumber
        );

        studentSkill.setProficiency(updateResult.getNewProficiency());
        studentSkill.setConfidence(updateResult.getConfidence());
        studentSkill.setEvidenceType("QUIZ");
        studentSkill.setLastAssessedAt(OffsetDateTime.now());
        studentSkillRepository.save(studentSkill);

        String platformName = request.getPlatform() != null ? request.getPlatform() : "SMARTEVOLVE";
        evolutionHistoryRepository.save(SkillEvolutionHistory.builder()
                .student(profile)
                .skill(skill)
                .previousProficiency(previousProficiency)
                .newProficiency(updateResult.getNewProficiency())
                .profileVersion(attemptNumber)
                .changeReason(String.format("Completed %s quiz on %s: Score %d/%d (%.1f%%)",
                        platformName, title, scoreInt, totalInt, percentage.doubleValue()))
                .evidenceType("QUIZ")
                .evidenceReference(savedAttempt.getId().toString())
                .build());

        if (percentage.compareTo(new BigDecimal("60.0")) >= 0) {
            try {
                String certTitle = (request.getCourseTitle() != null && !request.getCourseTitle().isBlank())
                        ? request.getCourseTitle().trim()
                        : skill.getName() + " Certification";
                credentialService.issueMilestoneCredential(studentId, skill.getId(), certTitle);
            } catch (Exception ex) {
                log.warn("Could not auto-issue credential on quiz pass: {}", ex.getMessage());
            }
        }

        log.info("Persistent Quiz Result Saved: Student {} scored {}/{} in {}",
                studentId, scoreInt, totalInt, title);

        return AssessmentResultDto.builder()
                .attemptId(savedAttempt.getId())
                .assessmentId(assessment.getId())
                .assessmentTitle(assessment.getTitle())
                .skillId(skill.getId())
                .skillName(skill.getName())
                .score(totalScore)
                .maximumScore(maxScore)
                .percentage(percentage)
                .attemptNumber(attemptNumber)
                .timeTakenSeconds(savedAttempt.getTimeTakenSeconds())
                .submittedAt(savedAttempt.getSubmittedAt())
                .previousProficiency(previousProficiency)
                .newProficiency(updateResult.getNewProficiency())
                .proficiencyDelta(updateResult.getDelta())
                .updatedConfidence(updateResult.getConfidence())
                .evolutionReason(updateResult.getChangeReason())
                .build();
    }
}
