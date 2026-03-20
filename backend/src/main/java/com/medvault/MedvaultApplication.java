package com.medvault;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class MedvaultApplication {
	private static final Logger log = LoggerFactory.getLogger(MedvaultApplication.class);

	public static void main(String[] args) {
		ConfigurableApplicationContext ctx = SpringApplication.run(MedvaultApplication.class, args);
		Environment env = ctx.getEnvironment();
		String activeProfiles = String.join(", ", env.getActiveProfiles().length == 0 ? new String[]{"default"} : env.getActiveProfiles());
		log.info("Active profiles: {}", activeProfiles);
	}
}

