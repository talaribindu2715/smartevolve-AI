package com.smartevolve.security;

import com.smartevolve.dto.*;
import com.smartevolve.entity.Profile;
import com.smartevolve.exception.ForbiddenException;
import com.smartevolve.exception.UnauthorizedException;
import com.smartevolve.repository.MentorStudentAssignmentRepository;
import com.smartevolve.repository.ProfileRepository;
import com.smartevolve.repository.RecruiterProfileShareRepository;
import com.smartevolve.service.AdminService;
import com.smartevolve.service.MentorService;
import com.smartevolve.service.ProfileService;
import com.smartevolve.service.RecruiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class RbacSecurityAccessTest {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private MentorService mentorService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private RecruiterService recruiterService;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private MentorStudentAssignmentRepository mentorAssignmentRepository;

    @Autowired
    private RecruiterProfileShareRepository recruiterShareRepository;

    private final UUID studentId = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID mentorId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private final UUID adminId = UUID.fromString("00000000-0000-0000-0000-000000000003");
    private final UUID recruiterId = UUID.fromString("00000000-0000-0000-0000-000000000004");
    private final UUID unassignedStudentId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        // Create an unassigned student
        profileRepository.save(Profile.builder()
                .id(unassignedStudentId)
                .fullName("Private Student")
                .educationLevel("Undergraduate")
                .branch("Civil Engineering")
                .role("STUDENT")
                .onboardingCompleted(true)
                .build());
    }

    private void authenticateAs(UUID userId, String role, String email) {
        UserPrincipal principal = UserPrincipal.builder()
                .id(userId)
                .email(email)
                .role(role)
                .build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("STUDENT Role: Access own profile successfully")
    void testStudentAccessOwnProfile() {
        authenticateAs(studentId, "STUDENT", "alex.chen@student.edu");

        ProfileDto profile = profileService.getProfileDto(studentId);
        assertNotNull(profile);
        assertEquals("Alex Chen", profile.getFullName());
        assertEquals("STUDENT", profile.getRole());
    }

    @Test
    @DisplayName("STUDENT Privilege Escalation Guard: Cannot self-assign ADMIN or MENTOR role")
    void testStudentCannotEscalateToAdmin() {
        authenticateAs(studentId, "STUDENT", "alex.chen@student.edu");

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .fullName("Alex Chen")
                .role("ADMIN")
                .build();

        assertThrows(UnauthorizedException.class, () -> {
            profileService.updateProfile(studentId, request);
        }, "Students must be blocked from assigning themselves ADMIN role.");
    }

    @Test
    @DisplayName("MENTOR Role: Can access assigned student")
    void testMentorCanAccessAssignedStudent() {
        authenticateAs(mentorId, "MENTOR", "dr.elena.rostova@faculty.edu");

        MentorDashboardDto dashboard = mentorService.getMentorDashboard(mentorId);
        assertNotNull(dashboard);
        assertTrue(dashboard.getTotalAssignedStudents() >= 1);

        CandidateDossierDto dossier = mentorService.getStudentDossierForMentor(mentorId, studentId);
        assertNotNull(dossier);
        assertEquals("Alex Chen", dossier.getFullName());
    }

    @Test
    @DisplayName("MENTOR Role: Strictly blocked with 403 Forbidden when accessing unassigned student")
    void testMentorBlockedFromUnassignedStudent() {
        authenticateAs(mentorId, "MENTOR", "dr.elena.rostova@faculty.edu");

        assertThrows(ForbiddenException.class, () -> {
            mentorService.getStudentDossierForMentor(mentorId, unassignedStudentId);
        }, "Mentors must be strictly denied access to unassigned students.");
    }

    @Test
    @DisplayName("RECRUITER Role: Can view explicitly shared candidate dossier")
    void testRecruiterCanAccessSharedCandidate() {
        authenticateAs(recruiterId, "RECRUITER", "marcus.vance@techrecruiter.io");

        RecruiterDashboardDto dashboard = recruiterService.getRecruiterDashboard(recruiterId);
        assertNotNull(dashboard);
        assertTrue(dashboard.getSharedCandidatesCount() >= 1);

        CandidateDossierDto dossier = recruiterService.getCandidateDossier(recruiterId, studentId);
        assertNotNull(dossier);
        assertEquals("Alex Chen", dossier.getFullName());
    }

    @Test
    @DisplayName("RECRUITER Role: Strictly blocked with 403 Forbidden when accessing unshared student")
    void testRecruiterBlockedFromUnsharedStudent() {
        authenticateAs(recruiterId, "RECRUITER", "marcus.vance@techrecruiter.io");

        assertThrows(ForbiddenException.class, () -> {
            recruiterService.getCandidateDossier(recruiterId, unassignedStudentId);
        }, "Recruiters must be blocked from candidate profiles not explicitly shared.");
    }

    @Test
    @DisplayName("ADMIN Role: Full platform governance, user role modification, and settings management")
    void testAdminFullAccess() {
        authenticateAs(adminId, "ADMIN", "admin@smartevolve.ai");

        AdminDashboardDto dashboard = adminService.getAdminDashboard();
        assertNotNull(dashboard);
        assertTrue(dashboard.getTotalUsers() >= 4);

        // Admin changes a role
        AdminUserDto updated = adminService.updateUserRole(unassignedStudentId, "MENTOR");
        assertEquals("MENTOR", updated.getRole());

        // Admin updates platform settings
        PlatformSettingsDto settings = adminService.getPlatformSettings();
        assertNotNull(settings);
        assertTrue(settings.isRlsEnforced());
    }

    @Test
    @DisplayName("STUDENT Profile Sharing: Student can explicitly grant access to recruiter")
    void testStudentCanShareWithRecruiter() {
        authenticateAs(studentId, "STUDENT", "alex.chen@student.edu");

        ProfileShareDto share = recruiterService.shareProfileWithRecruiter(
                studentId, recruiterId, "Shared for Spring 2027 Campus AI Placement");

        assertNotNull(share);
        assertEquals("ACTIVE", share.getStatus());
        assertEquals(recruiterId, share.getRecruiterId());
    }
}
