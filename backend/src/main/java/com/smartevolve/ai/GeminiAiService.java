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

    @Value("${groq.api-key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;

    @Value("${groq.base-url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqBaseUrl;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    @Value("${anthropic.model:claude-3-5-haiku-20241022}")
    private String anthropicModel;

    @Value("${anthropic.base-url:https://api.anthropic.com/v1/messages}")
    private String anthropicBaseUrl;

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

    private String maskKey(String key) {
        if (key == null || key.isBlank()) return "null";
        String clean = key.trim();
        if (clean.length() <= 8) return clean.substring(0, Math.min(2, clean.length())) + "****";
        return clean.substring(0, 4) + "..." + clean.substring(clean.length() - 4);
    }

    public String getEffectiveGroqKey() {
        if (groqApiKey != null && !groqApiKey.isBlank() && !"demo-key".equalsIgnoreCase(groqApiKey)) return groqApiKey.trim();
        String e1 = System.getenv("GROQ_API_KEY");
        if (e1 != null && !e1.isBlank()) return e1.trim();
        String e2 = System.getenv("GROQ_KEY");
        if (e2 != null && !e2.isBlank()) return e2.trim();
        for (Map.Entry<String, String> entry : System.getenv().entrySet()) {
            if (entry.getValue() != null && entry.getValue().trim().startsWith("gsk_")) {
                return entry.getValue().trim();
            }
        }
        return null;
    }

    public String getEffectiveGeminiKey() {
        if (geminiApiKey != null && !geminiApiKey.isBlank() && !"demo-key".equalsIgnoreCase(geminiApiKey)) return geminiApiKey.trim();
        String e1 = System.getenv("GEMINI_API_KEY");
        if (e1 != null && !e1.isBlank()) return e1.trim();
        String e2 = System.getenv("GEMINI_KEY");
        if (e2 != null && !e2.isBlank()) return e2.trim();
        String e3 = System.getenv("GOOGLE_API_KEY");
        if (e3 != null && !e3.isBlank()) return e3.trim();
        String e4 = System.getenv("GOOGLE_GEMINI_API_KEY");
        if (e4 != null && !e4.isBlank()) return e4.trim();
        for (Map.Entry<String, String> entry : System.getenv().entrySet()) {
            if (entry.getValue() != null && entry.getValue().trim().startsWith("AIzaSy")) {
                return entry.getValue().trim();
            }
        }
        return null;
    }

    public String getEffectiveAnthropicKey() {
        if (anthropicApiKey != null && !anthropicApiKey.isBlank() && !"demo-key".equalsIgnoreCase(anthropicApiKey)) return anthropicApiKey.trim();
        String e1 = System.getenv("ANTHROPIC_API_KEY");
        if (e1 != null && !e1.isBlank()) return e1.trim();
        String e2 = System.getenv("CLAUDE_API_KEY");
        if (e2 != null && !e2.isBlank()) return e2.trim();
        for (Map.Entry<String, String> entry : System.getenv().entrySet()) {
            if (entry.getValue() != null && entry.getValue().trim().startsWith("sk-ant-")) {
                return entry.getValue().trim();
            }
        }
        return null;
    }

    public String getEffectiveOpenAiKey() {
        if (openAiApiKey != null && !openAiApiKey.isBlank() && !"demo-key".equalsIgnoreCase(openAiApiKey)) return openAiApiKey.trim();
        String e1 = System.getenv("OPENAI_API_KEY");
        if (e1 != null && !e1.isBlank()) return e1.trim();
        String e2 = System.getenv("OPEN_AI_KEY");
        if (e2 != null && !e2.isBlank()) return e2.trim();
        return null;
    }

    /**
     * Executes prompt across Anthropic Claude, Google Gemini, OpenAI, or falls back to intelligent heuristics.
     */
    private AiResult executeAiPrompt(String prompt) {
        return executeAiPrompt(prompt, null, null);
    }

    private AiResult executeAiPrompt(String prompt, String customKey, String customProvider) {
        // 1. Explicit Custom Key Provided from Client
        if (customKey != null && !customKey.isBlank()) {
            String trimmedKey = customKey.trim().replaceAll("^[\"']|[\"']$", "").replaceAll("^(?i)Bearer\\s+", "").trim();
            if ("GROQ".equalsIgnoreCase(customProvider) || trimmedKey.startsWith("gsk_")) {
                String res = callGroqApiWithKey(prompt, trimmedKey, "llama-3.3-70b-versatile");
                if (res != null && !res.isBlank()) {
                    return new AiResult(res, "GROQ");
                }
            } else if ("GEMINI".equalsIgnoreCase(customProvider) || trimmedKey.startsWith("AIza")) {
                String res = callGeminiApiWithKey(prompt, trimmedKey, "gemini-1.5-flash");
                if (res != null && !res.isBlank()) {
                    return new AiResult(res, "GEMINI");
                }
            } else if ("ANTHROPIC".equalsIgnoreCase(customProvider) || trimmedKey.startsWith("sk-ant-")) {
                String res = callAnthropicApiWithKey(prompt, trimmedKey, null);
                if (res != null && !res.isBlank()) {
                    return new AiResult(res, "ANTHROPIC");
                }
            } else if ("OPENAI".equalsIgnoreCase(customProvider) || trimmedKey.startsWith("sk-")) {
                String res = callOpenAiApiWithKey(prompt, trimmedKey, null);
                if (res != null && !res.isBlank()) {
                    return new AiResult(res, "OPENAI");
                }
            }
        }

        // 2. Server-Side Groq Cloud (Free tier Llama 3.3, ultra-fast 1000 tokens/sec)
        String effectiveGroqKey = getEffectiveGroqKey();
        if (effectiveGroqKey != null && !effectiveGroqKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveGroqKey)) {
            String res = callGroqApiWithKey(prompt, effectiveGroqKey, (groqModel != null && !groqModel.isBlank()) ? groqModel : "llama-3.3-70b-versatile");
            if (res != null && !res.isBlank()) {
                return new AiResult(res, "GROQ");
            }
        }

        // 3. Server-Side Google Gemini
        String effectiveGeminiKey = getEffectiveGeminiKey();
        if (effectiveGeminiKey != null && !effectiveGeminiKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveGeminiKey)) {
            String res = callGeminiApiWithKey(prompt, effectiveGeminiKey, (geminiModel != null && !geminiModel.isBlank()) ? geminiModel : "gemini-1.5-flash");
            if (res != null && !res.isBlank()) {
                return new AiResult(res, "GEMINI");
            }
        }

        // 4. Server-Side Anthropic Claude
        String effectiveAnthropicKey = getEffectiveAnthropicKey();
        if (effectiveAnthropicKey != null && !effectiveAnthropicKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveAnthropicKey)) {
            String res = callAnthropicApiWithKey(prompt, effectiveAnthropicKey, anthropicModel);
            if (res != null && !res.isBlank()) {
                return new AiResult(res, "ANTHROPIC");
            }
        }

        // 5. Server-Side OpenAI
        String effectiveOpenAiKey = getEffectiveOpenAiKey();
        if (effectiveOpenAiKey != null && !effectiveOpenAiKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveOpenAiKey)) {
            String res = callOpenAiApiWithKey(prompt, effectiveOpenAiKey, openAiModel);
            if (res != null && !res.isBlank()) {
                return new AiResult(res, "OPENAI");
            }
        }

        return new AiResult(null, "HEURISTIC");
    }

    /**
     * Executes deep cognitive skill analysis using Anthropic Claude, Gemini, OpenAI, or intelligent heuristic fallback.
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
                .studentHeadline(String.format("Adaptive Learner targeting %s", targetCareer))
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
     * Generates career readiness assessment and milestone roadmap advice.
     */
    public AiAdvisorDto.CareerGuidanceResponse generateCareerGuidance(UUID studentId, UUID careerId) {
        Career career = careerRepository.findById(careerId).orElseThrow(() -> new IllegalArgumentException("Career pathway not found: " + careerId));
        List<StudentSkill> skills = studentSkillRepository.findByStudentId(studentId);

        String prompt = String.format(
                "A student in SmartEvolve AI is targeting the career '%s' (%s).\n" +
                "They currently have %d recorded skill proficiencies.\n" +
                "Provide:\n" +
                "1. A realistic career readiness assessment (2-3 sentences).\n" +
                "2. Three high-impact portfolio project ideas that stand out to technical recruiters.\n" +
                "3. Key technical interview preparation topics.",
                career.getName(), career.getDescription(), skills.size()
        );

        AiResult aiResult = executeAiPrompt(prompt);
        boolean isAiPowered = !"HEURISTIC".equals(aiResult.provider);

        List<String> milestones = Arrays.asList(
                String.format("Master Core Fundamentals for %s", career.getName()),
                "Pass Intermediate DAG Roadmap Stage Assessments",
                "Deploy production-grade capstone project and mint on-chain credential"
        );

        List<String> projectIdeas = Arrays.asList(
                String.format("Production %s Platform with Real-Time Observability", career.getName()),
                "Distributed Event-Driven Architecture with WebSockets and Redis",
                "Verifiable Credential Registry anchored on Polygon Smart Contracts"
        );

        List<String> interviewTips = Arrays.asList(
                "Practice Data Structures & Algorithm patterns (Two Pointers, Sliding Window, Graph Traversals)",
                "Prepare System Design scenarios: horizontal scaling, caching strategies, and database indexing",
                "Be ready to explain production debugging tradeoffs using the STAR framework"
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
        return chatWithMentor(studentId, userMessage, careerContext, null, null);
    }

    public AiAdvisorDto.MentorChatResponse chatWithMentor(
            UUID studentId,
            String userMessage,
            String careerContext,
            String customKey,
            String customProvider) {
        String prompt = String.format(
                "You are SmartEvolve AI's intelligent Career Mentor. A student asks: \"%s\"\n" +
                "Context: Target Career = %s.\n" +
                "Provide a direct, inspiring, and technically sound response with actionable next steps.",
                userMessage, (careerContext != null ? careerContext : "Software Engineering")
        );

        AiResult aiResult = executeAiPrompt(prompt, customKey, customProvider);
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
     * Resilient fallback dialog when cloud AI providers are unavailable or encountering temporary rate limits.
     */
    public AiAdvisorDto.MentorChatResponse chatWithMentorFallback(UUID studentId, String userMessage, String careerContext) {
        String reply = generateIntelligentFallback(userMessage, careerContext);
        List<String> followUps = Arrays.asList(
                "What specific projects should I build for my portfolio?",
                "How do I prepare for technical interviews in this field?",
                "Which skill gap should I prioritize this week?"
        );
        return AiAdvisorDto.MentorChatResponse.builder()
                .reply(reply)
                .followUpQuestions(followUps)
                .isGeminiPowered(false)
                .aiProvider("HEURISTIC")
                .build();
    }

    /**
     * Topic-aware intelligent cognitive fallback when cloud AI providers are unconfigured or offline.
     */
    private String generateIntelligentFallback(String userMessage, String careerContext) {
        String msg = (userMessage != null ? userMessage.toLowerCase().trim() : "");
        String career = (careerContext != null ? careerContext : "Full Stack Software Engineering");

        // 1. Hot topics / World Trends / News / Tech Evolution
        if (msg.contains("topic") || msg.contains("hot topic") || msg.contains("world") ||
            msg.contains("trend") || msg.contains("news") || msg.contains("latest")) {
            return "I'd love to discuss today's hot topics in tech! Right now, some of the biggest movements shaping the industry include:\n\n" +
                    "1. 🤖 Autonomous AI Agents & Real-Time Reasoning:\n" +
                    "   • Shifting beyond standard text chatbots to autonomous multi-agent pipelines that build, test, and deploy applications.\n\n" +
                    "2. ⚡ Ultra-Fast Edge & Open-Source LLM Inference:\n" +
                    "   • Massive adoption of Groq LPUs, Llama 3.3, and DeepSeek running locally and on the edge at 1,000+ tokens/second.\n\n" +
                    "3. 🚀 Modern Cloud-Native & Reactive Frameworks:\n" +
                    "   • Spring Boot 3 with GraalVM native binaries for sub-second startup times, and React 19 server actions for zero-bundle-size backend integration.\n\n" +
                    "4. ⛓️ Decentralized Identity & Verifiable Credentials:\n" +
                    "   • On-chain cryptographic proofs that verify software engineering proficiency without relying on paper degrees.\n\n" +
                    "Which of these areas are you most curious about? We can dive into practical implications, career impacts, or how you can build hands-on projects with them!";
        }

        // 2. Greetings & Warm Hellos (Handles "Hiii", "Hello", "Hey", plus leading conversational intros)
        if (msg.equals("hi") || msg.equals("hii") || msg.equals("hiii") || msg.equals("hello") ||
            msg.equals("hey") || msg.equals("heyy") || msg.startsWith("hi ") || msg.startsWith("hii ") ||
            msg.startsWith("hiii ") || msg.startsWith("hello ") || msg.startsWith("hey ") ||
            msg.contains("good morning") || msg.contains("good afternoon") || msg.contains("good evening") ||
            msg.equals("sup") || msg.contains("how are you")) {
            return "Hello! 👋 Great to connect with you! I'm your SmartEvolve AI Career & Technical Mentor.\n\n" +
                    "I'm here to help you accelerate your tech career, master complex concepts, and build production projects in " + career + ".\n\n" +
                    "Feel free to ask me anything about:\n" +
                    "• Full-Stack & Backend (Spring Boot, Node.js, React, APIs)\n" +
                    "• AI / ML & Python Data Engineering\n" +
                    "• Core Data Structures, Algorithms & Interview Prep\n" +
                    "• Portfolio Projects & Verified Blockchain Credentials\n\n" +
                    "What would you like to explore today?";
        }

        // 3. Spring Boot / Java / REST APIs
        if (msg.contains("spring") || msg.contains("java") || msg.contains("jpa") ||
            msg.contains("hibernate") || msg.contains("rest api")) {
            return "Spring Boot & Enterprise Java Architecture Blueprint:\n\n" +
                    "1. Core Architecture Pattern:\n" +
                    "   • Maintain strict Layered Architecture: @RestController (HTTP/JSON) ➔ @Service (Business logic & @Transactional) ➔ @Repository (Spring Data JPA) ➔ @Entity.\n" +
                    "   • Always use constructor injection for immutability and seamless Mockito unit testing.\n\n" +
                    "2. Database Persistence & Performance:\n" +
                    "   • Use Spring Data JPA queries with custom DTO projections to prevent N+1 query overhead.\n" +
                    "   • Implement Flyway database migrations for reliable version-controlled schema evolution.\n\n" +
                    "3. Production Readiness:\n" +
                    "   • Configure Spring Boot Actuator for health checks and Prometheus metric scrapers.\n" +
                    "   • Use @ControllerAdvice for centralized global RFC 7807 error responses.\n\n" +
                    "Check out the Spring Boot masterclass videos in the Learn tab to take your certification quiz!";
        }

        // 4. Full Stack / Web Development Roadmap
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
            return "I'm glad you brought that up! As your SmartEvolve AI Career & Technical Mentor, I'm here to unpack that with you.\n\n" +
                    "Here is how we can explore this together:\n" +
                    "• 🚀 Technical & Architectural Deep-Dive: We can explore how modern production systems design and solve for this.\n" +
                    "• 💡 Hands-On Implementation: I can guide you through real code examples and practical patterns.\n" +
                    "• 🎯 Career & Interview Readiness: We can connect this concept to what top tech companies look for in senior engineering candidates.\n\n" +
                    "Tell me which angle you'd like to explore first, or feel free to ask a specific coding or architectural question!";
        }
    }

    /**
     * Diagnostic health check for Groq Cloud, Anthropic Claude, Google Gemini, and OpenAI API integrations.
     */
    public Map<String, Object> checkGeminiHealth() {
        Map<String, Object> res = new LinkedHashMap<>();
        try {
            String effectiveGroqKey = getEffectiveGroqKey();
            String effectiveGeminiKey = getEffectiveGeminiKey();
            String effectiveAnthropicKey = getEffectiveAnthropicKey();
            String effectiveOpenAiKey = getEffectiveOpenAiKey();

            boolean hasGroq = effectiveGroqKey != null && !effectiveGroqKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveGroqKey);
            boolean hasGemini = effectiveGeminiKey != null && !effectiveGeminiKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveGeminiKey);
            boolean hasAnthropic = effectiveAnthropicKey != null && !effectiveAnthropicKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveAnthropicKey);
            boolean hasOpenAi = effectiveOpenAiKey != null && !effectiveOpenAiKey.isBlank() && !"demo-key".equalsIgnoreCase(effectiveOpenAiKey);

            // Record detected key presence
            Map<String, Object> keysDetected = new LinkedHashMap<>();
            keysDetected.put("groq", hasGroq ? maskKey(effectiveGroqKey) : "none");
            keysDetected.put("gemini", hasGemini ? maskKey(effectiveGeminiKey) : "none");
            keysDetected.put("anthropic", hasAnthropic ? maskKey(effectiveAnthropicKey) : "none");
            keysDetected.put("openai", hasOpenAi ? maskKey(effectiveOpenAiKey) : "none");
            res.put("keysDetected", keysDetected);

            // 1. Check Groq Cloud (Ultra-Fast Free Tier Llama 3.3)
            if (hasGroq) {
                res.put("provider", "GROQ");
                res.put("model", groqModel != null ? groqModel : "llama-3.3-70b-versatile");
                res.put("apiKeyConfigured", true);

                long start = System.currentTimeMillis();
                String testPrompt = "Say 'SmartEvolve Groq AI is online and operational!' in exactly 7 words.";
                String apiResponse = callGroqApiWithKey(testPrompt, effectiveGroqKey, groqModel);
                long latencyMs = System.currentTimeMillis() - start;

                if (apiResponse != null && !apiResponse.isBlank()) {
                    res.put("status", "ONLINE");
                    res.put("working", true);
                    res.put("latencyMs", latencyMs);
                    res.put("testResponse", apiResponse.trim());
                    res.put("message", "Groq Cloud AI is connected and responding in real-time!");
                    return res;
                }
            }

            // 2. Check Google Gemini
            if (hasGemini) {
                res.put("provider", "GOOGLE_GEMINI");
                res.put("model", geminiModel != null ? geminiModel : "gemini-1.5-flash");
                res.put("apiKeyConfigured", true);

                long start = System.currentTimeMillis();
                String testPrompt = "Say 'SmartEvolve Gemini AI is online and operational!' in exactly 7 words.";
                String apiResponse = callGeminiApiWithKey(testPrompt, effectiveGeminiKey, geminiModel);
                long latencyMs = System.currentTimeMillis() - start;

                if (apiResponse != null && !apiResponse.isBlank()) {
                    res.put("status", "ONLINE");
                    res.put("working", true);
                    res.put("latencyMs", latencyMs);
                    res.put("testResponse", apiResponse.trim());
                    res.put("message", "Google Gemini AI API is connected and responding in real-time!");
                    return res;
                }
            }

            // 3. Check Anthropic Claude
            if (hasAnthropic) {
                res.put("provider", "ANTHROPIC");
                res.put("model", anthropicModel != null ? anthropicModel : "claude-3-5-haiku-20241022");
                res.put("apiKeyConfigured", true);

                long start = System.currentTimeMillis();
                String testPrompt = "Say 'SmartEvolve Claude AI is online and operational!' in exactly 7 words.";
                String apiResponse = callAnthropicApiWithKey(testPrompt, effectiveAnthropicKey, anthropicModel);
                long latencyMs = System.currentTimeMillis() - start;

                if (apiResponse != null && !apiResponse.isBlank()) {
                    res.put("status", "ONLINE");
                    res.put("working", true);
                    res.put("latencyMs", latencyMs);
                    res.put("testResponse", apiResponse.trim());
                    res.put("message", "Anthropic Claude AI API is connected and responding in real-time!");
                    return res;
                }
            }

            // 4. Check OpenAI
            if (hasOpenAi) {
                res.put("provider", "OPENAI");
                res.put("model", openAiModel != null ? openAiModel : "gpt-4o-mini");
                res.put("apiKeyConfigured", true);

                long start = System.currentTimeMillis();
                String testPrompt = "Say 'SmartEvolve OpenAI is online and operational!' in exactly 7 words.";
                String apiResponse = callOpenAiApiWithKey(testPrompt, effectiveOpenAiKey, openAiModel);
                long latencyMs = System.currentTimeMillis() - start;

                if (apiResponse != null && !apiResponse.isBlank()) {
                    res.put("status", "ONLINE");
                    res.put("working", true);
                    res.put("latencyMs", latencyMs);
                    res.put("testResponse", apiResponse.trim());
                    res.put("message", "OpenAI API is connected and responding in real-time!");
                    return res;
                }
            }

            res.put("provider", "NONE");
            res.put("status", "NOT_CONFIGURED");
            res.put("working", false);
            res.put("message", "No cloud AI API key responded successfully. Set GROQ_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY in Render environment.");
        } catch (Exception ex) {
            log.error("AI health check error: ", ex);
            res.put("status", "ERROR");
            res.put("working", false);
            res.put("message", "AI service notice: " + ex.getMessage());
        }
        return res;
    }

    /**
     * Direct HTTP call to Anthropic Claude REST API.
     */
    public String callAnthropicApi(String prompt) {
        return callAnthropicApiWithKey(prompt, anthropicApiKey, anthropicModel);
    }

    public String callAnthropicApiWithKey(String prompt, String apiKey, String model) {
        if (apiKey == null || apiKey.isBlank() || "demo-key".equalsIgnoreCase(apiKey)) {
            return null;
        }

        try {
            String cleanKey = apiKey.trim().replaceAll("^[\"']|[\"']$", "");
            String cleanModel = (model != null && !model.isBlank()) ? model.trim() : (anthropicModel != null && !anthropicModel.isBlank() ? anthropicModel.trim() : "claude-3-5-haiku-20241022");
            String url = (anthropicBaseUrl != null && !anthropicBaseUrl.isBlank()) ? anthropicBaseUrl.trim() : "https://api.anthropic.com/v1/messages";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", cleanKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> message = Map.of("role", "user", "content", prompt);
            Map<String, Object> requestBody = Map.of(
                    "model", cleanModel,
                    "max_tokens", 1024,
                    "messages", List.of(message)
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode contentArray = root.path("content");
                if (contentArray.isArray() && contentArray.size() > 0) {
                    JsonNode firstBlock = contentArray.get(0);
                    if ("text".equals(firstBlock.path("type").asText())) {
                        return firstBlock.path("text").asText();
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Anthropic Claude API invocation note: {}", ex.getMessage());
        }

        return null;
    }

    /**
     * Direct HTTP call to Google Gemini REST API.
     */
    public String callGeminiApi(String prompt) {
        return callGeminiApiWithKey(prompt, geminiApiKey, geminiModel);
    }

    public String callGeminiApiWithKey(String prompt, String apiKey, String model) {
        if (apiKey == null || apiKey.isBlank() || "demo-key".equalsIgnoreCase(apiKey)) {
            return null;
        }

        String cleanKey = apiKey.trim().replaceAll("^[\"']|[\"']$", "").replaceAll("^(?i)Bearer\\s+", "").trim();
        List<String> modelsToTry = new ArrayList<>();
        if (model != null && !model.isBlank()) {
            modelsToTry.add(model.trim());
        }
        if (!modelsToTry.contains("gemini-1.5-flash")) modelsToTry.add("gemini-1.5-flash");
        if (!modelsToTry.contains("gemini-2.0-flash")) modelsToTry.add("gemini-2.0-flash");
        if (!modelsToTry.contains("gemini-1.5-pro")) modelsToTry.add("gemini-1.5-pro");

        String cleanBase = (geminiBaseUrl != null && !geminiBaseUrl.isBlank()) ? geminiBaseUrl.trim() : "https://generativelanguage.googleapis.com/v1beta/models";

        for (String m : modelsToTry) {
            try {
                String url = cleanBase + "/" + m + ":generateContent?key=" + cleanKey;

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
                        if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                            return textNode.asText();
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Gemini model {} attempt notice: {}", m, ex.getMessage());
            }
        }

        return null;
    }

    /**
     * Direct HTTP call to Groq Cloud REST API (100% Free Ultra-Fast Llama 3.3).
     */
    public String callGroqApi(String prompt) {
        String effectiveGroqKey = getEffectiveGroqKey();
        return callGroqApiWithKey(prompt, effectiveGroqKey, groqModel);
    }

    public String callGroqApiWithKey(String prompt, String apiKey, String model) {
        if (apiKey == null || apiKey.isBlank() || "demo-key".equalsIgnoreCase(apiKey)) {
            return null;
        }

        String cleanKey = apiKey.trim().replaceAll("^[\"']|[\"']$", "").replaceAll("^(?i)Bearer\\s+", "").trim();
        List<String> modelsToTry = new ArrayList<>();
        if (model != null && !model.isBlank()) {
            modelsToTry.add(model.trim());
        }
        if (!modelsToTry.contains("llama-3.3-70b-versatile")) modelsToTry.add("llama-3.3-70b-versatile");
        if (!modelsToTry.contains("llama-3.1-8b-instant")) modelsToTry.add("llama-3.1-8b-instant");

        String url = "https://api.groq.com/openai/v1/chat/completions";

        for (String m : modelsToTry) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(cleanKey);

                Map<String, Object> message = Map.of("role", "user", "content", prompt);
                Map<String, Object> requestBody = Map.of(
                        "model", m,
                        "messages", List.of(message),
                        "temperature", 0.7,
                        "max_tokens", 1024
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode choices = root.path("choices");
                    if (choices.isArray() && choices.size() > 0) {
                        JsonNode contentNode = choices.get(0).path("message").path("content");
                        if (!contentNode.isMissingNode() && !contentNode.asText().isBlank()) {
                            return contentNode.asText();
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Groq model {} attempt notice: {}", m, ex.getMessage());
            }
        }

        return null;
    }

    /**
     * Direct HTTP call to OpenAI Chat Completions REST API.
     */
    public String callOpenAiApi(String prompt) {
        return callOpenAiApiWithKey(prompt, openAiApiKey, openAiModel);
    }

    public String callOpenAiApiWithKey(String prompt, String apiKey, String model) {
        if (apiKey == null || apiKey.isBlank() || "demo-key".equalsIgnoreCase(apiKey)) {
            return null;
        }

        try {
            String cleanKey = apiKey.trim().replaceAll("^[\"']|[\"']$", "");
            String cleanModel = (model != null && !model.isBlank()) ? model.trim() : "gpt-4o-mini";
            String url = (openAiBaseUrl != null && !openAiBaseUrl.isBlank()) ? openAiBaseUrl.trim() + "/chat/completions" : "https://api.openai.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(cleanKey);

            Map<String, Object> message = Map.of("role", "user", "content", prompt);
            Map<String, Object> requestBody = Map.of(
                    "model", cleanModel,
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
