package com.medvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.User;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class FlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testPatientHappyPath() throws Exception {
        Map<String, String> registerReq = new HashMap<>();
        registerReq.put("fullName", "John Doe");
        registerReq.put("email", "john@example.com");
        registerReq.put("password", "password123");
        registerReq.put("role", "ROLE_PATIENT");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "john@example.com");
        loginReq.put("password", "password123");

        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(response).get("token").asText();

        mockMvc.perform(get("/api/patient/records")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void testDoctorLoginBeforeActivationFails() throws Exception {
        Map<String, String> registerReq = new HashMap<>();
        registerReq.put("fullName", "Dr. Smith");
        registerReq.put("email", "smith@example.com");
        registerReq.put("password", "password123");
        registerReq.put("role", "ROLE_DOCTOR");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "smith@example.com");
        loginReq.put("password", "password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAdminDuplicateAssignmentFails() throws Exception {
        User patient = User.builder().fullName("Pat").email("pat@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doctor = User.builder().fullName("Doc").email("doc@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        User admin = User.builder().fullName("Admin").email("admin@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_ADMIN").active(true).build();
        
        userRepository.save(patient);
        userRepository.save(doctor);
        userRepository.save(admin);

        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "admin@ex.com");
        loginReq.put("password", "pw");
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn().getResponse().getContentAsString();
        String adminToken = objectMapper.readTree(response).get("token").asText();

        Map<String, String> assignReq = new HashMap<>();
        assignReq.put("patientId", patient.getId().toString());
        assignReq.put("doctorId", doctor.getId().toString());

        mockMvc.perform(post("/api/admin/assignments")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/admin/assignments")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isConflict());
    }

    @Test
    void testIdorPatientCannotReadOtherPatientRecord() throws Exception {
        User pat1 = User.builder().fullName("Pat1").email("pat1@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User pat2 = User.builder().fullName("Pat2").email("pat2@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doctor = User.builder().fullName("Doc").email("doc@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        
        userRepository.save(pat1);
        userRepository.save(pat2);
        userRepository.save(doctor);

        MedicalRecord recordForPat2 = MedicalRecord.builder()
                .patient(pat2)
                .doctor(doctor)
                .diagnosis("Flu")
                .prescription("Rest")
                .recordDate(java.time.LocalDate.now())
                .build();
        medicalRecordRepository.save(recordForPat2);

        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "pat1@ex.com");
        loginReq.put("password", "pw");
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn().getResponse().getContentAsString();
        String pat1Token = objectMapper.readTree(response).get("token").asText();

        mockMvc.perform(get("/api/patient/records/" + recordForPat2.getId().toString())
                .header("Authorization", "Bearer " + pat1Token))
                .andExpect(status().isForbidden());
    }
}
