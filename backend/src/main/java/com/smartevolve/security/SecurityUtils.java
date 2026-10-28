package com.smartevolve.security;

import com.smartevolve.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    public static final UUID DEMO_STUDENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

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
}
