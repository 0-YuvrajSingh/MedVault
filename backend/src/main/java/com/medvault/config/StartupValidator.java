package com.medvault.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

/**
 * Validates environment configuration at application startup.
 * Ensures all required environment variables are present before the application starts serving requests.
 */
// @Component - Disabled for local development (using application.properties instead of env vars)
public class StartupValidator {

    private static final Logger logger = LoggerFactory.getLogger(StartupValidator.class);
    private final EnvironmentValidator environmentValidator;

    public StartupValidator(EnvironmentValidator environmentValidator) {
        this.environmentValidator = environmentValidator;
    }

    /**
     * Validate environment on application ready event.
     * This runs after all beans are initialized but before the application starts serving requests.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void validateEnvironmentOnStartup() {
        logger.info("================================================================================");
        logger.info("Starting MedVault Backend Environment Validation");
        logger.info("================================================================================");
        
        try {
            environmentValidator.validateRequiredVariables();
            logger.info("✓ All required environment variables validated successfully");
            logger.info("✓ Application is ready to serve requests");
            logger.info("================================================================================");
        } catch (Exception e) {
            logger.error("✗ Environment validation failed!", e);
            logger.error("================================================================================");
            throw e;
        }
    }
}
