package com.medvault.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class EmailConfig {

    private static final Logger logger = LoggerFactory.getLogger(EmailConfig.class);
    private final EnvironmentValidator envValidator;

    public EmailConfig(EnvironmentValidator envValidator) {
        this.envValidator = envValidator;
    }

    @Bean
    public JavaMailSender javaMailSender() {
        logger.info("Initializing JavaMailSender with validated environment variables");
        
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Use validated environment variables
        String mailHost = envValidator.getPropertyOrDefault("spring.mail.host", "smtp.gmail.com");
        String mailPortStr = envValidator.getPropertyOrDefault("spring.mail.port", "587");
        int mailPort = Integer.parseInt(mailPortStr);
        String mailUsername = envValidator.requireProperty("spring.mail.username");
        String mailPassword = envValidator.requireProperty("spring.mail.password");
        
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);
        
        logger.info("Email configured for: {} on {}:{}", mailUsername, mailHost, mailPort);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        
        // Enhanced security for Gmail
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.put("mail.smtp.socketFactory.fallback", "false");
        
        return mailSender;
    }
}