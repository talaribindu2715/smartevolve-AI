package com.smartevolve.service;

import com.smartevolve.ai.PerformanceTrendAnalyzer;
import com.smartevolve.dto.EvolutionHistoryDto;
import com.smartevolve.entity.SkillEvolutionHistory;
import com.smartevolve.entity.StudentSkill;
import com.smartevolve.repository.SkillEvolutionHistoryRepository;
import com.smartevolve.repository.StudentCareerPreferenceRepository;
import com.smartevolve.repository.StudentSkillRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class EvolutionService {

    private final SkillEvolutionHistoryRepository historyRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final PerformanceTrendAnalyzer trendAnalyzer;
    private final StudentCareerPreferenceRepository preferenceRepository;
    @org.springframework.context.annotation.Lazy
    private final RoadmapService roadmapService;

    public EvolutionService(
            SkillEvolutionHistoryRepository historyRepository,
            StudentSkillRepository studentSkillRepository,
            PerformanceTrendAnalyzer trendAnalyzer,
            StudentCareerPreferenceRepository preferenceRepository,
            @org.springframework.context.annotation.Lazy RoadmapService roadmapService) {
        this.historyRepository = historyRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.trendAnalyzer = trendAnalyzer;
        this.preferenceRepository = preferenceRepository;
        this.roadmapService = roadmapService;
    }

    @Transactional
    public PerformanceTrendAnalyzer.TrendAnalysisSummary triggerEvolutionCycle(UUID studentId) {
        log.info("Triggering comprehensive AI evolution recalculation for student {}", studentId);

        // Refresh roadmap and recommendations for active career goal if set
        var prefOpt = preferenceRepository.findFirstByStudentIdOrderByPreferenceRankAsc(studentId);
        if (prefOpt.isPresent()) {
            roadmapService.generateOrRefreshRoadmap(studentId, prefOpt.get().getCareer().getId());
        }

        return getTrendAnalysis(studentId);
    }

    @Transactional(readOnly = true)
    public List<EvolutionHistoryDto> getEvolutionHistory(UUID studentId) {
        return historyRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PerformanceTrendAnalyzer.TrendAnalysisSummary getTrendAnalysis(UUID studentId) {
        Map<UUID, BigDecimal> skillMap = studentSkillRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(ss -> ss.getSkill().getId(), StudentSkill::getProficiency, (a, b) -> a));

        List<PerformanceTrendAnalyzer.EvolutionEventDTO> events = historyRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(h -> PerformanceTrendAnalyzer.EvolutionEventDTO.builder()
                        .skillId(h.getSkill().getId())
                        .skillName(h.getSkill().getName())
                        .previousProficiency(h.getPreviousProficiency())
                        .newProficiency(h.getNewProficiency())
                        .delta(h.getNewProficiency().subtract(h.getPreviousProficiency()))
                        .changeReason(h.getChangeReason())
                        .evidenceType(h.getEvidenceType())
                        .timestamp(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return trendAnalyzer.analyzeTrends(skillMap, events);
    }

    private EvolutionHistoryDto mapToDto(SkillEvolutionHistory h) {
        return EvolutionHistoryDto.builder()
                .id(h.getId())
                .skillId(h.getSkill().getId())
                .skillName(h.getSkill().getName())
                .category(h.getSkill().getCategory())
                .previousProficiency(h.getPreviousProficiency())
                .newProficiency(h.getNewProficiency())
                .delta(h.getNewProficiency().subtract(h.getPreviousProficiency()))
                .changeReason(h.getChangeReason())
                .evidenceType(h.getEvidenceType())
                .evidenceReference(h.getEvidenceReference())
                .profileVersion(h.getProfileVersion())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
