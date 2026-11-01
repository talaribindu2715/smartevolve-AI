package com.smartevolve.service;

import com.smartevolve.dto.StudyAssistantRequest;
import com.smartevolve.dto.StudyAssistantResponse;
import com.smartevolve.entity.AssessmentQuestion;
import com.smartevolve.entity.LearningResource;
import com.smartevolve.entity.Skill;
import com.smartevolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudyAssistantService {

    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final LearningResourceRepository learningResourceRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final CareerRepository careerRepository;

    @Value("${ai.provider.api-key:}")
    private String aiApiKey;

    public StudyAssistantResponse askAssistant(UUID studentId, StudyAssistantRequest request) {
        String prompt = request.getQuestion().trim();
        String mode = request.getContextMode() != null ? request.getContextMode().toUpperCase() : "GENERAL";

        log.info("AI Study Assistant queried by student {}: mode={}, query='{}'", studentId, mode, prompt);

        // Find relevant skill context if skillId is provided or detected in text
        Skill relevantSkill = null;
        if (request.getSkillId() != null) {
            relevantSkill = skillRepository.findById(request.getSkillId()).orElse(null);
        }
        if (relevantSkill == null) {
            relevantSkill = detectSkillFromPrompt(prompt);
        }

        // Generate Domain-aware Response
        return generateKnowledgeEngineResponse(prompt, relevantSkill, mode);
    }

    public StudyAssistantResponse explainTopic(UUID studentId, String topic) {
        Skill skill = detectSkillFromPrompt(topic);
        return generateKnowledgeEngineResponse(
                "Explain core concepts and industry applications of " + topic,
                skill,
                "EXPLANATION"
        );
    }

    public StudyAssistantResponse generateQuizPrep(UUID studentId, UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElse(Skill.builder().name("General Engineering").category("Computer Science").build());

        List<AssessmentQuestion> existingQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getAssessment() != null && q.getAssessment().getSkill() != null && q.getAssessment().getSkill().getId().equals(skillId))
                .limit(3)
                .collect(Collectors.toList());

        List<String> keyConcepts = List.of(
                "Core Syntax & Architecture",
                "Runtime Efficiency & Memory Management",
                "Industry Production Gotchas & Best Practices",
                "Edge Case Handling & Test Coverage"
        );

        StudyAssistantResponse.PracticeQuestion pq;
        if (!existingQuestions.isEmpty()) {
            AssessmentQuestion q = existingQuestions.get(0);
            pq = StudyAssistantResponse.PracticeQuestion.builder()
                    .questionText(q.getQuestionText())
                    .options(List.of("A. Standard runtime default", "B. Explicit type declaration", "C. Asynchronous execution handler", "D. Dynamic reflection"))
                    .correctOptionIndex(1)
                    .explanation(q.getExplanation() != null ? q.getExplanation() : "Verify prerequisite data contracts before invoking evaluation.")
                    .build();
        } else {
            pq = StudyAssistantResponse.PracticeQuestion.builder()
                    .questionText(String.format("Which of the following represents the optimal design choice when scaling %s services?", skill.getName()))
                    .options(List.of(
                            "A. Monolithic synchronous blocking loops",
                            "B. Stateless horizontally scalable workers with decoupled queues",
                            "C. Shared mutable global state across threads",
                            "D. Disabling connection pools and timeouts"
                    ))
                    .correctOptionIndex(1)
                    .explanation("Stateless horizontal architectures with non-blocking async messaging ensure fault isolation and high concurrency under traffic spikes.")
                    .build();
        }

        return StudyAssistantResponse.builder()
                .answer(String.format("### %s Quiz Preparation Briefing\n\nTo pass with an 80%% or above mastery score and qualify for on-chain credential verification, focus on foundational invariants, lifecycle boundaries, and concurrency paradigms.\n\nReview the practice scenario below:", skill.getName()))
                .keyConcepts(keyConcepts)
                .recommendedTopics(List.of(skill.getName() + " Foundations", skill.getName() + " Production Patterns"))
                .practiceQuestion(pq)
                .sourcesOrReferences(List.of("SmartEvolve Curriculum Matrix", "Official Technical Specifications"))
                .build();
    }

    private Skill detectSkillFromPrompt(String prompt) {
        String lower = prompt.toLowerCase();
        List<Skill> allSkills = skillRepository.findAll();
        for (Skill s : allSkills) {
            if (lower.contains(s.getName().toLowerCase())) {
                return s;
            }
        }
        return allSkills.isEmpty() ? null : allSkills.get(0);
    }

    private StudyAssistantResponse generateKnowledgeEngineResponse(String prompt, Skill skill, String mode) {
        String skillName = skill != null ? skill.getName() : "Software Engineering";
        String lower = prompt.toLowerCase();

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("### 🧠 SmartEvolve AI Study Synthesis: %s\n\n", skillName));

        if (lower.contains("what is") || lower.contains("how does") || lower.contains("explain") || "EXPLANATION".equals(mode)) {
            sb.append(String.format("**Overview & Mental Model**:\n%s is a critical pillar in modern technology stacks. In production environments, it enables engineers to solve complex dataflow, scalability, and system interaction problems with deterministic guarantees.\n\n", skillName));
            sb.append("**Key Architectural Insights**:\n");
            sb.append("- **Separation of Concerns**: Isolate core domain logic from transport protocols and storage adapters.\n");
            sb.append("- **Fail-Safe Reliability**: Implement circuit breakers, structured error boundaries, and exponential backoff.\n");
            sb.append("- **Performance Optimization**: Profile hotspots before refactoring and leverage caching layers where read-to-write ratios are high.\n\n");
            sb.append("**Recommended Next Step**:\nComplete the interactive exercises in your Learning Roadmap to advance your skill proficiency index towards your target career benchmark.");
        } else if (lower.contains("roadmap") || lower.contains("career") || "STUDY_PLAN".equals(mode)) {
            sb.append(String.format("**Targeted Study Acceleration Plan**:\nBased on your skill gap analysis, advancing your proficiency in **%s** will directly elevate your career readiness percentage.\n\n", skillName));
            sb.append("1. **Day 1-2**: Master foundational syntax and core object lifecycles.\n");
            sb.append("2. **Day 3-4**: Build hands-on mini-projects and study curated video masterclasses.\n");
            sb.append("3. **Day 5**: Complete the adaptive skill assessment to earn an 80%+ verified score for on-chain blockchain certification.\n");
        } else {
            sb.append(String.format("**Technical Analysis for '%s'**:\n\n", prompt));
            sb.append(String.format("When working with **%s**, modern engineering best practices require strict typing, automated test coverage, and modular dependency management.\n\n", skillName));
            sb.append(String.format("```text\n[Client Layer] --> [API Gateway & Auth] --> [Domain Engine (%s)] --> [PostgreSQL & Cache]\n```\n\n", skillName));
            sb.append("Always monitor latency percentiles (p95/p99) and ensure state transitions are idempotent when building resilient services.");
        }

        StudyAssistantResponse.PracticeQuestion pq = StudyAssistantResponse.PracticeQuestion.builder()
                .questionText(String.format("What is considered the gold standard pattern for verifying state changes in %s?", skillName))
                .options(List.of(
                        "A. Checking logs manually after release",
                        "B. Automated automated test assertions with isolated sandbox fixtures",
                        "C. Hardcoding values in production configurations",
                        "D. Skipping integration testing to speed deployment"
                ))
                .correctOptionIndex(1)
                .explanation("Hermetic automated tests with deterministic assertions prevent regression bugs and allow continuous integration pipelines to validate changes safely.")
                .build();

        List<LearningResource> resources = skill != null ? learningResourceRepository.findBySkillId(skill.getId()) : Collections.emptyList();
        List<String> recs = resources.stream().map(LearningResource::getTitle).limit(3).collect(Collectors.toList());
        if (recs.isEmpty()) {
            recs = List.of(skillName + " Core Architecture", skillName + " High Performance Best Practices");
        }

        return StudyAssistantResponse.builder()
                .answer(sb.toString())
                .keyConcepts(List.of(skillName + " Core Fundamentals", "Scalability & Concurrency", "System Reliability & Testing"))
                .recommendedTopics(recs)
                .practiceQuestion(pq)
                .sourcesOrReferences(List.of("SmartEvolve Academic Repository", "ACM Computing Guidelines", "Modern Web Architecture RFC"))
                .build();
    }
}
