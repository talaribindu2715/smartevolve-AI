package com.smartevolve.service;

import com.smartevolve.dto.ProfileDto;
import com.smartevolve.dto.UpdateProfileRequest;
import com.smartevolve.entity.Profile;
import com.smartevolve.entity.StudentCareerPreference;
import com.smartevolve.repository.ProfileRepository;
import com.smartevolve.repository.StudentCareerPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final StudentCareerPreferenceRepository preferenceRepository;
    private final CareerService careerService;

    public ProfileService(
            ProfileRepository profileRepository,
            StudentCareerPreferenceRepository preferenceRepository,
            @Lazy CareerService careerService) {
        this.profileRepository = profileRepository;
        this.preferenceRepository = preferenceRepository;
        this.careerService = careerService;
    }

    @Transactional
    public Profile getOrCreateProfile(UUID studentId, String defaultEmail) {
        return profileRepository.findById(studentId).orElseGet(() -> {
            log.info("Creating initial profile for authenticated student {}", studentId);
            String name = (defaultEmail != null && defaultEmail.contains("@"))
                    ? defaultEmail.substring(0, defaultEmail.indexOf('@'))
                    : "Student";
            // Capitalize first letter
            name = Character.toUpperCase(name.charAt(0)) + name.substring(1);

            Profile newProfile = Profile.builder()
                    .id(studentId)
                    .fullName(name)
                    .educationLevel("Undergraduate B.Tech")
                    .institution("Engineering College")
                    .branch("Computer Science")
                    .graduationYear(2027)
                    .interests("AI & Machine Learning, Web Development, Cloud Systems")
                    .preferredLearningStyle("Hands-on Projects & Video Masterclasses")
                    .academicGoals("Master full-stack engineering and cloud-native AI pipelines")
                    .onboardingCompleted(false)
                    .build();
            return profileRepository.save(newProfile);
        });
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfileDto(UUID studentId) {
        Profile profile = getOrCreateProfile(studentId, null);
        return mapToDto(profile);
    }

    @Transactional
    public ProfileDto updateProfile(UUID studentId, UpdateProfileRequest request) {
        Profile profile = getOrCreateProfile(studentId, null);

        if (request.getFullName() != null) profile.setFullName(request.getFullName().trim());
        if (request.getEducationLevel() != null) profile.setEducationLevel(request.getEducationLevel().trim());
        if (request.getInstitution() != null) profile.setInstitution(request.getInstitution().trim());
        if (request.getBranch() != null) profile.setBranch(request.getBranch().trim());
        if (request.getGraduationYear() != null) profile.setGraduationYear(request.getGraduationYear());
        if (request.getOnboardingCompleted() != null) profile.setOnboardingCompleted(request.getOnboardingCompleted());
        if (request.getPreferredLearningStyle() != null) profile.setPreferredLearningStyle(request.getPreferredLearningStyle().trim());
        if (request.getAcademicGoals() != null) profile.setAcademicGoals(request.getAcademicGoals().trim());
        if (request.getInterests() != null) {
            profile.setInterests(String.join(", ", request.getInterests()));
        }

        Profile saved = profileRepository.save(profile);

        if (request.getTargetCareerId() != null) {
            careerService.setCareerGoal(studentId, request.getTargetCareerId());
        }

        log.info("Updated profile for student {}", studentId);
        return mapToDto(saved);
    }

    private ProfileDto mapToDto(Profile profile) {
        List<String> parsedInterests = new ArrayList<>();
        if (profile.getInterests() != null && !profile.getInterests().isBlank()) {
            String raw = profile.getInterests().trim();
            if (raw.startsWith("[") && raw.endsWith("]")) {
                raw = raw.substring(1, raw.length() - 1);
            }
            for (String part : raw.split(",")) {
                String clean = part.replace("\"", "").replace("'", "").trim();
                if (!clean.isEmpty()) {
                    parsedInterests.add(clean);
                }
            }
        }

        UUID targetCareerId = null;
        String targetCareerName = "Not Selected";
        Optional<StudentCareerPreference> prefOpt = preferenceRepository.findFirstByStudentIdOrderByPreferenceRankAsc(profile.getId());
        if (prefOpt.isPresent()) {
            targetCareerId = prefOpt.get().getCareer().getId();
            targetCareerName = prefOpt.get().getCareer().getName();
        }

        return ProfileDto.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .educationLevel(profile.getEducationLevel())
                .institution(profile.getInstitution())
                .branch(profile.getBranch())
                .graduationYear(profile.getGraduationYear())
                .interests(parsedInterests)
                .preferredLearningStyle(profile.getPreferredLearningStyle() != null ? profile.getPreferredLearningStyle() : "Hands-on & Video")
                .academicGoals(profile.getAcademicGoals() != null ? profile.getAcademicGoals() : "Achieve top proficiency in target career requirements")
                .targetCareerId(targetCareerId)
                .targetCareerName(targetCareerName)
                .onboardingCompleted(Boolean.TRUE.equals(profile.getOnboardingCompleted()))
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
