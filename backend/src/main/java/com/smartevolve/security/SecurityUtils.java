package com.smartevolve.security;

import com.smartevolve.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public final class SecurityUtils {

    public static final UUID DEMO_STUDENT_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final Map<String, UUID> EMAIL_TO_STUDENT_ID = new ConcurrentHashMap<>();

    static {
        // Pre-map the primary student account email so both Email/Password and Google OAuth resolve to the exact same profile
        EMAIL_TO_STUDENT_ID.put("talaribindu767@gmail.com", DEMO_STUDENT_ID);
        EMAIL_TO_STUDENT_ID.put("bunny.pradeep@student.edu", DEMO_STUDENT_ID);
    }

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return DEMO_STUDENT_ID;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) {
            String email = up.getEmail();
            if (email != null && !email.isBlank()) {
                String normalized = email.trim().toLowerCase();
                UUID mapped = EMAIL_TO_STUDENT_ID.get(normalized);
                if (mapped != null) {
                    return mapped;
                }
                if (up.getId() != null) {
                    EMAIL_TO_STUDENT_ID.putIfAbsent(normalized, up.getId());
                    return up.getId();
                }
            }
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
        return "talaribindu767@gmail.com";
    }
}
