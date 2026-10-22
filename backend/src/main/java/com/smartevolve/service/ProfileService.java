package com.smartevolve.service;

import com.smartevolve.dto.ProfileDto;
import com.smartevolve.dto.UpdateProfileRequest;
import com.smartevolve.entity.Profile;
import com.smartevolve.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

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
                    .interests("[]")
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

        Profile saved = profileRepository.save(profile);
        log.info("Updated profile for student {}", studentId);
        return mapToDto(saved);
    }

    private ProfileDto mapToDto(Profile profile) {
        return ProfileDto.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .educationLevel(profile.getEducationLevel())
                .institution(profile.getInstitution())
                .branch(profile.getBranch())
                .graduationYear(profile.getGraduationYear())
                .interests(Collections.emptyList())
                .onboardingCompleted(Boolean.TRUE.equals(profile.getOnboardingCompleted()))
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
