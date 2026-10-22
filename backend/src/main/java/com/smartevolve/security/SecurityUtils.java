package com.smartevolve.security;

import com.smartevolve.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) {
            return up.getId();
        }

        if (principal instanceof String str && !str.equalsIgnoreCase("anonymousUser")) {
            try {
                return UUID.fromString(str);
            } catch (IllegalArgumentException ignore) {}
        }

        throw new UnauthorizedException("Valid student identity not found in security context");
    }

    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getEmail();
        }
        return "student@smartevolve.ai";
    }
}
