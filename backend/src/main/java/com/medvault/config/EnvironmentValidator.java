package com.medvault.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
@Component
public class EnvironmentValidator {
    private static final Logger logger = LoggerFactory.getLogger(EnvironmentValidator.class);
    private final Environment environment;

    public EnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    public String requireProperty(@NonNull String key) {
        String value = environment.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            String errorMsg = String.format(
                "FATAL: Required environment variable '%s' is not set. " +
                "Please set this variable before starting the application. " +
                "See application-example.env for required variables.",
                key
            );
            logger.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
        logger.info("Successfully loaded property: {}", key);
        String trimmed = value.trim();
        if (trimmed == null) {
            throw new IllegalStateException("Property value for key '" + key + "' is unexpectedly null after trim.");
        }
        return trimmed;
    }

    public String getPropertyOrDefault(@NonNull String key, @NonNull String defaultValue) {
        String value = environment.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            logger.warn("Property '{}' not set, using default value", key);
            return defaultValue;
        }
        String trimmed = value.trim();
        if (trimmed == null) {
            throw new IllegalStateException("Property value for key '" + key + "' is unexpectedly null after trim.");
        }
        return trimmed;
    }

            public void validateJwtSecret(@NonNull String secret) {
                if (secret.trim().isEmpty()) {
                    throw new IllegalStateException("JWT_SECRET cannot be empty");
                }
                if (secret.length() < 32) {
                    throw new IllegalStateException(
                        "JWT_SECRET must be at least 32 characters long for HS256 algorithm. " +
                        "Current length: " + secret.length()
                    );
                }
                List<String> insecureValues = Arrays.asList(
                    "secret", "password", "changeme", "change_me", "test", "demo",
                    "default", "admin", "root", "your_secret_here", "your-secret-key"
                );
                String lowerSecret = secret.toLowerCase();
                for (String insecure : insecureValues) {
                    if (lowerSecret.contains(insecure)) {
                        logger.warn(
                            "JWT_SECRET appears to contain an insecure value: '{}'. " +
                            "Please use a cryptographically secure random string.",
                            insecure
                        );
                    }
                }
                logger.info("JWT secret validation passed (length: {} characters)", secret.length());
            }

            public void validateRequiredVariables() {
                List<String> missingVars = new ArrayList<>();
                if (!hasProperty("JWT_SECRET") && !hasProperty("jwt.secret")) missingVars.add("JWT_SECRET");
                if (!hasProperty("DB_USERNAME")) missingVars.add("DB_USERNAME");
                if (!hasProperty("DB_PASSWORD")) missingVars.add("DB_PASSWORD");
                if (!hasProperty("GMAIL_USERNAME")) missingVars.add("GMAIL_USERNAME");
                if (!hasProperty("GMAIL_APP_PASSWORD")) missingVars.add("GMAIL_APP_PASSWORD");
                if (!missingVars.isEmpty()) {
                    String errorMsg = String.format("""
        ================================================================================
        FATAL ERROR: Missing required environment variables
        ================================================================================
        The following environment variables are required but not set:
          - %s

        Please set these variables before starting the application.
        See 'application-example.env' for reference.

        For local development, create a '.env' file or set them in your IDE.
        For production, set them in your deployment environment.
        ================================================================================
        """, String.join("\n  - ", missingVars));
                    logger.error(errorMsg);
                    throw new IllegalStateException(errorMsg);
                }
                logger.info("All required environment variables validated successfully");
            }

            private boolean hasProperty(@NonNull String key) {
                String value = environment.getProperty(key);
                return value != null && !value.trim().isEmpty();
            }
        }

