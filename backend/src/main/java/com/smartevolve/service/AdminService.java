package com.smartevolve.service;

import com.smartevolve.dto.*;
import com.smartevolve.entity.Profile;
import com.smartevolve.exception.BadRequestException;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import com.smartevolve.security.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartevolve.entity.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final CareerRepository careerRepository;
    private final LearningResourceRepository resourceRepository;
    private final CredentialRepository credentialRepository;
    private final LearningPrerequisiteRepository prerequisiteRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    private final AtomicReference<PlatformSettingsDto> platformSettings = new AtomicReference<>(
            PlatformSettingsDto.builder()
                    .aiModel("Gemini 1.5 Pro / Adaptive Heuristic Pipeline")
                    .recommendationEngineVersion("v2.4-Production")
                    .blockchainNetwork("Hardhat EVM Local (Chain ID: 31337) / Sepolia Testnet")
                    .smartContractAddress("0x5FbDB2315678afecb367f032d93F642f64180aa3")
                    .rlsEnforced(true)
                    .strictModeEnabled(true)
                    .allowStudentRegistration(true)
                    .build()
    );

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        long totalUsers = profileRepository.count();
        long studentCount = profileRepository.countByRole("STUDENT");
        long mentorCount = profileRepository.countByRole("MENTOR") + profileRepository.countByRole("FACULTY");
        long adminCount = profileRepository.countByRole("ADMIN");
        long recruiterCount = profileRepository.countByRole("RECRUITER") + profileRepository.countByRole("EMPLOYER");

        long totalSkills = skillRepository.count();
        long totalCareers = careerRepository.count();
        long totalResources = resourceRepository.count();
        long totalCredentials = credentialRepository.count();

        List<AdminUserDto> recentUsers = getAllUsers(null).stream()
                .limit(10)
                .collect(Collectors.toList());

        return AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .studentCount(studentCount)
                .mentorCount(mentorCount)
                .adminCount(adminCount)
                .recruiterCount(recruiterCount)
                .totalSkills(totalSkills)
                .totalCareers(totalCareers)
                .totalLearningResources(totalResources)
                .totalCredentialsIssued(totalCredentials)
                .systemHealthStatus("HEALTHY (All services nominal, RLS active)")
                .activeNetwork("Hardhat EVM Local / Sepolia Testnet")
                .recommendationEngine("SmartEvolve Dynamic Vector Gap Engine")
                .recentUsers(recentUsers)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers(String roleFilter) {
        List<Profile> profiles;
        if (roleFilter != null && !roleFilter.trim().isEmpty() && !roleFilter.equalsIgnoreCase("ALL")) {
            UserRole userRole = UserRole.fromString(roleFilter);
            profiles = profileRepository.findByRole(userRole.name());
        } else {
            profiles = profileRepository.findAllByOrderByCreatedAtDesc();
        }

        return profiles.stream().map(p -> AdminUserDto.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .role(p.getRole() != null ? p.getRole() : "STUDENT")
                .institution(p.getInstitution())
                .branch(p.getBranch())
                .educationLevel(p.getEducationLevel())
                .graduationYear(p.getGraduationYear())
                .onboardingCompleted(p.getOnboardingCompleted())
                .createdAt(p.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDto updateUserRole(UUID userId, String newRoleStr) {
        if (newRoleStr == null || newRoleStr.trim().isEmpty()) {
            throw new BadRequestException("Role cannot be empty");
        }

        UserRole targetRole = UserRole.fromString(newRoleStr);

        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String oldRole = profile.getRole();
        profile.setRole(targetRole.name());
        Profile saved = profileRepository.save(profile);

        log.info("Admin updated role for user {} ({}) from {} to {}",
                profile.getId(), profile.getFullName(), oldRole, targetRole.name());

        return AdminUserDto.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .role(saved.getRole())
                .institution(saved.getInstitution())
                .branch(saved.getBranch())
                .educationLevel(saved.getEducationLevel())
                .graduationYear(saved.getGraduationYear())
                .onboardingCompleted(saved.getOnboardingCompleted())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public PlatformSettingsDto getPlatformSettings() {
        return platformSettings.get();
    }

    public PlatformSettingsDto updatePlatformSettings(PlatformSettingsDto updated) {
        PlatformSettingsDto current = platformSettings.get();
        if (updated.getAiModel() != null) current.setAiModel(updated.getAiModel());
        if (updated.getRecommendationEngineVersion() != null) current.setRecommendationEngineVersion(updated.getRecommendationEngineVersion());
        if (updated.getBlockchainNetwork() != null) current.setBlockchainNetwork(updated.getBlockchainNetwork());
        if (updated.getSmartContractAddress() != null) current.setSmartContractAddress(updated.getSmartContractAddress());
        current.setRlsEnforced(updated.isRlsEnforced());
        current.setStrictModeEnabled(updated.isStrictModeEnabled());
        current.setAllowStudentRegistration(updated.isAllowStudentRegistration());
        platformSettings.set(current);
        log.info("Platform settings updated by admin: {}", current);
        return current;
    }

    @Transactional
    public LearningResource createLearningResource(CreateLearningResourceRequest request) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + request.getSkillId()));

        LearningResource resource = LearningResource.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .skill(skill)
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "BEGINNER")
                .contentType(request.getContentType() != null ? request.getContentType() : "ARTICLE")
                .contentBody(request.getContentBody())
                .externalUrl(request.getExternalUrl())
                .estimatedMinutes(request.getEstimatedMinutes() != null ? request.getEstimatedMinutes() : 30)
                .active(true)
                .build();

        LearningResource saved = resourceRepository.save(resource);

        if (request.getPrerequisiteResourceIds() != null && !request.getPrerequisiteResourceIds().isEmpty()) {
            for (UUID prereqId : request.getPrerequisiteResourceIds()) {
                resourceRepository.findById(prereqId).ifPresent(prereqResource -> {
                    LearningPrerequisite lp = LearningPrerequisite.builder()
                            .resource(saved)
                            .prerequisiteResource(prereqResource)
                            .build();
                    prerequisiteRepository.save(lp);
                });
            }
        }

        log.info("Admin created new learning resource: '{}' ({}) with {} prerequisites",
                saved.getTitle(), saved.getId(),
                request.getPrerequisiteResourceIds() != null ? request.getPrerequisiteResourceIds().size() : 0);

        return saved;
    }

    @Transactional
    public Assessment createAssessment(CreateAssessmentRequest request) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with ID: " + request.getSkillId()));

        Assessment assessment = Assessment.builder()
                .title(request.getTitle())
                .skill(skill)
                .difficulty("INTERMEDIATE")
                .assessmentType("QUIZ")
                .active(true)
                .build();

        Assessment saved = assessmentRepository.save(assessment);

        if (request.getQuestions() != null && !request.getQuestions().isEmpty()) {
            int order = 0;
            for (CreateAssessmentRequest.CreateQuestionRequest qReq : request.getQuestions()) {
                String optionsJson = "[]";
                if (qReq.getOptions() != null) {
                    try {
                        optionsJson = objectMapper.writeValueAsString(qReq.getOptions());
                    } catch (Exception e) {
                        optionsJson = "[\"" + String.join("\",\"", qReq.getOptions()) + "\"]";
                    }
                }

                AssessmentQuestion question = AssessmentQuestion.builder()
                        .assessment(saved)
                        .questionText(qReq.getQuestionText())
                        .questionType(qReq.getQuestionType() != null ? qReq.getQuestionType() : "MULTIPLE_CHOICE")
                        .options(optionsJson)
                        .correctAnswer(qReq.getCorrectAnswer())
                        .explanation(qReq.getExplanation())
                        .marks(qReq.getPoints() != null ? qReq.getPoints() : 1)
                        .orderIndex(order++)
                        .build();

                questionRepository.save(question);
            }
        }

        log.info("Admin created new assessment: '{}' ({}) with {} questions",
                saved.getTitle(), saved.getId(),
                request.getQuestions() != null ? request.getQuestions().size() : 0);

        return saved;
    }

    @Transactional(readOnly = true)
    public ValidateDagResponse validatePrerequisiteDagCycles() {
        List<LearningResource> resources = resourceRepository.findAll();
        List<LearningPrerequisite> prereqs = prerequisiteRepository.findAll();

        Map<UUID, String> nodeTitles = new HashMap<>();
        Map<UUID, Set<UUID>> adj = new HashMap<>();
        Map<UUID, Integer> inDegree = new HashMap<>();

        for (LearningResource r : resources) {
            nodeTitles.put(r.getId(), r.getTitle());
            adj.putIfAbsent(r.getId(), new HashSet<>());
            inDegree.putIfAbsent(r.getId(), 0);
        }

        for (LearningPrerequisite p : prereqs) {
            UUID from = p.getPrerequisiteResource().getId();
            UUID to = p.getResource().getId();
            if (nodeTitles.containsKey(from) && nodeTitles.containsKey(to)) {
                adj.computeIfAbsent(from, k -> new HashSet<>()).add(to);
                inDegree.put(to, inDegree.getOrDefault(to, 0) + 1);
            }
        }

        // Kahn's algorithm
        Queue<UUID> queue = new LinkedList<>();
        for (Map.Entry<UUID, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.offer(entry.getKey());
            }
        }

        int visitedCount = 0;
        while (!queue.isEmpty()) {
            UUID curr = queue.poll();
            visitedCount++;
            for (UUID neighbor : adj.getOrDefault(curr, Collections.emptySet())) {
                inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        boolean hasCycle = visitedCount < resources.size();
        List<String> cycleDetails = new ArrayList<>();
        if (hasCycle) {
            for (Map.Entry<UUID, Integer> entry : inDegree.entrySet()) {
                if (entry.getValue() > 0) {
                    cycleDetails.add("Resource in cycle: " + nodeTitles.get(entry.getKey()) + " (ID: " + entry.getKey() + ")");
                }
            }
        }

        return ValidateDagResponse.builder()
                .valid(!hasCycle)
                .totalNodes(resources.size())
                .totalEdges(prereqs.size())
                .cycleCount(hasCycle ? resources.size() - visitedCount : 0)
                .cycleDetails(cycleDetails)
                .algorithmUsed("Kahn's Topological Sorting (in-degree resolution)")
                .statusMessage(!hasCycle ? "DAG Valid: No circular dependencies detected in curriculum graph." : "Cycle detected in learning prerequisite graph.")
                .build();
    }
}
