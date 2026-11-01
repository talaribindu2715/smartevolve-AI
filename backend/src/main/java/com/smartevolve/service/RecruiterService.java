package com.smartevolve.service;

import com.smartevolve.dto.*;
import com.smartevolve.entity.Profile;
import com.smartevolve.entity.RecruiterProfileShare;
import com.smartevolve.exception.BadRequestException;
import com.smartevolve.exception.ForbiddenException;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.CredentialRepository;
import com.smartevolve.repository.ProfileRepository;
import com.smartevolve.repository.RecruiterProfileShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileShareRepository shareRepository;
    private final ProfileRepository profileRepository;
    private final AnalyticsService analyticsService;
    private final SkillService skillService;
    private final CredentialService credentialService;
    private final CredentialRepository credentialRepository;

    @Transactional(readOnly = true)
    public RecruiterDashboardDto getRecruiterDashboard(UUID recruiterId) {
        Profile recruiter = profileRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found with ID: " + recruiterId));

        List<CandidateSummaryDto> candidates = getSharedCandidates(recruiterId);

        long totalVerifiedCredentials = credentialRepository.count();

        return RecruiterDashboardDto.builder()
                .recruiterId(recruiter.getId())
                .recruiterName(recruiter.getFullName())
                .organization(recruiter.getInstitution() != null ? recruiter.getInstitution() : "Apex Talent Partner")
                .sharedCandidatesCount(candidates.size())
                .verifiedCredentialsCount(totalVerifiedCredentials)
                .candidates(candidates)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CandidateSummaryDto> getSharedCandidates(UUID recruiterId) {
        List<RecruiterProfileShare> shares = shareRepository.findByRecruiterIdAndStatus(recruiterId, "ACTIVE");
        List<CandidateSummaryDto> result = new ArrayList<>();

        for (RecruiterProfileShare share : shares) {
            Profile s = share.getStudent();
            DashboardSummaryDto summary = analyticsService.getDashboardSummary(s.getId());
            List<StudentSkillDto> skills = skillService.getStudentSkills(s.getId());
            long credCount = credentialRepository.countByStudentId(s.getId());

            CandidateSummaryDto dto = CandidateSummaryDto.builder()
                    .studentId(s.getId())
                    .fullName(s.getFullName())
                    .educationLevel(s.getEducationLevel())
                    .institution(s.getInstitution())
                    .branch(s.getBranch())
                    .graduationYear(s.getGraduationYear())
                    .targetCareerName(summary.getTargetCareerName())
                    .readinessLevel(summary.getReadinessLevel())
                    .careerReadiness(summary.getCareerReadinessScore())
                    .overallProficiency(summary.getOverallProficiency())
                    .verifiedCredentialsCount(credCount)
                    .topSkills(skills.stream().limit(5).collect(Collectors.toList()))
                    .sharedAt(share.getSharedAt())
                    .shareNotes(share.getNotes())
                    .build();
            result.add(dto);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public CandidateDossierDto getCandidateDossier(UUID recruiterId, UUID studentId) {
        assertRecruiterAccess(recruiterId, studentId);

        Profile s = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + studentId));

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

        RecruiterProfileShare share = shareRepository.findByRecruiterIdAndStudentId(recruiterId, studentId).orElse(null);

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
                .sharedAt(share != null ? share.getSharedAt() : s.getCreatedAt())
                .build();
    }

    @Transactional
    public ProfileShareDto shareProfileWithRecruiter(UUID studentId, UUID recruiterId, String notes) {
        if (studentId.equals(recruiterId)) {
            throw new BadRequestException("Students cannot share profiles with themselves.");
        }

        Profile student = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        Profile recruiter = profileRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + recruiterId));

        RecruiterProfileShare share = shareRepository.findByRecruiterIdAndStudentId(recruiterId, studentId)
                .orElseGet(() -> RecruiterProfileShare.builder()
                        .recruiter(recruiter)
                        .student(student)
                        .status("ACTIVE")
                        .build());

        share.setStatus("ACTIVE");
        share.setNotes(notes != null ? notes : "Profile shared directly by student.");
        RecruiterProfileShare saved = shareRepository.save(share);

        return ProfileShareDto.builder()
                .id(saved.getId())
                .recruiterId(recruiter.getId())
                .recruiterName(recruiter.getFullName())
                .recruiterCompany(recruiter.getInstitution())
                .status(saved.getStatus())
                .notes(saved.getNotes())
                .sharedAt(saved.getSharedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ProfileShareDto> getStudentShares(UUID studentId) {
        List<RecruiterProfileShare> shares = shareRepository.findByStudentId(studentId);
        return shares.stream().map(s -> ProfileShareDto.builder()
                .id(s.getId())
                .recruiterId(s.getRecruiter().getId())
                .recruiterName(s.getRecruiter().getFullName())
                .recruiterCompany(s.getRecruiter().getInstitution())
                .status(s.getStatus())
                .notes(s.getNotes())
                .sharedAt(s.getSharedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAvailableRecruiters() {
        return profileRepository.findByRole("RECRUITER").stream().map(p -> AdminUserDto.builder()
                .id(p.getId())
                .fullName(p.getFullName())
                .institution(p.getInstitution())
                .branch(p.getBranch())
                .role(p.getRole())
                .build()
        ).collect(Collectors.toList());
    }

    public void assertRecruiterAccess(UUID recruiterId, UUID studentId) {
        boolean shared = shareRepository.existsByRecruiterIdAndStudentIdAndStatus(recruiterId, studentId, "ACTIVE");
        if (!shared) {
            log.warn("Access Denied: Recruiter {} attempted to access unshared student {}", recruiterId, studentId);
            throw new ForbiddenException("Access Denied: Recruiters can view only student profiles explicitly shared with them.");
        }
    }
}
