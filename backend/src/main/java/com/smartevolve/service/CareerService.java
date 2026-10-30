package com.smartevolve.service;

import com.smartevolve.ai.CareerMatchingEngine;
import com.smartevolve.ai.SkillGapAnalyzer;
import com.smartevolve.dto.CareerDetailDto;
import com.smartevolve.dto.CareerDto;
import com.smartevolve.entity.Career;
import com.smartevolve.entity.CareerSkill;
import com.smartevolve.entity.Profile;
import com.smartevolve.entity.StudentCareerPreference;
import com.smartevolve.entity.StudentSkill;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CareerService {

    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final StudentCareerPreferenceRepository preferenceRepository;
    private final ProfileRepository profileRepository;
    private final CareerMatchingEngine careerMatchingEngine;
    private final SkillGapAnalyzer skillGapAnalyzer;
    private final RoadmapService roadmapService;

    public CareerService(
            CareerRepository careerRepository,
            CareerSkillRepository careerSkillRepository,
            StudentSkillRepository studentSkillRepository,
            StudentCareerPreferenceRepository preferenceRepository,
            ProfileRepository profileRepository,
            CareerMatchingEngine careerMatchingEngine,
            SkillGapAnalyzer skillGapAnalyzer,
            @Lazy RoadmapService roadmapService) {
        this.careerRepository = careerRepository;
        this.careerSkillRepository = careerSkillRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.preferenceRepository = preferenceRepository;
        this.profileRepository = profileRepository;
        this.careerMatchingEngine = careerMatchingEngine;
        this.skillGapAnalyzer = skillGapAnalyzer;
        this.roadmapService = roadmapService;
    }

    @Transactional(readOnly = true)
    public List<CareerDto> getAllCareersWithCompatibility(UUID studentId) {
        List<Career> careers = careerRepository.findByActiveTrue();
        Map<UUID, BigDecimal> studentSkillMap = getStudentSkillMap(studentId);

        return careers.stream().map(c -> {
            List<CareerSkill> reqs = careerSkillRepository.findByCareerIdWithSkill(c.getId());
            List<SkillGapAnalyzer.CareerSkillRequirement> requirements = reqs.stream()
                    .map(r -> SkillGapAnalyzer.CareerSkillRequirement.builder()
                            .skillId(r.getSkill().getId())
                            .skillName(r.getSkill().getName())
                            .category(r.getSkill().getCategory())
                            .requiredProficiency(r.getRequiredProficiency())
                            .importanceWeight(r.getImportanceWeight())
                            .build())
                    .collect(Collectors.toList());

            var match = careerMatchingEngine.evaluateCompatibility(
                    c.getId(), c.getName(), c.getCategory(), studentSkillMap, requirements);

            String difficulty = computeCareerDifficulty(c.getName(), c.getCategory());
            int weeks = computeEstimatedWeeks(difficulty);

            return CareerDto.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .description(c.getDescription())
                    .category(c.getCategory())
                    .compatibilityScore(match.getCompatibilityScore())
                    .readinessLevel(match.getReadinessLevel())
                    .requiredSkillsCount(requirements.size())
                    .difficulty(difficulty)
                    .estimatedPreparationWeeks(weeks)
                    .build();
        }).sorted((a, b) -> b.getCompatibilityScore().compareTo(a.getCompatibilityScore()))
          .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CareerDetailDto getCareerDetail(UUID studentId, UUID careerId) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new ResourceNotFoundException("Career not found: " + careerId));

        Map<UUID, BigDecimal> studentSkillMap = getStudentSkillMap(studentId);
        List<CareerSkill> reqs = careerSkillRepository.findByCareerIdWithSkill(careerId);

        List<SkillGapAnalyzer.CareerSkillRequirement> requirements = reqs.stream()
                .map(r -> SkillGapAnalyzer.CareerSkillRequirement.builder()
                        .skillId(r.getSkill().getId())
                        .skillName(r.getSkill().getName())
                        .category(r.getSkill().getCategory())
                        .requiredProficiency(r.getRequiredProficiency())
                        .importanceWeight(r.getImportanceWeight())
                        .build())
                .collect(Collectors.toList());

        var match = careerMatchingEngine.evaluateCompatibility(
                career.getId(), career.getName(), career.getCategory(), studentSkillMap, requirements);

        List<SkillGapAnalyzer.SkillGapItem> gaps = skillGapAnalyzer.analyzeGaps(studentSkillMap, requirements);

        boolean isGoal = preferenceRepository.findByStudentIdAndCareerId(studentId, careerId)
                .map(p -> p.getPreferenceRank() == 1)
                .orElse(false);

        String difficulty = computeCareerDifficulty(career.getName(), career.getCategory());
        int weeks = computeEstimatedWeeks(difficulty);

        return CareerDetailDto.builder()
                .id(career.getId())
                .name(career.getName())
                .description(career.getDescription())
                .category(career.getCategory())
                .isCurrentGoal(isGoal)
                .compatibilityScore(match.getCompatibilityScore())
                .readinessLevel(match.getReadinessLevel())
                .difficulty(difficulty)
                .estimatedPreparationWeeks(weeks)
                .explanation(match.getExplanation())
                .matchedSkills(match.getMatchedSkills())
                .partiallyMatchedSkills(match.getPartiallyMatchedSkills())
                .missingSkills(match.getMissingSkills())
                .skillGaps(gaps)
                .build();
    }

    @Transactional
    public void setCareerGoal(UUID studentId, UUID careerId) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new ResourceNotFoundException("Career not found: " + careerId));

        // Demote previous rank 1 preferences so the selected career is uniquely the primary goal
        List<StudentCareerPreference> existing = preferenceRepository.findByStudentIdOrderByPreferenceRankAsc(studentId);
        for (StudentCareerPreference p : existing) {
            if (!p.getCareer().getId().equals(careerId) && p.getPreferenceRank() == 1) {
                p.setPreferenceRank(2);
                preferenceRepository.save(p);
            }
        }

        StudentCareerPreference pref = preferenceRepository.findByStudentIdAndCareerId(studentId, careerId)
                .orElse(StudentCareerPreference.builder()
                        .student(profile)
                        .career(career)
                        .preferenceRank(1)
                        .build());

        pref.setPreferenceRank(1);
        preferenceRepository.save(pref);
        log.info("Set career goal for student {} to career {}", studentId, career.getName());

        // Automatically generate or refresh personalized roadmap for this career
        roadmapService.generateOrRefreshRoadmap(studentId, careerId);
    }

    public static String computeCareerDifficulty(String name, String category) {
        String lower = (name + " " + category).toLowerCase();
        if (lower.contains("data analyst") || lower.contains("frontend") || lower.contains("python developer")) {
            return "BEGINNER_FRIENDLY";
        } else if (lower.contains("ai") || lower.contains("machine learning") || lower.contains("data scientist") || lower.contains("cloud engineer")) {
            return "ADVANCED";
        }
        return "INTERMEDIATE";
    }

    public static int computeEstimatedWeeks(String difficulty) {
        switch (difficulty) {
            case "BEGINNER_FRIENDLY": return 8;
            case "ADVANCED": return 16;
            default: return 12;
        }
    }

    private Map<UUID, BigDecimal> getStudentSkillMap(UUID studentId) {
        List<StudentSkill> skills = studentSkillRepository.findByStudentId(studentId);
        Map<UUID, BigDecimal> map = new HashMap<>();
        for (StudentSkill s : skills) {
            map.put(s.getSkill().getId(), s.getProficiency());
        }
        return map;
    }
}
