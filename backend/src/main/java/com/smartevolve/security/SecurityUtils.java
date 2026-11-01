package com.smartevolve.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    public static final UUID DEMO_STUDENT_ID   = UUID.fromString("00000000-0000-0000-0000-000000000001");
    public static final UUID DEMO_MENTOR_ID    = UUID.fromString("00000000-0000-0000-0000-000000000002");
    public static final UUID DEMO_ADMIN_ID     = UUID.fromString("00000000-0000-0000-0000-000000000003");
    public static final UUID DEMO_RECRUITER_ID = UUID.fromString("00000000-0000-0000-0000-000000000004");

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return DEMO_STUDENT_ID;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) {
            return up.getId() != null ? up.getId() : DEMO_STUDENT_ID;
        }

        if (principal instanceof String str && !str.equalsIgnoreCase("anonymousUser")) {
            try {
                return UUID.fromString(str);
            } catch (IllegalArgumentException ignore) {}
        }

        return DEMO_STUDENT_ID;
    }

    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getEmail();
        }
        return "alex.chen@student.edu";
    }

    public static UserRole getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return UserRole.fromString(up.getRole());
        }
        if (auth != null) {
            for (GrantedAuthority authority : auth.getAuthorities()) {
                String authStr = authority.getAuthority();
                if (authStr.startsWith("ROLE_")) {
                    return UserRole.fromString(authStr.substring(5));
                }
            }
        }
        return UserRole.STUDENT;
    }

    public static boolean isAdmin() {
        return getCurrentUserRole() == UserRole.ADMIN;
    }

    public static boolean isMentor() {
        return getCurrentUserRole() == UserRole.MENTOR;
    }

    public static boolean isRecruiter() {
        return getCurrentUserRole() == UserRole.RECRUITER;
    }

    public static boolean isStudent() {
        return getCurrentUserRole() == UserRole.STUDENT;
    }
}
