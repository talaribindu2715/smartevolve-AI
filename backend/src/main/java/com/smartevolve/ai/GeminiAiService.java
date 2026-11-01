package com.smartevolve.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartevolve.dto.AiAdvisorDto;
import com.smartevolve.entity.Career;
import com.smartevolve.entity.StudentCareerPreference;
import com.smartevolve.entity.StudentSkill;
import com.smartevolve.repository.CareerRepository;
import com.smartevolve.repository.StudentCareerPreferenceRepository;
import com.smartevolve.repository.StudentSkillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GeminiAiService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String geminiBaseUrl;

    private final StudentSkillRepository studentSkillRepository;
    private final StudentCareerPreferenceRepository careerPreferenceRepository;
    private final CareerRepository careerRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiService(
            StudentSkillRepository studentSkillRepository,
            StudentCareerPreferenceRepository careerPreferenceRepository,
            CareerRepository careerRepository) {
        this.studentSkillRepository = studentSkillRepository;
        this.careerPreferenceRepository = careerPreferenceRepository;
        this.careerRepository = careerRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Executes deep cognitive skill analysis using Google Gemini API or intelligent heuristic fallback.
     */
    public AiAdvisorDto.SkillAnalysisResponse analyzeStudentSkills(UUID studentId) {
        List<StudentSkill> skills = studentSkillRepository.findByStudentId(studentId);
        Optional<StudentCareerPreference> prefOpt = careerPreferenceRepository.findFirstByStudentIdOrderByPreferenceRankAsc(studentId);
        String targetCareer = prefOpt.map(p -> p.getCareer().getName()).orElse("Engineering Generalist");

        List<String> strengths = skills.stream()
                .filter(s -> s.getProficiency().doubleValue() >= 65.0)
                .map(s -> String.format("%s (%.0f%%)", s.getSkill().getName(), s.getProficiency().doubleValue()))
                .collect(Collectors.toList());

        List<String> growthAreas = skills.stream()
                .filter(s -> s.getProficiency().doubleValue() < 65.0)
                .map(s -> String.format("%s (%.0f%%)", s.getSkill().getName(), s.getProficiency().doubleValue()))
                .collect(Collectors.toList());

        if (strengths.isEmpty()) strengths.add("Foundational Programming Concepts");
        if (growthAreas.isEmpty()) growthAreas.add("Advanced Scalable Architecture");

        String prompt = String.format(
                "You are an expert AI Career and Learning Advisor in the SmartEvolve AI system. " +
                "Analyze this engineering student's profile:\n" +
                "- Target Career: %s\n" +
                "- Current Proficiencies (Strengths): %s\n" +
                "- Growth Areas: %s\n\n" +
                "Provide:\n" +
                "1. A 2-paragraph cognitive analysis of their learning readiness.\n" +
                "2. A practical 3-step study strategy to accelerate mastery for %s.\n" +
                "Be encouraging, highly specific, and professional.",
                targetCareer, String.join(", ", strengths), String.join(", ", growthAreas), targetCareer
        );

        String geminiResponse = callGeminiApi(prompt);
        boolean isGemini = geminiResponse != null && !geminiResponse.isBlank();

        String cognitiveText = isGemini ? geminiResponse : String.format(
                "Based on the SmartEvolve Adaptive AI profile, your core strengths in %s provide a solid foundation. " +
                "Your priority for achieving career readiness in %s is closing intermediate gaps in %s.",
                strengths.get(0), targetCareer, growthAreas.get(0)
        );

        String strategyText = isGemini ? "Integrated in AI evaluation." : String.format(
                "Phase 1: Complete hands-on interactive exercises in %s (2 weeks).\n" +
                "Phase 2: Build a production-grade portfolio project linking your skills.\n" +
                "Phase 3: Take milestone skill diagnostic quizzes to trigger on-chain credential certification.",
                growthAreas.get(0)
        );

        return AiAdvisorDto.SkillAnalysisResponse.builder()
                .studentHeadline("Adaptive Engineering Scholar")
                .targetCareer(targetCareer)
                .topStrengths(strengths)
                .criticalGrowthAreas(growthAreas)
                .cognitiveAnalysis(cognitiveText)
                .personalizedStudyStrategy(strategyText)
                .isGeminiPowered(isGemini)
                .build();
    }

    /**
     * Generates rich career guidance and resume advice using Google Gemini API.
     */
    public AiAdvisorDto.CareerGuidanceResponse generateCareerGuidance(UUID studentId, UUID careerId) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new IllegalArgumentException("Career not found"));

        List<StudentSkill> skills = studentSkillRepository.findByStudentId(studentId);

        String prompt = String.format(
                "As an enterprise technical recruiter and career mentor, provide guidance for a student targeting: %s (%s category).\n" +
                "Student currently has logged proficiencies in: %s.\n\n" +
                "Please output:\n" +
                "- Readiness assessment\n" +
                "- 3 high-impact portfolio projects they should build to prove competency\n" +
                "- 3 crucial technical interview questions and preparation tips for this role\n" +
                "- An estimated study timeline in weeks to achieve job-ready proficiency",
                career.getName(), career.getCategory(),
                skills.stream().map(s -> s.getSkill().getName() + " (" + s.getProficiency() + "%)").collect(Collectors.joining(", "))
        );

        String geminiResponse = callGeminiApi(prompt);
        boolean isGemini = geminiResponse != null && !geminiResponse.isBlank();

        List<String> projectIdeas = Arrays.asList(
                "Build a Real-Time Analytics Pipeline with Automated ETL",
                "Deploy an End-to-End Microservice Application with CI/CD & Docker",
                "Construct a Tamper-Evident Verification Service with Smart Contracts"
        );

        List<String> interviewTips = Arrays.asList(
                "Practice explaining DAG topological sorting and Kahn's algorithm for dependency management.",
                "Review SQL query optimization: indexes, partition strategies, and window functions.",
                "Be ready to articulate system trade-offs: latency vs throughput in high-concurrency architectures."
        );

        List<String> milestones = Arrays.asList(
                "Week 1-3: Core Foundational Mastery & Interactive Quizzes",
                "Week 4-6: Intermediate Module Completion & YouTube Video Deep Dives",
                "Week 7-9: Capstone Portfolio Development & Blockchain Certification",
                "Week 10+: Mock Interviews & Technical Assessment Drills"
        );

        return AiAdvisorDto.CareerGuidanceResponse.builder()
                .careerName(career.getName())
                .readinessAssessment(isGemini ? geminiResponse : "High Potential. Completing target milestones will accelerate full qualification.")
                .estimatedWeeksToReadiness(8)
                .prioritizedLearningMilestones(milestones)
                .portfolioProjectIdeas(projectIdeas)
                .interviewPreparationAdvice(interviewTips)
                .motivationalSummary(String.format("You are on track to master the required competencies for %s! Stay consistent with daily roadmap modules.", career.getName()))
                .isGeminiPowered(isGemini)
                .build();
    }

    /**
     * Interactive AI Career Mentor chat dialog.
     */
    public AiAdvisorDto.MentorChatResponse chatWithMentor(UUID studentId, String userMessage, String careerContext) {
        String prompt = String.format(
                "You are SmartEvolve AI's intelligent Career Mentor. A student asks: \"%s\"\n" +
                "Context: Target Career = %s.\n" +
                "Provide a direct, inspiring, and technically sound response with actionable next steps.",
                userMessage, (careerContext != null ? careerContext : "Software Engineering")
        );

        String geminiResponse = callGeminiApi(prompt);
        boolean isGemini = geminiResponse != null && !geminiResponse.isBlank();

        String reply = isGemini ? geminiResponse : String.format(
                "That is a great question regarding %s! In SmartEvolve AI, we recommend focusing on conceptual understanding first, followed immediately by code practice. " +
                "Check your active Roadmap in the Learn tab to unlock the next milestone, and complete the diagnostic quiz to calibrate your proficiency.",
                (careerContext != null ? careerContext : "your learning path")
        );

        List<String> followUps = Arrays.asList(
                "What specific projects should I build for my portfolio?",
                "How do I prepare for technical interviews in this field?",
                "Which skill gap should I prioritize this week?"
        );

        return AiAdvisorDto.MentorChatResponse.builder()
                .reply(reply)
                .followUpQuestions(followUps)
                .isGeminiPowered(isGemini)
                .build();
    }

    /**
     * Direct HTTP call to Google Gemini REST API.
     */
    private String callGeminiApi(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || "demo-key".equalsIgnoreCase(geminiApiKey)) {
            log.debug("Gemini API key is not configured; using high-grade heuristic advisor fallback.");
            return null;
        }

        try {
            String url = String.format("%s/%s:generateContent?key=%s", geminiBaseUrl, geminiModel, geminiApiKey);

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(content));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    return textNode.asText();
                }
            }
        } catch (Exception ex) {
            log.warn("Gemini API invocation encountered an issue (falling back gracefully): {}", ex.getMessage());
        }

        return null;
    }
}
