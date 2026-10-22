package com.smartevolve.service;

import com.smartevolve.dto.LearningResourceDto;
import com.smartevolve.dto.UpdateProgressRequest;
import com.smartevolve.entity.*;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class LearningService {

    private final LearningResourceRepository resourceRepository;
    private final LearningPrerequisiteRepository prerequisiteRepository;
    private final LearningProgressRepository progressRepository;
    private final ProfileRepository profileRepository;
    private final RoadmapService roadmapService;

    public LearningService(
            LearningResourceRepository resourceRepository,
            LearningPrerequisiteRepository prerequisiteRepository,
            LearningProgressRepository progressRepository,
            ProfileRepository profileRepository,
            @Lazy RoadmapService roadmapService) {
        this.resourceRepository = resourceRepository;
        this.prerequisiteRepository = prerequisiteRepository;
        this.progressRepository = progressRepository;
        this.profileRepository = profileRepository;
        this.roadmapService = roadmapService;
    }

    @Transactional(readOnly = true)
    public List<LearningResourceDto> getResources(UUID studentId) {
        List<LearningResource> resources = resourceRepository.findByActiveTrue();
        Map<UUID, LearningProgress> progressMap = progressRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(p -> p.getResource().getId(), p -> p, (a, b) -> a));

        Set<UUID> completedIds = progressMap.values().stream()
                .filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus()))
                .map(p -> p.getResource().getId())
                .collect(Collectors.toSet());

        return resources.stream().map(res -> {
            List<UUID> prereqIds = prerequisiteRepository.findByResourceId(res.getId()).stream()
                    .map(pr -> pr.getPrerequisiteResource().getId())
                    .collect(Collectors.toList());

            boolean isUnlocked = prereqIds.isEmpty() || completedIds.containsAll(prereqIds);

            LearningProgress prog = progressMap.get(res.getId());
            String status = prog != null ? prog.getStatus() : "NOT_STARTED";
            BigDecimal pct = prog != null ? prog.getProgressPercentage() : BigDecimal.ZERO;

            return LearningResourceDto.builder()
                    .id(res.getId())
                    .title(res.getTitle())
                    .description(res.getDescription())
                    .skillId(res.getSkill().getId())
                    .skillName(res.getSkill().getName())
                    .difficulty(res.getDifficulty())
                    .contentType(res.getContentType())
                    .contentBody(res.getContentBody())
                    .externalUrl(res.getExternalUrl())
                    .estimatedMinutes(res.getEstimatedMinutes())
                    .prerequisiteResourceIds(prereqIds)
                    .progressStatus(status)
                    .progressPercentage(pct)
                    .isUnlocked(isUnlocked)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LearningResourceDto getResourceDetail(UUID studentId, UUID resourceId) {
        LearningResource res = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning resource not found: " + resourceId));

        List<UUID> prereqIds = prerequisiteRepository.findByResourceId(resourceId).stream()
                .map(pr -> pr.getPrerequisiteResource().getId())
                .collect(Collectors.toList());

        Optional<LearningProgress> progOpt = progressRepository.findByStudentIdAndResourceId(studentId, resourceId);
        String status = progOpt.map(LearningProgress::getStatus).orElse("NOT_STARTED");
        BigDecimal pct = progOpt.map(LearningProgress::getProgressPercentage).orElse(BigDecimal.ZERO);

        return LearningResourceDto.builder()
                .id(res.getId())
                .title(res.getTitle())
                .description(res.getDescription())
                .skillId(res.getSkill().getId())
                .skillName(res.getSkill().getName())
                .difficulty(res.getDifficulty())
                .contentType(res.getContentType())
                .contentBody(res.getContentBody())
                .externalUrl(res.getExternalUrl())
                .estimatedMinutes(res.getEstimatedMinutes())
                .prerequisiteResourceIds(prereqIds)
                .progressStatus(status)
                .progressPercentage(pct)
                .isUnlocked(true)
                .build();
    }

    @Transactional
    public LearningResourceDto updateProgress(UUID studentId, UpdateProgressRequest request) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        LearningResource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + request.getResourceId()));

        LearningProgress progress = progressRepository
                .findByStudentIdAndResourceId(studentId, request.getResourceId())
                .orElse(LearningProgress.builder()
                        .student(profile)
                        .resource(resource)
                        .status("NOT_STARTED")
                        .progressPercentage(BigDecimal.ZERO)
                        .startedAt(OffsetDateTime.now())
                        .build());

        String newStatus = request.getStatus();
        BigDecimal newPct = request.getProgressPercentage() != null ? request.getProgressPercentage() : BigDecimal.ZERO;

        if ("COMPLETED".equalsIgnoreCase(newStatus) || newPct.compareTo(new BigDecimal("100.0")) >= 0) {
            newStatus = "COMPLETED";
            newPct = new BigDecimal("100.00");
            progress.setCompletedAt(OffsetDateTime.now());
        } else if ("IN_PROGRESS".equalsIgnoreCase(newStatus) && progress.getStartedAt() == null) {
            progress.setStartedAt(OffsetDateTime.now());
        }

        progress.setStatus(newStatus);
        progress.setProgressPercentage(newPct);
        progressRepository.save(progress);

        log.info("Student {} updated progress on resource {}: status={}, pct={}%",
                studentId, resource.getTitle(), newStatus, newPct);

        // Notify roadmap service to refresh unlock states
        roadmapService.syncRoadmapStepStatus(studentId, resource.getId(), newStatus);

        return getResourceDetail(studentId, resource.getId());
    }
}
