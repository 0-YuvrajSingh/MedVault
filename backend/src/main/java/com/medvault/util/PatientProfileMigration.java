package com.medvault.util;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.model.Patient;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;

@Component
public class PatientProfileMigration implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    public PatientProfileMigration(UserRepository userRepository, PatientRepository patientRepository) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<User> patients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.PATIENT)
                .toList();
        int created = 0;
        for (User user : patients) {
            if (patientRepository.findByUserId(user.getId()).isEmpty()) {
                Patient patient = new Patient();
                patient.setUser(user);
                // Set default/empty fields as needed
                patientRepository.save(patient);
                created++;
            }
        }
        System.out.println("[PatientProfileMigration] Created missing patient profiles: " + created);
    }
}
