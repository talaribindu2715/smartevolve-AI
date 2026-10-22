package com.smartevolve.service;

import com.smartevolve.ai.AdaptiveRecommendationEngine;
import com.smartevolve.ai.PrerequisiteResolver;
import com.smartevolve.ai.SkillGapAnalyzer;
import com.smartevolve.dto.RoadmapDto;
import com.smartevolve.dto.RoadmapStepDto;
import com.smartevolve.entity.*;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RoadmapService {

    private final LearningRoadmapRepository roadmapRepository;
    private final RoadmapStepRepository stepRepository;
    private final ProfileRepository profileRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final LearningResourceRepository resourceRepository;
    private final LearningPrerequisiteRepository prerequisiteRepository;
    private final LearningProgressRepository progressRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentCareerPreferenceRepository preferenceRepository;
    private final RecommendationRepository recommendationRepository;
    private final SkillGapAnalyzer skillGapAnalyzer;
    private final PrerequisiteResolver prerequisiteResolver;
    private final AdaptiveRecommendationEngine recommendationEngine;

    public RoadmapService(
            LearningRoadmapRepository roadmapRepository,
            RoadmapStepRepository stepRepository,
            ProfileRepository profileRepository,
            CareerRepository careerRepository,
            CareerSkillRepository careerSkillRepository,
            LearningResourceRepository resourceRepository,
            LearningPrerequisiteRepository prerequisiteRepository,
            LearningProgressRepository progressRepository,
            StudentSkillRepository studentSkillRepository,
            StudentCareerPreferenceRepository preferenceRepository,
            RecommendationRepository recommendationRepository,
            SkillGapAnalyzer skillGapAnalyzer,
            PrerequisiteResolver prerequisiteResolver,
            AdaptiveRecommendationEngine recommendationEngine) {
        this.roadmapRepository = roadmapRepository;
        this.stepRepository = stepRepository;
        this.profileRepository = profileRepository;
        this.careerRepository = careerRepository;
        this.careerSkillRepository = careerSkillRepository;
        this.resourceRepository = resourceRepository;
        this.prerequisiteRepository = prerequisiteRepository;
        this.progressRepository = progressRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.preferenceRepository = preferenceRepository;
        this.recommendationRepository = recommendationRepository;
        this.skillGapAnalyzer = skillGapAnalyzer;
        this.prerequisiteResolver = prerequisiteResolver;
        this.recommendationEngine = recommendationEngine;
    }

    @Transactional(readOnly = true)
    public Optional<RoadmapDto> getActiveRoadmap(UUID studentId) {
        Optional<LearningRoadmap> roadmapOpt = roadmapRepository.findFirstByStudentIdAndStatusOrderByVersionDesc(studentId, "ACTIVE");
        if (roadmapOpt.isEmpty()) {
            // Check if student has a career preference and auto-generate
            Optional<StudentCareerPreference> prefOpt = preferenceRepository.findFirstByStudentIdOrderByPreferenceRankAsc(studentId);
            if (prefOpt.isPresent()) {
                return Optional.of(generateOrRefreshRoadmap(studentId, prefOpt.get().getCareer().getId()));
            }
            return Optional.empty();
        }
        return Optional.of(mapToDto(roadmapOpt.get()));
    }

    @Transactional
    public RoadmapDto generateOrRefreshRoadmap(UUID studentId, UUID careerId) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new ResourceNotFoundException("Career not found: " + careerId));

        log.info("Generating prerequisite-aware adaptive roadmap for student {} and career {}", studentId, career.getName());

        // Archive previous active roadmaps
        List<LearningRoadmap> previous = roadmapRepository.findByStudentIdOrderByGeneratedAtDesc(studentId);
        int nextVersion = 1;
        for (LearningRoadmap r : previous) {
            r.setStatus("ARCHIVED");
            roadmapRepository.save(r);
            if (r.getVersion() >= nextVersion) {
                nextVersion = r.getVersion() + 1;
            }
        }

        // 1. Analyze skill gaps for career
        List<CareerSkill> reqs = careerSkillRepository.findByCareerIdWithSkill(careerId);
        Map<UUID, BigDecimal> studentSkillMap = studentSkillRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(ss -> ss.getSkill().getId(), StudentSkill::getProficiency, (a, b) -> a));

        List<SkillGapAnalyzer.CareerSkillRequirement> requirements = reqs.stream()
                .map(r -> SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(r.getSkill().getId())
                        .skillName(r.getSkill().getName())
                        .category(r.getSkill().getCategory())
                        .requiredProficiency(r.getRequiredProficiency())
                        .importanceWeight(r.getImportanceWeight())
                        .build())
                .collect(Collectors.toList());

        List<SkillGapAnalyzer.SkillGapItem> gapItems = skillGapAnalyzer.analyzeGaps(studentSkillMap, requirements);

        // 2. Fetch all learning resources for required skills
        List<UUID> skillIds = requirements.stream().map(SkillGapAnalyzer.CareerSkillRequirement::getSkillId).toList();
        List<LearningResource> resources = resourceRepository.findBySkillIdInAndActiveTrue(skillIds);

        // Map prerequisites
        Map<UUID, Set<UUID>> prereqMap = new HashMap<>();
        for (LearningResource res : resources) {
            Set<UUID> pIds = prerequisiteRepository.findByResourceId(res.getId()).stream()
                    .map(pr -> pr.getPrerequisiteResource().getId())
                    .collect(Collectors.toSet());
            prereqMap.put(res.getId(), pIds);
        }

        // Build DAG resource nodes
        List<PrerequisiteResolver.ResourceNode> nodes = resources.stream().map(res ->
                PrerequisiteResolver.ResourceNode.builder()
                        .resourceId(res.getId())
                        .title(res.getTitle())
                        .skillId(res.getSkill().getId())
                        .difficulty(res.getDifficulty())
                        .estimatedMinutes(res.getEstimatedMinutes())
                        .prerequisiteResourceIds(prereqMap.getOrDefault(res.getId(), Collections.emptySet()))
                        .build()
        ).collect(Collectors.toList());

        // 3. Topological DAG resolution
        List<PrerequisiteResolver.ResourceNode> orderedNodes = prerequisiteResolver.resolveOrder(nodes);

        // 4. Check student's current progress
        Map<UUID, LearningProgress> progressMap = progressRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(p -> p.getResource().getId(), p -> p, (a, b) -> a));

        Set<UUID> completedIds = progressMap.values().stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .map(p -> p.getResource().getId())
                .collect(Collectors.toSet());

        Set<UUID> inProgressIds = progressMap.values().stream()
                .filter(p -> "IN_PROGRESS".equalsIgnoreCase(p.getStatus()))
                .map(p -> p.getResource().getId())
                .collect(Collectors.toSet());

        // 5. Create new LearningRoadmap entity
        LearningRoadmap roadmap = LearningRoadmap.builder()
                .student(profile)
                .career(career)
                .version(nextVersion)
                .status("ACTIVE")
                .steps(new ArrayList<>())
                .build();
        LearningRoadmap savedRoadmap = roadmapRepository.save(roadmap);

        // 6. Build RoadmapSteps with explainable reasons and unlock status
        Map<UUID, SkillGapAnalyzer.SkillGapItem> gapLookup = gapItems.stream()
                .collect(Collectors.toMap(SkillGapAnalyzer.SkillGapItem::getSkillId, g -> g, (a, b) -> a));

        int seq = 1;
        for (PrerequisiteResolver.ResourceNode node : orderedNodes) {
            String stepStatus = prerequisiteResolver.determineStepStatus(
                    node.getResourceId(),
                    node.getPrerequisiteResourceIds(),
                    completedIds,
                    inProgressIds
            );

            SkillGapAnalyzer.SkillGapItem gap = gapLookup.get(node.getSkillId());
            String priority = gap != null ? gap.getPriority() : "MEDIUM";
            String skillName = gap != null ? gap.getSkillName() : "Core Skill";
            BigDecimal gapVal = gap != null ? gap.getGap() : BigDecimal.ZERO;

            String reason = String.format("Step %d: Addresses %.1f%% deficit in %s for %s target.",
                    seq, gapVal.doubleValue(), skillName, career.getName());

            LearningResource resEntity = resourceRepository.findById(node.getResourceId()).orElse(null);
            Skill skillEntity = resEntity != null ? resEntity.getSkill() : null;

            if (resEntity != null && skillEntity != null) {
                RoadmapStep step = RoadmapStep.builder()
                        .roadmap(savedRoadmap)
                        .resource(resEntity)
                        .skill(skillEntity)
                        .sequenceNumber(seq++)
                        .priority(priority)
                        .reason(reason)
                        .status(stepStatus)
                        .build();
                stepRepository.save(step);
                savedRoadmap.getSteps().add(step);
            }
        }

        // 7. Refresh dynamic recommendations
        refreshRecommendations(profile, career, gapItems, orderedNodes, completedIds);

        return mapToDto(savedRoadmap);
    }

    @Transactional
    public void syncRoadmapStepStatus(UUID studentId, UUID resourceId, String progressStatus) {
        Optional<LearningRoadmap> activeRoadmapOpt = roadmapRepository.findFirstByStudentIdAndStatusOrderByVersionDesc(studentId, "ACTIVE");
        if (activeRoadmapOpt.isEmpty()) return;

        LearningRoadmap roadmap = activeRoadmapOpt.get();
        List<RoadmapStep> steps = stepRepository.findByRoadmapIdOrderBySequenceNumberAsc(roadmap.getId());

        Set<UUID> completedResources = progressRepository.findByStudentId(studentId).stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .map(p -> p.getResource().getId())
                .collect(Collectors.toSet());

        Set<UUID> inProgressResources = progressRepository.findByStudentId(studentId).stream()
                .filter(p -> "IN_PROGRESS".equalsIgnoreCase(p.getStatus()))
                .map(p -> p.getResource().getId())
                .collect(Collectors.toSet());

        for (RoadmapStep step : steps) {
            List<UUID> prereqIds = prerequisiteRepository.findByResourceId(step.getResource().getId()).stream()
                    .map(pr -> pr.getPrerequisiteResource().getId())
                    .collect(Collectors.toList());

            String newStatus = prerequisiteResolver.determineStepStatus(
                    step.getResource().getId(),
                    new HashSet<>(prereqIds),
                    completedResources,
                    inProgressResources
            );

            step.setStatus(newStatus);
            stepRepository.save(step);
        }
    }

    private void refreshRecommendations(
            Profile student,
            Career career,
            List<SkillGapAnalyzer.SkillGapItem> gapItems,
            List<PrerequisiteResolver.ResourceNode> orderedNodes,
            Set<UUID> completedIds) {

        // Dismiss old active recommendations
        List<Recommendation> oldRecs = recommendationRepository.findByStudentIdAndStatusOrderByCreatedAtDesc(student.getId(), "ACTIVE");
        for (Recommendation r : oldRecs) {
            r.setStatus("DISMISSED");
            recommendationRepository.save(r);
        }

        var candidates = recommendationEngine.generateRecommendations(
                career.getName(), gapItems, orderedNodes, completedIds);

        for (var cand : candidates) {
            LearningResource res = cand.getResourceId() != null
                    ? resourceRepository.findById(cand.getResourceId()).orElse(null) : null;
            Skill skill = cand.getSkillId() != null
                    ? res != null ? res.getSkill() : null : null;

            Recommendation rec = Recommendation.builder()
                    .student(student)
                    .career(career)
                    .resource(res)
                    .skill(skill)
                    .recommendationType(cand.getRecommendationType())
                    .priority(cand.getPriority())
                    .reason(cand.getReason())
                    .status("ACTIVE")
                    .profileVersion(1)
                    .build();
            recommendationRepository.save(rec);
        }
    }

    private RoadmapDto mapToDto(LearningRoadmap roadmap) {
        List<RoadmapStep> stepEntities = stepRepository.findByRoadmapIdOrderBySequenceNumberAsc(roadmap.getId());
        List<RoadmapStepDto> stepDtos = stepEntities.stream().map(s -> {
            List<UUID> prereqIds = prerequisiteRepository.findByResourceId(s.getResource().getId()).stream()
                    .map(pr -> pr.getPrerequisiteResource().getId())
                    .collect(Collectors.toList());

            return RoadmapStepDto.builder()
                    .id(s.getId())
                    .resourceId(s.getResource().getId())
                    .resourceTitle(s.getResource().getTitle())
                    .difficulty(s.getResource().getDifficulty())
                    .estimatedMinutes(s.getResource().getEstimatedMinutes())
                    .skillId(s.getSkill().getId())
                    .skillName(s.getSkill().getName())
                    .sequenceNumber(s.getSequenceNumber())
                    .priority(s.getPriority())
                    .reason(s.getReason())
                    .status(s.getStatus())
                    .prerequisiteResourceIds(prereqIds)
                    .build();
        }).collect(Collectors.toList());

        int total = stepDtos.size();
        int completed = (int) stepDtos.stream().filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus())).count();
        BigDecimal pct = total > 0
                ? BigDecimal.valueOf(completed).divide(BigDecimal.valueOf(total), 3, RoundingMode.HALF_UP).multiply(new BigDecimal("100.0")).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RoadmapDto.builder()
                .id(roadmap.getId())
                .careerId(roadmap.getCareer().getId())
                .careerName(roadmap.getCareer().getName())
                .version(roadmap.getVersion())
                .status(roadmap.getStatus())
                .totalSteps(total)
                .completedSteps(completed)
                .progressPercentage(pct)
                .generatedAt(roadmap.getGeneratedAt())
                .steps(stepDtos)
                .build();
    }
}
