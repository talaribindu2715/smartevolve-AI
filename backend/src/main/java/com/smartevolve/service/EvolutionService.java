package com.smartevolve.service;

import com.smartevolve.ai.PerformanceTrendAnalyzer;
import com.smartevolve.dto.EvolutionHistoryDto;
import com.smartevolve.entity.SkillEvolutionHistory;
import com.smartevolve.entity.StudentSkill;
import com.smartevolve.repository.SkillEvolutionHistoryRepository;
import com.smartevolve.repository.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class EvolutionService {

    private final SkillEvolutionHistoryRepository historyRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final PerformanceTrendAnalyzer trendAnalyzer;

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
