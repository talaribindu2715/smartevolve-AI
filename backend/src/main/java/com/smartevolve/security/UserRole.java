package com.smartevolve.security;

public enum UserRole {
    STUDENT,
    MENTOR,
    ADMIN,
    RECRUITER;

    public static UserRole fromString(String roleStr) {
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return STUDENT;
        }
        String clean = roleStr.trim().toUpperCase();
        if (clean.startsWith("ROLE_")) {
            clean = clean.substring(5);
        }
        return switch (clean) {
            case "ADMIN" -> ADMIN;
            case "MENTOR", "FACULTY", "INSTRUCTOR" -> MENTOR;
            case "RECRUITER", "EMPLOYER", "HR" -> RECRUITER;
            default -> STUDENT;
        };
    }

    public String toAuthority() {
        return "ROLE_" + this.name();
    }
}
