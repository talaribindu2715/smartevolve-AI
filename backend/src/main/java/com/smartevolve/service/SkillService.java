package com.smartevolve.service;

import com.smartevolve.ai.ProficiencyCalculator;
import com.smartevolve.dto.SaveStudentSkillRequest;
import com.smartevolve.dto.SkillDto;
import com.smartevolve.dto.StudentSkillDto;
import com.smartevolve.entity.Profile;
import com.smartevolve.entity.Skill;
import com.smartevolve.entity.SkillEvolutionHistory;
import com.smartevolve.entity.StudentSkill;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.ProfileRepository;
import com.smartevolve.repository.SkillEvolutionHistoryRepository;
import com.smartevolve.repository.SkillRepository;
import com.smartevolve.repository.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final ProfileRepository profileRepository;
    private final SkillEvolutionHistoryRepository evolutionHistoryRepository;
    private final ProficiencyCalculator proficiencyCalculator;

    @Transactional(readOnly = true)
    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(s -> SkillDto.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .category(s.getCategory())
                        .description(s.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentSkillDto> getStudentSkills(UUID studentId) {
        return studentSkillRepository.findByStudentIdOrderByProficiencyDesc(studentId).stream()
                .map(this::mapToStudentSkillDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentSkillDto saveStudentSkill(UUID studentId, SaveStudentSkillRequest request) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found: " + studentId));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + request.getSkillId()));

        BigDecimal targetProficiency = request.getProficiency();
        if (request.getSelfRating1To5() != null) {
            targetProficiency = proficiencyCalculator.calculateInitialSelfReportProficiency(request.getSelfRating1To5());
        }

        StudentSkill studentSkill = studentSkillRepository
                .findByStudentIdAndSkillId(studentId, request.getSkillId())
                .orElse(StudentSkill.builder()
                        .student(profile)
                        .skill(skill)
                        .proficiency(BigDecimal.ZERO)
                        .confidence(new BigDecimal("0.40"))
                        .evidenceType("SELF_REPORTED")
                        .build());

        BigDecimal prevProficiency = studentSkill.getProficiency();
        studentSkill.setProficiency(targetProficiency);
        studentSkill.setEvidenceType("SELF_REPORTED");
        studentSkill.setLastAssessedAt(OffsetDateTime.now());

        StudentSkill saved = studentSkillRepository.save(studentSkill);

        // Record evolution history
        if (prevProficiency.compareTo(targetProficiency) != 0) {
            String reason = String.format("Self-reported skill proficiency initialized/updated to %.1f%%.", targetProficiency.doubleValue());
            SkillEvolutionHistory history = SkillEvolutionHistory.builder()
                    .student(profile)
                    .skill(skill)
                    .previousProficiency(prevProficiency)
                    .newProficiency(targetProficiency)
                    .changeReason(reason)
                    .evidenceType("SELF_ASSESSMENT")
                    .evidenceReference("Initial Profile Assessment")
                    .build();
            evolutionHistoryRepository.save(history);
            log.info("Recorded skill evolution for student {} on skill {}", studentId, skill.getName());
        }

        return mapToStudentSkillDto(saved);
    }

    private StudentSkillDto mapToStudentSkillDto(StudentSkill ss) {
        return StudentSkillDto.builder()
                .id(ss.getId())
                .skillId(ss.getSkill().getId())
                .skillName(ss.getSkill().getName())
                .category(ss.getSkill().getCategory())
                .proficiency(ss.getProficiency())
                .confidence(ss.getConfidence())
                .evidenceType(ss.getEvidenceType())
                .lastAssessedAt(ss.getLastAssessedAt())
                .build();
    }
}
