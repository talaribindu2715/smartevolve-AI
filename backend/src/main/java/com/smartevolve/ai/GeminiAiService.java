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

    @Value("${openai.api-key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${openai.base-url:https://api.openai.com/v1}")
    private String openAiBaseUrl;

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

    private static class AiResult {
        final String text;
        final String provider;

        AiResult(String text, String provider) {
            this.text = text;
            this.provider = provider;
        }
    }

    /**
     * Executes prompt across Gemini, OpenAI, or falls back to intelligent heuristics.
     */
    private AiResult executeAiPrompt(String prompt) {
        // 1. Prioritize Google Gemini if API key configured
        if (geminiApiKey != null && !geminiApiKey.isBlank() && !"demo-key".equalsIgnoreCase(geminiApiKey)) {
            String res = callGeminiApi(prompt);
            if (res != null && !res.isBlank()) {
                return new AiResult(res, "GEMINI");
            }
        }

        // 2. Prioritize OpenAI if API key configured
        if (openAiApiKey != null && !openAiApiKey.isBlank() && !"demo-key".equalsIgnoreCase(openAiApiKey)) {
            String res = callOpenAiApi(prompt);
            if (res != null && !res.isBlank()) {
                return new AiResult(res, "OPENAI");
            }
        }

        return new AiResult(null, "HEURISTIC");
    }

    /**
     * Executes deep cognitive skill analysis using Gemini, OpenAI, or intelligent heuristic fallback.
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

        AiResult aiResult = executeAiPrompt(prompt);
        boolean isAiPowered = !"HEURISTIC".equals(aiResult.provider);

        String cognitiveText = isAiPowered ? aiResult.text : String.format(
                "Based on the SmartEvolve Adaptive AI profile, your core strengths in %s provide a solid foundation. " +
                "Your priority for achieving career readiness in %s is closing intermediate gaps in %s.",
                strengths.get(0), targetCareer, growthAreas.get(0)
        );

        String strategyText = isAiPowered ? "Integrated in AI evaluation." : String.format(
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
                .isGeminiPowered(isAiPowered)
                .aiProvider(aiResult.provider)
                .build();
    }

    /**
     * Generates rich career guidance and resume advice using Gemini or OpenAI API.
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

        AiResult aiResult = executeAiPrompt(prompt);
        boolean isAiPowered = !"HEURISTIC".equals(aiResult.provider);

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
                "Week 4-6: Intermediate Module Completion & Video Masterclass Deep Dives",
                "Week 7-9: Capstone Portfolio Development & Blockchain Certification",
                "Week 10+: Mock Interviews & Technical Assessment Drills"
        );

        return AiAdvisorDto.CareerGuidanceResponse.builder()
                .careerName(career.getName())
                .readinessAssessment(isAiPowered ? aiResult.text : "High Potential. Completing target milestones will accelerate full qualification.")
                .estimatedWeeksToReadiness(8)
                .prioritizedLearningMilestones(milestones)
                .portfolioProjectIdeas(projectIdeas)
                .interviewPreparationAdvice(interviewTips)
                .motivationalSummary(String.format("You are on track to master the required competencies for %s! Stay consistent with daily roadmap modules.", career.getName()))
                .isGeminiPowered(isAiPowered)
                .aiProvider(aiResult.provider)
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

        AiResult aiResult = executeAiPrompt(prompt);
        boolean isAiPowered = !"HEURISTIC".equals(aiResult.provider);

        String reply = isAiPowered ? aiResult.text : generateIntelligentFallback(userMessage, careerContext);

        List<String> followUps = Arrays.asList(
                "What specific projects should I build for my portfolio?",
                "How do I prepare for technical interviews in this field?",
                "Which skill gap should I prioritize this week?"
        );

        return AiAdvisorDto.MentorChatResponse.builder()
                .reply(reply)
                .followUpQuestions(followUps)
                .isGeminiPowered(isAiPowered)
                .aiProvider(aiResult.provider)
                .build();
    }

    /**
     * Topic-aware intelligent cognitive fallback when cloud AI providers are unconfigured or offline.
     */
    private String generateIntelligentFallback(String userMessage, String careerContext) {
        String msg = (userMessage != null ? userMessage.toLowerCase().trim() : "");
        String career = (careerContext != null ? careerContext : "Full Stack Software Engineering");

        if (msg.contains("full stack") || msg.contains("web dev") || msg.contains("frontend") || msg.contains("backend") || msg.contains("carer") || msg.contains("career")) {
            return "Starting a career in Full Stack Development is a high-growth pathway! Here is your structured mastery roadmap in SmartEvolve AI:\n\n" +
                    "1. Frontend Engineering (Weeks 1-3):\n" +
                    "   • Master modern TypeScript, React 19 component architecture, and responsive state management.\n" +
                    "   • Build dynamic user interfaces connected to live RESTful APIs.\n\n" +
                    "2. Backend Architecture (Weeks 4-6):\n" +
                    "   • Build scalable REST APIs using Spring Boot or Node.js/Express.\n" +
                    "   • Implement JWT authentication, role-based access control (RBAC), and transactional integrity.\n\n" +
                    "3. Data & System Design (Weeks 7-9):\n" +
                    "   • Master PostgreSQL relational schema modeling, indexing, and Redis caching.\n\n" +
                    "4. DevOps & On-Chain Verification (Weeks 10+):\n" +
                    "   • Containerize using Docker and deploy to production.\n" +
                    "   • Complete the Capstone Roadmap assessment in the Learn tab to mint your EVM-verified blockchain credential!";
        } else if (msg.contains("blockchain") || msg.contains("verification") || msg.contains("evm") || msg.contains("smart contract") || msg.contains("credential") || msg.contains("certificate")) {
            return "SmartEvolve AI secures academic credentials using a multi-layer EVM blockchain architecture:\n\n" +
                    "1. Automated Prerequisite Validation:\n" +
                    "   • Kahn's Directed Acyclic Graph (DAG) algorithm validates competency prerequisites across your learning roadmap.\n\n" +
                    "2. Cryptographic Digest (SHA-256):\n" +
                    "   • Your verified quiz scores, institutional identity, and completion timestamps are hashed into a tamper-evident digest.\n\n" +
                    "3. On-Chain Smart Contract Minting:\n" +
                    "   • The digest is permanently registered on Polygon/Ethereum Sepolia smart contracts, issuing a unique transaction hash.\n\n" +
                    "4. Frictionless Global Verification:\n" +
                    "   • Any employer or institution can scan your certificate's QR code to verify on-chain authenticity instantly without third-party reliance.";
        } else if (msg.contains("project") || msg.contains("portfolio") || msg.contains("build") || msg.contains("resume")) {
            return "To stand out to elite tech recruiters in " + career + ", build these 3 production-grade portfolio projects:\n\n" +
                    "1. Full-Stack Multi-Tenant SaaS Platform:\n" +
                    "   • Features: Stripe/Razorpay payment gateway, OAuth2 authentication, and background worker queues.\n\n" +
                    "2. Distributed Real-Time Collaboration Hub:\n" +
                    "   • Features: WebSockets / Socket.io, Redis Pub/Sub, live presence detection, and optimistic UI updates.\n\n" +
                    "3. Decentralized Verifiable Credential Registry:\n" +
                    "   • Features: Solidity smart contracts, IPFS decentralized storage, and ethers.js wallet integration.\n\n" +
                    "Tip: Link these directly to your GitHub in your SmartEvolve profile!";
        } else if (msg.contains("interview") || msg.contains("job") || msg.contains("prep") || msg.contains("coding")) {
            return "Here is your 3-phase technical interview acceleration plan for " + career + ":\n\n" +
                    "• Phase 1: Data Structures & Algorithms: Master Two-Pointers, Sliding Window, Graph BFS/DFS, and Dynamic Programming.\n" +
                    "• Phase 2: System Design & Architecture: Practice load balancing, database sharding, caching strategies, and CAP theorem trade-offs.\n" +
                    "• Phase 3: Behavioral STAR Framework: Prepare real stories about production debugging, architectural trade-offs, and teamwork.\n\n" +
                    "Start with the diagnostic assessments in the Learn tab to measure your proficiency under timed conditions!";
        } else if (msg.contains("ai") || msg.contains("machine learning") || msg.contains("ml") || msg.contains("python")) {
            return "The AI & Cognitive Systems pathway requires a balance of core machine learning and modern LLM engineering:\n\n" +
                    "1. Foundations: Python vectorization (NumPy), exploratory data analysis (Pandas), and Linear Algebra.\n" +
                    "2. Predictive ML: Scikit-learn classification, regression, and Random Forest models.\n" +
                    "3. Modern LLM & RAG Systems: Retrieval-Augmented Generation (RAG) using LangChain/LlamaIndex, Vector Databases (Pinecone/pgvector), and prompt orchestration.\n\n" +
                    "Navigate to the Learn tab and switch your Career Track to 'AI / Machine Learning Engineer' to activate targeted modules!";
        } else {
            return "Regarding \"" + userMessage + "\":\n\n" +
                    "In " + career + ", practical application yields the highest learning retention. Here is your immediate action plan:\n\n" +
                    "1. Review Core Modules: Open your active roadmap in the Learn tab to tackle the highest-weighted skill gaps.\n" +
                    "2. Hands-on Code Practice: Implement practical examples for each concept before moving to the next phase.\n" +
                    "3. Validate Knowledge: Take the end-of-module assessment quiz to recalibrate your cognitive proficiency score.\n\n" +
                    "Ask me anything specific about algorithms, system architecture, database design, or blockchain verification!";
        }
    }

    /**
     * Diagnostic health check for Google Gemini API integration.
     */
    public Map<String, Object> checkGeminiHealth() {
        Map<String, Object> res = new LinkedHashMap<>();
        boolean hasKey = geminiApiKey != null && !geminiApiKey.isBlank() && !"demo-key".equalsIgnoreCase(geminiApiKey);
        res.put("provider", "GOOGLE_GEMINI");
        res.put("model", geminiModel);
        res.put("apiKeyConfigured", hasKey);

        if (!hasKey) {
            res.put("status", "NOT_CONFIGURED");
            res.put("working", false);
            res.put("message", "GEMINI_API_KEY environment variable is not configured on the server. Set GEMINI_API_KEY in Render dashboard to activate Gemini AI.");
            return res;
        }

        long start = System.currentTimeMillis();
        String testPrompt = "Say 'SmartEvolve Gemini AI is online and operational!' in exactly 7 words.";
        String apiResponse = callGeminiApi(testPrompt);
        long latencyMs = System.currentTimeMillis() - start;

        if (apiResponse != null && !apiResponse.isBlank()) {
            res.put("status", "ONLINE");
            res.put("working", true);
            res.put("latencyMs", latencyMs);
            res.put("geminiResponse", apiResponse.trim());
            res.put("message", "Google Gemini AI API is connected and responding in real-time!");
        } else {
            res.put("status", "ERROR");
            res.put("working", false);
            res.put("latencyMs", latencyMs);
            res.put("message", "Gemini API call failed. Verify that GEMINI_API_KEY has Gemini 1.5 Flash access enabled.");
        }

        return res;
    }

    /**
     * Direct HTTP call to Google Gemini REST API.
     */
    private String callGeminiApi(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isBlank() || "demo-key".equalsIgnoreCase(geminiApiKey)) {
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

    /**
     * Direct HTTP call to OpenAI Chat Completions REST API.
     */
    private String callOpenAiApi(String prompt) {
        if (openAiApiKey == null || openAiApiKey.isBlank() || "demo-key".equalsIgnoreCase(openAiApiKey)) {
            return null;
        }

        try {
            String url = openAiBaseUrl + "/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey.trim());

            Map<String, Object> message = Map.of("role", "user", "content", prompt);
            Map<String, Object> requestBody = Map.of(
                    "model", openAiModel,
                    "messages", List.of(message),
                    "temperature", 0.7,
                    "max_tokens", 800
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode contentNode = choices.get(0).path("message").path("content");
                    return contentNode.asText();
                }
            }
        } catch (Exception ex) {
            log.warn("OpenAI API invocation encountered an issue (falling back gracefully): {}", ex.getMessage());
        }

        return null;
    }
}
