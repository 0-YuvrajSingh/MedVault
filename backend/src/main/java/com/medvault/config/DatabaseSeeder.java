package com.medvault.config;

import com.medvault.entity.User;
import com.medvault.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Seeding database...");
            String pw = passwordEncoder.encode("password123");

            User admin = User.builder()
                    .fullName("Admin User")
                    .email("admin@medvault.com")
                    .passwordHash(pw)
                    .role("ROLE_ADMIN")
                    .active(true)
                    .build();
            userRepository.save(admin);

            User doctor = User.builder()
                    .fullName("Dr. John Doe")
                    .email("doctor@medvault.com")
                    .passwordHash(pw)
                    .role("ROLE_DOCTOR")
                    .active(true) // Active so we can log in and screenshot
                    .build();
            userRepository.save(doctor);

            User patient = User.builder()
                    .fullName("Jane Patient")
                    .email("patient@medvault.com")
                    .passwordHash(pw)
                    .role("ROLE_PATIENT")
                    .active(true)
                    .build();
            userRepository.save(patient);

            System.out.println("Database seeded successfully!");
        }
    }
}
