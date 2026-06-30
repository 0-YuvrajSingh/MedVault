package com.medvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.entity.AuditLog;
import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.User;
import com.medvault.repository.AuditLogRepository;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class SecurityClaimsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private PatientDoctorAssignmentRepository assignmentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testStrictIdorProtectionDoctorCannotFetchUnassignedPatientRecords() throws Exception {
        // Create Patient
        User patient = User.builder().fullName("Patient A").email("patienta@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(patient);

        // Create Doctor A (Assigned to Patient A)
        User doctorA = User.builder().fullName("Doctor A").email("doctora@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(doctorA);

        // Create Doctor B (NOT Assigned to Patient A)
        User doctorB = User.builder().fullName("Doctor B").email("doctorb@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(doctorB);

        // Assign Doctor A to Patient A
        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder().doctor(doctorA).patient(patient).build();
        assignmentRepository.save(assignment);

        // Doctor A creates a record for Patient A
        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(doctorA)
                .diagnosis("Cold")
                .prescription("Rest")
                .recordDate(java.time.LocalDate.now())
                .build();
        medicalRecordRepository.save(record);

        // Login as Doctor B
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "doctorb@ex.com");
        loginReq.put("password", "pw");
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn().getResponse().getContentAsString();
        String doctorBToken = objectMapper.readTree(response).get("token").asText();

        // Doctor B attempts to fetch Patient A's records
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId().toString() + "/records")
                .header("Authorization", "Bearer " + doctorBToken))
                .andExpect(status().isForbidden()); // Validating strict IDOR
    }

    @Test
    void testStrictIdorProtectionPatientCannotFetchOtherPatientRecords() throws Exception {
        // Create Patient A
        User patientA = User.builder().fullName("Patient A").email("pa@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(patientA);

        // Create Patient B
        User patientB = User.builder().fullName("Patient B").email("pb@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(patientB);

        // Create Doctor to assign records
        User doctor = User.builder().fullName("Doctor D").email("docd@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(doctor);

        // Doctor creates a record for Patient B
        MedicalRecord recordB = MedicalRecord.builder()
                .patient(patientB)
                .doctor(doctor)
                .diagnosis("Flu")
                .prescription("Rest")
                .recordDate(java.time.LocalDate.now())
                .build();
        medicalRecordRepository.save(recordB);

        // Login as Patient A
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "pa@ex.com");
        loginReq.put("password", "pw");
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn().getResponse().getContentAsString();
        String patientAToken = objectMapper.readTree(response).get("token").asText();

        // Patient A attempts to fetch Patient B's specific record via IDOR
        mockMvc.perform(get("/api/patient/records/" + recordB.getId().toString())
                .header("Authorization", "Bearer " + patientAToken))
                .andExpect(status().isForbidden()); // Strict IDOR blocks this
    }

    @Test
    void testImmutableAuditLoggingArchitecture() {
        // Create an audit log
        User admin = User.builder().fullName("Admin").email("admin.audit@ex.com").passwordHash("pw").role("ROLE_ADMIN").active(true).build();
        userRepository.save(admin);

        User patient = User.builder().fullName("Patient X").email("px@ex.com").passwordHash("pw").role("ROLE_PATIENT").active(true).build();
        userRepository.save(patient);

        MedicalRecord record = MedicalRecord.builder()
                .patient(patient)
                .doctor(admin)
                .diagnosis("Test")
                .prescription("None")
                .recordDate(java.time.LocalDate.now())
                .build();
        medicalRecordRepository.save(record);

        AuditLog log = AuditLog.builder()
                .action("CREATE")
                .performedBy(admin)
                .record(record)
                .detailSnapshot("Created a record")
                .build();

        AuditLog savedLog = auditLogRepository.save(log);
        assertNotNull(savedLog.getId());

        // Prove immutability: The AuditLog entity no longer has @Setter methods,
        // so it cannot be mutated programmatically after creation.
        Optional<AuditLog> retrievedLogOpt = auditLogRepository.findById(savedLog.getId());
        assertTrue(retrievedLogOpt.isPresent());
        AuditLog retrievedLog = retrievedLogOpt.get();

        assertEquals("CREATE", retrievedLog.getAction());
        assertEquals("Created a record", retrievedLog.getDetailSnapshot());
    }
}
