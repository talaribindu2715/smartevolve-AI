package com.smartevolve.service;

import com.smartevolve.dto.*;
import com.smartevolve.entity.LearningResource;
import com.smartevolve.entity.MentorStudentAssignment;
import com.smartevolve.entity.Profile;
import com.smartevolve.entity.Recommendation;
import com.smartevolve.exception.ForbiddenException;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.LearningProgressRepository;
import com.smartevolve.repository.LearningResourceRepository;
import com.smartevolve.repository.MentorStudentAssignmentRepository;
import com.smartevolve.repository.ProfileRepository;
import com.smartevolve.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorStudentAssignmentRepository assignmentRepository;
    private final ProfileRepository profileRepository;
    private final AnalyticsService analyticsService;
    private final SkillService skillService;
    private final CredentialService credentialService;
    private final LearningProgressRepository progressRepository;
    private final LearningResourceRepository resourceRepository;
    private final RecommendationRepository recommendationRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public MentorDashboardDto getMentorDashboard(UUID mentorId) {
        Profile mentor = profileRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor profile not found with ID: " + mentorId));

        List<AssignedStudentDto> students = getAssignedStudents(mentorId);

        BigDecimal avgProf = BigDecimal.ZERO;
        if (!students.isEmpty()) {
            BigDecimal sum = BigDecimal.ZERO;
            for (AssignedStudentDto s : students) {
                if (s.getOverallProficiency() != null) {
                    sum = sum.add(s.getOverallProficiency());
                }
            }
            avgProf = sum.divide(BigDecimal.valueOf(students.size()), 1, RoundingMode.HALF_UP);
        }

        long activeRoadmaps = students.stream()
                .filter(s -> s.getCareerReadiness() != null && s.getCareerReadiness().compareTo(BigDecimal.ZERO) > 0)
                .count();

        return MentorDashboardDto.builder()
                .mentorId(mentor.getId())
                .mentorName(mentor.getFullName())
                .institution(mentor.getInstitution())
                .branch(mentor.getBranch())
                .totalAssignedStudents(students.size())
                .averageCohortProficiency(avgProf)
                .activeRoadmapsCount(activeRoadmaps)
                .students(students)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AssignedStudentDto> getAssignedStudents(UUID mentorId) {
        List<MentorStudentAssignment> assignments = assignmentRepository.findByMentorIdAndStatus(mentorId, "ACTIVE");
        List<AssignedStudentDto> result = new ArrayList<>();

        for (MentorStudentAssignment a : assignments) {
            Profile s = a.getStudent();
            DashboardSummaryDto summary = analyticsService.getDashboardSummary(s.getId());
            List<StudentSkillDto> skills = skillService.getStudentSkills(s.getId());
            long completedModules = progressRepository.countByStudentIdAndStatus(s.getId(), "COMPLETED");

            AssignedStudentDto dto = AssignedStudentDto.builder()
                    .studentId(s.getId())
                    .fullName(s.getFullName())
                    .branch(s.getBranch())
                    .institution(s.getInstitution())
                    .graduationYear(s.getGraduationYear())
                    .targetCareerName(summary.getTargetCareerName())
                    .overallProficiency(summary.getOverallProficiency())
                    .careerReadiness(summary.getCareerReadinessScore())
                    .readinessLevel(summary.getReadinessLevel())
                    .completedModulesCount(completedModules)
                    .assignmentStatus(a.getStatus())
                    .mentorNotes(a.getNotes())
                    .topSkills(skills.stream().limit(5).collect(Collectors.toList()))
                    .assignedAt(a.getAssignedAt())
                    .build();
            result.add(dto);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getStudentDetailsForMentor(UUID mentorId, UUID studentId) {
        assertMentorAccess(mentorId, studentId);
        return analyticsService.getDashboardSummary(studentId);
    }

    @Transactional(readOnly = true)
    public CandidateDossierDto getStudentDossierForMentor(UUID mentorId, UUID studentId) {
        assertMentorAccess(mentorId, studentId);

        Profile s = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        DashboardSummaryDto summary = analyticsService.getDashboardSummary(studentId);
        List<StudentSkillDto> skills = skillService.getStudentSkills(studentId);
        List<CredentialDto> credentials = credentialService.getStudentCredentials(studentId);
        RoadmapDto roadmap = summary.getActiveRoadmap();

        List<String> interests = new ArrayList<>();
        if (s.getInterests() != null && !s.getInterests().isBlank()) {
            interests = Arrays.stream(s.getInterests().split(","))
                    .map(String::trim)
                    .filter(str -> !str.isEmpty())
                    .collect(Collectors.toList());
        }

        return CandidateDossierDto.builder()
                .studentId(s.getId())
                .fullName(s.getFullName())
                .educationLevel(s.getEducationLevel())
                .institution(s.getInstitution())
                .branch(s.getBranch())
                .graduationYear(s.getGraduationYear())
                .interests(interests)
                .academicGoals(s.getAcademicGoals())
                .targetCareerName(summary.getTargetCareerName())
                .careerReadiness(summary.getCareerReadinessScore())
                .readinessLevel(summary.getReadinessLevel())
                .overallProficiency(summary.getOverallProficiency())
                .skills(skills)
                .verifiedCredentials(credentials)
                .roadmapMilestones(roadmap != null ? roadmap.getSteps() : Collections.emptyList())
                .sharedAt(s.getCreatedAt())
                .build();
    }

    @Transactional
    public AssignedStudentDto addMentorFeedback(UUID mentorId, UUID studentId, MentorFeedbackRequest request) {
        assertMentorAccess(mentorId, studentId);

        MentorStudentAssignment assignment = assignmentRepository.findByMentorIdAndStudentId(mentorId, studentId)
                .orElseThrow(() -> new ForbiddenException("Student is not assigned to this mentor."));

        assignment.setNotes(request.getFeedbackText());
        MentorStudentAssignment saved = assignmentRepository.save(assignment);

        Profile s = saved.getStudent();
        DashboardSummaryDto summary = analyticsService.getDashboardSummary(s.getId());
        List<StudentSkillDto> skills = skillService.getStudentSkills(s.getId());

        return AssignedStudentDto.builder()
                .studentId(s.getId())
                .fullName(s.getFullName())
                .branch(s.getBranch())
                .institution(s.getInstitution())
                .graduationYear(s.getGraduationYear())
                .targetCareerName(summary.getTargetCareerName())
                .overallProficiency(summary.getOverallProficiency())
                .careerReadiness(summary.getCareerReadinessScore())
                .readinessLevel(summary.getReadinessLevel())
                .assignmentStatus(saved.getStatus())
                .mentorNotes(saved.getNotes())
                .topSkills(skills.stream().limit(5).collect(Collectors.toList()))
                .assignedAt(saved.getAssignedAt())
                .build();
    }

    public void assertMentorAccess(UUID mentorId, UUID studentId) {
        boolean assigned = assignmentRepository.existsByMentorIdAndStudentIdAndStatus(mentorId, studentId, "ACTIVE");
        if (!assigned) {
            log.warn("Access Denied: Mentor {} attempted to access unassigned student {}", mentorId, studentId);
            throw new ForbiddenException("Access Denied: Mentors can access only their assigned students.");
        }
    }

    @Transactional
    public Recommendation assignResourceToStudent(UUID mentorId, MentorAssignResourceRequest request) {
        assertMentorAccess(mentorId, request.getStudentId());

        Profile mentor = profileRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor profile not found with ID: " + mentorId));
        Profile student = profileRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with ID: " + request.getStudentId()));

        LearningResource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Learning resource not found with ID: " + request.getResourceId()));

        String reason = "Assigned by Mentor " + mentor.getFullName()
                + (request.getNote() != null && !request.getNote().trim().isEmpty() ? ": " + request.getNote().trim() : "");

        Recommendation recommendation = Recommendation.builder()
                .student(student)
                .skill(resource.getSkill())
                .resource(resource)
                .recommendationType("MENTOR_ASSIGNED")
                .priority(request.getPriority() != null ? request.getPriority() : "HIGH")
                .reason(reason)
                .status("ACTIVE")
                .profileVersion(1)
                .build();

        Recommendation saved = recommendationRepository.save(recommendation);

        try {
            notificationService.createNotification(
                    student.getId(),
                    "Mentor Assignment: " + resource.getTitle(),
                    mentor.getFullName() + " assigned you a learning module: " + resource.getTitle(),
                    "MENTOR_ASSIGNED",
                    "/learning/" + resource.getId()
            );
        } catch (Exception ex) {
            log.warn("Failed to create notification for student {}: {}", student.getId(), ex.getMessage());
        }

        log.info("Mentor {} assigned resource '{}' to student {}", mentorId, resource.getTitle(), student.getId());
        return saved;
    }
}
