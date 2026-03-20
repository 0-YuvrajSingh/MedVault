package com.medvault.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AppStartup implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(AppStartup.class);

    public AppStartup() {
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Application startup logic here
        // For example: seed initial admin user, initialize directories, etc.
        logger.info("🚀 MedVault Application Started Successfully");
    }
}
