package com.medvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.dto.AssignDoctorRequest;
import com.medvault.dto.CreateRecordRequest;
import com.medvault.dto.CreateReviewRequest;
import com.medvault.dto.ReassignPatientRequest;
import com.medvault.entity.*;
import com.medvault.repository.*;
import com.medvault.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
    private PatientDoctorAssignmentRepository assignmentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TimelineEventRepository timelineEventRepository;

    @Autowired
    private PlatformAuditLogRepository platformAuditLogRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMembershipRepository membershipRepository;

    private User admin;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .fullName("System Admin")
                .email("admin_" + UUID.randomUUID() + "@medvault.com")
                .passwordHash(passwordEncoder.encode("adminPass123"))
                .role("ROLE_ADMIN")
                .active(true)
                .build();
        userRepository.save(admin);
    }

    private String getAdminToken() {
        return jwtUtil.generateToken(admin);
    }

    /** D6: new assignments require a workspace. Creates one directly (admin API equivalent). */
    private Workspace newWorkspace(String name) {
        return workspaceRepository.save(Workspace.builder().name(name).createdBy(admin.getId()).build());
    }

    private void addWorkspaceMember(UUID workspaceId, User user) {
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow();
        membershipRepository.save(WorkspaceMembership.builder()
                .workspace(workspace).user(user).isActive(true).build());
    }

    // 1. Patient registration works and returns a usable token
    @Test
    void testPatientRegistrationAndAuthentication() throws Exception {
        Map<String, String> regReq = new HashMap<>();
        regReq.put("fullName", "Patient Alice");
        regReq.put("email", "alice@example.com");
        regReq.put("password", "password123");
        regReq.put("role", "ROLE_PATIENT");

        String res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(res).get("token").asText();
        assertNotNull(token);

        // Can access patient endpoints
        mockMvc.perform(get("/api/patient/records")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    // 2. Doctor registration produces NO JWT and pending doctor cannot authenticate
    @Test
    void testDoctorRegistrationProducesNoTokenAndCannotLoginUntilApproved() throws Exception {
        Map<String, String> regReq = new HashMap<>();
        regReq.put("fullName", "Dr. Bob");
        regReq.put("email", "drbob@example.com");
        regReq.put("password", "password123");
        regReq.put("role", "ROLE_DOCTOR");

        String res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Token must be null in response
        assertTrue(objectMapper.readTree(res).get("token").isNull());

        // Login before approval must fail with uniform 401 (no account-state oracle)
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "drbob@example.com");
        loginReq.put("password", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    // 3. Admin approval activates doctor, who can then authenticate
    @Test
    void testAdminApprovalWorkflow() throws Exception {
        User doctor = User.builder()
                .fullName("Dr. Charlie")
                .email("charlie@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("ROLE_DOCTOR")
                .active(false)
                .build();
        userRepository.save(doctor);

        String adminToken = getAdminToken();

        // Admin approves doctor
        mockMvc.perform(post("/api/admin/doctors/" + doctor.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));

        // Now doctor can authenticate
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "charlie@example.com");
        loginReq.put("password", "password123");

        String loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String doctorToken = objectMapper.readTree(loginRes).get("token").asText();
        assertNotNull(doctorToken);

        // Can access doctor endpoint
        mockMvc.perform(get("/api/doctor/patients")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());
    }

    // 4. Admin reject doctor keeps account inactive
    @Test
    void testAdminRejectDoctor() throws Exception {
        User doctor = User.builder()
                .fullName("Dr. Dan")
                .email("dan@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("ROLE_DOCTOR")
                .active(false)
                .build();
        userRepository.save(doctor);

        mockMvc.perform(post("/api/admin/doctors/" + doctor.getId() + "/reject")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        // Still cannot log in (uniform 401 — existence/state not revealed)
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("email", "dan@example.com");
        loginReq.put("password", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    // 5. Deactivated doctor's old JWT is immediately rejected
    @Test
    void testDeactivatedDoctorJwtRejectedImmediately() throws Exception {
        User doctor = User.builder()
                .fullName("Dr. Eve")
                .email("eve@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role("ROLE_DOCTOR")
                .active(true)
                .build();
        userRepository.save(doctor);

        // Generate valid token while active
        String doctorToken = jwtUtil.generateToken(doctor);

        // Verify it works
        mockMvc.perform(get("/api/doctor/patients")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isOk());

        // Admin deactivates doctor
        mockMvc.perform(post("/api/admin/doctors/" + doctor.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        // The old JWT must now be rejected by JwtAuthenticationFilter
        mockMvc.perform(get("/api/doctor/patients")
                        .header("Authorization", "Bearer " + doctorToken))
                .andExpect(status().isForbidden());
    }

    // 6. Public registration cannot create ROLE_ADMIN
    @Test
    void testPublicRegistrationCannotCreateAdmin() throws Exception {
        Map<String, String> regReq = new HashMap<>();
        regReq.put("fullName", "Evil Hacker");
        regReq.put("email", "hacker@example.com");
        regReq.put("password", "password123");
        regReq.put("role", "ROLE_ADMIN");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest());
    }

    // 7. Doctor cannot access unassigned patient's records
    @Test
    void testDoctorCannotAccessUnassignedPatientRecords() throws Exception {
        User doctor = User.builder().fullName("Dr. Strange").email("strange@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        User patient = User.builder().fullName("Peter Parker").email("peter@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(doctor);
        userRepository.save(patient);

        String docToken = jwtUtil.generateToken(doctor);

        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + docToken))
                .andExpect(status().isForbidden());
    }

    // 8. Patient cannot access another patient's record (IDOR)
    @Test
    void testPatientCannotAccessAnotherPatientRecord() throws Exception {
        User pat1 = User.builder().fullName("P1").email("p1@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User pat2 = User.builder().fullName("P2").email("p2@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doc = User.builder().fullName("D1").email("d1@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(pat1);
        userRepository.save(pat2);
        userRepository.save(doc);

        MedicalRecord record = MedicalRecord.builder()
                .patient(pat2)
                .doctor(doc)
                .diagnosis("Headache")
                .prescription("Aspirin")
                .recordDate(LocalDate.now())
                .build();
        medicalRecordRepository.save(record);

        String pat1Token = jwtUtil.generateToken(pat1);

        mockMvc.perform(get("/api/patient/records/" + record.getId())
                        .header("Authorization", "Bearer " + pat1Token))
                .andExpect(status().isForbidden());
    }

    // 9. Patient cannot create medical records
    @Test
    void testPatientCannotCreateMedicalRecords() throws Exception {
        User patient = User.builder().fullName("Pat").email("pat9@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(patient);

        String patToken = jwtUtil.generateToken(patient);

        CreateRecordRequest req = new CreateRecordRequest();
        req.setDiagnosis("Cold");
        req.setPrescription("Rest");

        mockMvc.perform(post("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + patToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // 10. Duplicate active assignment fails
    @Test
    void testDuplicateActiveAssignmentFails() throws Exception {
        User patient = User.builder().fullName("P").email("dup_p@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doc1 = User.builder().fullName("D1").email("dup_d1@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        User doc2 = User.builder().fullName("D2").email("dup_d2@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(patient);
        userRepository.save(doc1);
        userRepository.save(doc2);

        String adminToken = getAdminToken();

        Workspace workspace = newWorkspace("FlowDup");

        AssignDoctorRequest req1 = new AssignDoctorRequest();
        req1.setPatientId(patient.getId());
        req1.setDoctorId(doc1.getId());
        req1.setWorkspaceId(workspace.getId());

        mockMvc.perform(post("/api/admin/assignments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        // Attempting to assign a second doctor to the same patient must return 409 Conflict
        AssignDoctorRequest req2 = new AssignDoctorRequest();
        req2.setPatientId(patient.getId());
        req2.setDoctorId(doc2.getId());
        req2.setWorkspaceId(workspace.getId());

        mockMvc.perform(post("/api/admin/assignments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isConflict());
    }

    // 11. Reassignment works: old doctor loses access, new doctor gains access
    @Test
    void testReassignmentWorkflow() throws Exception {
        User patient = User.builder().fullName("Pat").email("re_p@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User oldDoc = User.builder().fullName("OldDoc").email("re_old@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        User newDoc = User.builder().fullName("NewDoc").email("re_new@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(patient);
        userRepository.save(oldDoc);
        userRepository.save(newDoc);

        String adminToken = getAdminToken();

        // D6: assignments are workspace-scoped; readers must be members.
        Workspace workspace = newWorkspace("FlowReassign");
        addWorkspaceMember(workspace.getId(), oldDoc);
        addWorkspaceMember(workspace.getId(), newDoc);

        // Initial assignment
        AssignDoctorRequest assignReq = new AssignDoctorRequest();
        assignReq.setPatientId(patient.getId());
        assignReq.setDoctorId(oldDoc.getId());
        assignReq.setWorkspaceId(workspace.getId());

        String assignRes = mockMvc.perform(post("/api/admin/assignments")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String assignmentId = objectMapper.readTree(assignRes).get("id").asText();

        // Old doctor has access
        String oldDocToken = jwtUtil.generateToken(oldDoc);
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + oldDocToken))
                .andExpect(status().isOk());

        // Reassign to new doctor
        ReassignPatientRequest reassignReq = new ReassignPatientRequest();
        reassignReq.setNewDoctorId(newDoc.getId());

        mockMvc.perform(put("/api/admin/assignments/" + assignmentId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reassignReq)))
                .andExpect(status().isOk());

        // Old doctor immediately loses access
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + oldDocToken))
                .andExpect(status().isForbidden());

        // New doctor now has access
        String newDocToken = jwtUtil.generateToken(newDoc);
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + newDocToken))
                .andExpect(status().isOk());
    }

    // 12. Doctor record creation generates audit, notification, and timeline
    @Test
    void testDoctorRecordCreationGeneratesAuditNotificationTimeline() throws Exception {
        User patient = User.builder().fullName("Pat").email("rec_p@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doctor = User.builder().fullName("Doc").email("rec_d@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(patient);
        userRepository.save(doctor);

        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(doctor)
                .isActive(true)
                .build();
        assignmentRepository.save(assignment);

        String docToken = jwtUtil.generateToken(doctor);

        CreateRecordRequest req = new CreateRecordRequest();
        req.setDiagnosis("Hypertension");
        req.setPrescription("Lisinopril 10mg");
        req.setNotes("Follow-up in 4 weeks");
        req.setRecordDate(LocalDate.now());

        mockMvc.perform(post("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + docToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        // Assert notification generated for patient
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(patient.getId());
        assertFalse(notifs.isEmpty());
        assertEquals("New Medical Record", notifs.get(0).getTitle());

        // Assert timeline event created for patient
        List<TimelineEvent> patientTimeline = timelineEventRepository.findByUserIdOrderByEventDateDescCreatedAtDesc(patient.getId());
        assertFalse(patientTimeline.isEmpty());
        assertEquals(EventType.RECORD_CREATED, patientTimeline.get(0).getEventType());

        // Assert platform audit event recorded
        assertFalse(platformAuditLogRepository.findAll().isEmpty());
    }

    // 13. Patient review: requires assigned doctor, creates review, doctor can see it
    @Test
    void testPatientReviewWorkflow() throws Exception {
        User patient = User.builder().fullName("Rev Patient").email("rev_p@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doctor = User.builder().fullName("Rev Doctor").email("rev_d@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(patient);
        userRepository.save(doctor);

        String patToken = jwtUtil.generateToken(patient);
        CreateReviewRequest revReq = new CreateReviewRequest();
        revReq.setRating(5);
        revReq.setComment("Great physician!");

        // Review before assignment fails (403 forbidden)
        mockMvc.perform(post("/api/patient/reviews")
                        .header("Authorization", "Bearer " + patToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(revReq)))
                .andExpect(status().isForbidden());

        // Assign doctor
        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(doctor)
                .isActive(true)
                .build();
        assignmentRepository.save(assignment);

        // Now review succeeds
        mockMvc.perform(post("/api/patient/reviews")
                        .header("Authorization", "Bearer " + patToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(revReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.patientName").value("Rev Patient"));

        // Doctor can read review (paginated)
        String docToken = jwtUtil.generateToken(doctor);
        mockMvc.perform(get("/api/doctor/reviews")
                        .header("Authorization", "Bearer " + docToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(5));

        // Duplicate review by same patient updates existing review (upsert)
        revReq.setRating(4);
        revReq.setComment("Updated: still good");
        mockMvc.perform(post("/api/patient/reviews")
                        .header("Authorization", "Bearer " + patToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(revReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4));

        assertEquals(1, reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId()).size());
    }

    // 14. Notification isolation: patient cannot mark another patient's notification as read
    @Test
    void testNotificationOwnership() throws Exception {
        User p1 = User.builder().fullName("P1").email("notif_p1@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User p2 = User.builder().fullName("P2").email("notif_p2@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(p1);
        userRepository.save(p2);

        Notification n = Notification.builder()
                .userId(p1.getId())
                .title("Test Notif")
                .message("Msg")
                .type(NotificationType.INFO)
                .build();
        notificationRepository.save(n);

        String p2Token = jwtUtil.generateToken(p2);

        // P2 tries to mark P1's notification as read -> 403 Forbidden
        mockMvc.perform(patch("/api/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + p2Token))
                .andExpect(status().isForbidden());
    }

    // 15. Admin unassign patient removes active status and emits events
    @Test
    void testAdminUnassignPatient() throws Exception {
        User patient = User.builder().fullName("Pat").email("un_p@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_PATIENT").active(true).build();
        User doctor = User.builder().fullName("Doc").email("un_d@ex.com").passwordHash(passwordEncoder.encode("pw")).role("ROLE_DOCTOR").active(true).build();
        userRepository.save(patient);
        userRepository.save(doctor);

        PatientDoctorAssignment assignment = PatientDoctorAssignment.builder()
                .patient(patient)
                .doctor(doctor)
                .isActive(true)
                .build();
        assignmentRepository.save(assignment);

        String adminToken = getAdminToken();

        mockMvc.perform(delete("/api/admin/assignments/" + assignment.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Doctor loses access
        String docToken = jwtUtil.generateToken(doctor);
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + docToken))
                .andExpect(status().isForbidden());
    }

    // 16. Platform audit log endpoint returns paginated system events
    @Test
    void testPlatformAuditLogsEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // 17. Login failures are uniform: unknown email, inactive account, and wrong
    // password all return 401 with the same message (no account-state oracle).
    @Test
    void testLoginFailuresAreUniform() throws Exception {
        User inactive = User.builder().fullName("Inactive Doc").email("inactive_enum@ex.com")
                .passwordHash(passwordEncoder.encode("correctpw1")).role("ROLE_DOCTOR").active(false).build();
        User active = User.builder().fullName("Active Pat").email("active_enum@ex.com")
                .passwordHash(passwordEncoder.encode("correctpw1")).role("ROLE_PATIENT").active(true).build();
        userRepository.save(inactive);
        userRepository.save(active);

        String unknownBody = loginBody("nobody_enum@ex.com", "whatever123");
        String inactiveBody = loginBody("inactive_enum@ex.com", "correctpw1");
        String wrongPwBody = loginBody("active_enum@ex.com", "wrongpw123");

        String r1 = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(unknownBody))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();
        String r2 = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(inactiveBody))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();
        String r3 = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(wrongPwBody))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        String m1 = objectMapper.readTree(r1).get("message").asText();
        String m2 = objectMapper.readTree(r2).get("message").asText();
        String m3 = objectMapper.readTree(r3).get("message").asText();
        assertEquals(m1, m2);
        assertEquals(m1, m3);
    }

    private String loginBody(String email, String password) throws Exception {
        Map<String, String> m = new HashMap<>();
        m.put("email", email);
        m.put("password", password);
        return objectMapper.writeValueAsString(m);
    }
}
