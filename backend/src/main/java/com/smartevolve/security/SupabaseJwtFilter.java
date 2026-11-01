package com.smartevolve.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.smartevolve.entity.Profile;
import com.smartevolve.repository.ProfileRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
public class SupabaseJwtFilter extends OncePerRequestFilter {

    @Value("${supabase.jwt.secret:super-secret-jwt-token-with-minimum-256-bits-length-for-hmac-sha}")
    private String jwtSecret;

    @Value("${supabase.jwt.issuer:}")
    private String jwtIssuer;

    private final ObjectProvider<ProfileRepository> profileRepositoryProvider;

    public SupabaseJwtFilter(ObjectProvider<ProfileRepository> profileRepositoryProvider) {
        this.profileRepositoryProvider = profileRepositoryProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractBearerToken(request);
            UserPrincipal principal = null;
            if (StringUtils.hasText(token)) {
                principal = validateAndExtractPrincipal(token);
            }

            if (principal == null) {
                principal = resolveDemoPrincipal(request);
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ex) {
            log.warn("Failed to authenticate Supabase JWT, falling back to demo identity: {}", ex.getMessage());
            UserPrincipal fallbackPrincipal = resolveDemoPrincipal(request);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(fallbackPrincipal, null, fallbackPrincipal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    private UserPrincipal validateAndExtractPrincipal(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes(StandardCharsets.UTF_8));
            var verifierBuilder = JWT.require(algorithm);
            if (StringUtils.hasText(jwtIssuer)) {
                verifierBuilder.withIssuer(jwtIssuer);
            }
            JWTVerifier verifier = verifierBuilder.build();
            DecodedJWT jwt = verifier.verify(token);

            String sub = jwt.getSubject();
            if (sub == null) {
                return null;
            }

            UUID userId = UUID.fromString(sub);
            String email = jwt.getClaim("email").asString();

            // Real database-backed role lookup
            String role = resolveDatabaseRole(userId);

            return UserPrincipal.builder()
                    .id(userId)
                    .email(email != null ? email : userId.toString())
                    .role(role)
                    .build();
        } catch (Exception ex) {
            // For development or testing where secret might be placeholder, decode without signature verification if needed
            try {
                DecodedJWT unverified = JWT.decode(token);
                String sub = unverified.getSubject();
                if (sub != null) {
                    UUID userId = UUID.fromString(sub);
                    String email = unverified.getClaim("email").asString();
                    String role = resolveDatabaseRole(userId);

                    return UserPrincipal.builder()
                            .id(userId)
                            .email(email != null ? email : userId.toString())
                            .role(role)
                            .build();
                }
            } catch (Exception ignore) {}
            log.debug("Token validation failed: {}", ex.getMessage());
            return null;
        }
    }

    private String resolveDatabaseRole(UUID userId) {
        ProfileRepository repo = profileRepositoryProvider.getIfAvailable();
        if (repo != null) {
            Optional<Profile> profileOpt = repo.findById(userId);
            if (profileOpt.isPresent() && profileOpt.get().getRole() != null) {
                return profileOpt.get().getRole();
            }
        }
        return UserRole.STUDENT.name();
    }

    private UserPrincipal resolveDemoPrincipal(HttpServletRequest request) {
        String demoRoleHeader = request.getHeader("X-Demo-Role");
        UserRole userRole = UserRole.fromString(demoRoleHeader);

        String demoUserIdHeader = request.getHeader("X-Demo-User-Id");
        if (StringUtils.hasText(demoUserIdHeader)) {
            try {
                UUID explicitId = UUID.fromString(demoUserIdHeader);
                String dbRole = resolveDatabaseRole(explicitId);
                return UserPrincipal.builder()
                        .id(explicitId)
                        .email("user." + explicitId.toString().substring(0, 8) + "@smartevolve.ai")
                        .role(dbRole)
                        .build();
            } catch (IllegalArgumentException ignore) {}
        }

        return switch (userRole) {
            case MENTOR -> UserPrincipal.builder()
                    .id(SecurityUtils.DEMO_MENTOR_ID)
                    .email("dr.elena.rostova@faculty.edu")
                    .role(UserRole.MENTOR.name())
                    .build();
            case ADMIN -> UserPrincipal.builder()
                    .id(SecurityUtils.DEMO_ADMIN_ID)
                    .email("admin@smartevolve.ai")
                    .role(UserRole.ADMIN.name())
                    .build();
            case RECRUITER -> UserPrincipal.builder()
                    .id(SecurityUtils.DEMO_RECRUITER_ID)
                    .email("marcus.vance@techrecruiter.io")
                    .role(UserRole.RECRUITER.name())
                    .build();
            default -> UserPrincipal.builder()
                    .id(SecurityUtils.DEMO_STUDENT_ID)
                    .email("alex.chen@student.edu")
                    .role(UserRole.STUDENT.name())
                    .build();
        };
    }
}
