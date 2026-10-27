package com.smartevolve;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartEvolveApplication {

    private static final Logger log = LoggerFactory.getLogger(SmartEvolveApplication.class);

    public static void main(String[] args) {
        validateEnvironment();
        SpringApplication.run(SmartEvolveApplication.class, args);
    }

    private static void validateEnvironment() {
        String dbUser = System.getenv("SUPABASE_DB_USER");
        String dbUrl = System.getenv("SUPABASE_DB_URL");
        String dbPassword = System.getenv("SUPABASE_DB_PASSWORD");

        if (isPlaceholder(dbUser) || isPlaceholder(dbUrl) || isPlaceholder(dbPassword)) {
            String banner = """
                
                ========================================================================================
                🚨 CRITICAL DEPLOYMENT CONFIGURATION ERROR: INVALID DATABASE CREDENTIALS DETECTED!
                ========================================================================================
                One or more Supabase database environment variables still contain template placeholders:
                  - SUPABASE_DB_USER: %s
                  - SUPABASE_DB_URL:  %s
                  - SUPABASE_DB_PASSWORD: %s

                Supabase rejects connections with placeholders (e.g. 'FATAL: tenant/user not found').

                👉 HOW TO FIX ON RENDER:
                1. Open your Render Dashboard (https://dashboard.render.com).
                2. Select your 'smartevolve-backend' service -> Click 'Environment' tab on the left.
                3. Locate SUPABASE_DB_USER and update it:
                   • If using Supabase Connection Pooler (recommended on Render IPv4):
                     - Host: aws-0-[region].pooler.supabase.com (Port 6543 or 5432)
                     - SUPABASE_DB_URL:  jdbc:postgresql://<pooler-host>:6543/postgres?sslmode=require
                     - SUPABASE_DB_USER: postgres.<your-actual-project-ref> (e.g. postgres.abcdefghijklmnopqrst)
                   • If using Direct Connection:
                     - SUPABASE_DB_URL:  jdbc:postgresql://db.<your-actual-project-ref>.supabase.co:5432/postgres?sslmode=require
                     - SUPABASE_DB_USER: postgres
                   • SUPABASE_DB_PASSWORD: Your Supabase database password
                4. Click 'Save Changes' on Render to automatically trigger a new deployment.
                ========================================================================================
                """.formatted(
                    dbUser != null ? dbUser : "(not set)",
                    dbUrl != null ? dbUrl : "(not set)",
                    dbPassword != null ? "****** (length: " + dbPassword.length() + ")" : "(not set)"
                );
            log.error(banner);
            System.err.println(banner);
            throw new IllegalStateException(
                "Cannot start SmartEvolve backend: SUPABASE_DB_USER or SUPABASE_DB_URL contains placeholder value ('" +
                dbUser + "'). Please update your Render Environment variables with your real Supabase credentials."
            );
        }
    }

    private static boolean isPlaceholder(String val) {
        if (val == null || val.isBlank()) {
            return false;
        }
        String upper = val.toUpperCase();
        return upper.contains("YOUR_SUPABASE_PROJECT_REF")
            || upper.contains("YOUR_PROJECT_REF")
            || upper.contains("YOUR_REF")
            || upper.contains("YOUR_PASSWORD")
            || upper.contains("<YOUR")
            || upper.contains("[YOUR");
    }
}
