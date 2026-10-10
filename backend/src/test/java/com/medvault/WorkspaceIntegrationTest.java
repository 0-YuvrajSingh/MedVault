package com.medvault;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medvault.dto.AssignDoctorRequest;
import com.medvault.dto.CreateRecordRequest;
import com.medvault.dto.CreateReviewRequest;
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
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Workspace membership boundary (D1, access control only).
 *
 * <p>Denial contract under test: no credentials → 401; presented-but-rejected
 * credentials (e.g. deactivated JWT) → body-less 403; non-members of a
 * workspace-scoped resource's workspace → 404 (existence hidden); members failing
 * assignment/ownership checks → 403 with message.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
public class WorkspaceIntegrationTest {

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
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMembershipRepository membershipRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private User admin;

    @BeforeEach
    void setUp() {
        admin = User.builder()
                .fullName("Workspace Admin")
                .email("wsadmin_" + UUID.randomUUID() + "@medvault.com")
                .passwordHash(passwordEncoder.encode("adminPass123"))
                .role("ROLE_ADMIN")
                .active(true)
                .build();
        userRepository.save(admin);
    }

    private String getAdminToken() {
        return jwtUtil.generateToken(admin);
    }

    private User createUser(String fullName, String email, String role, boolean active) {
        User user = User.builder()
                .fullName(fullName)
                .email(email + "_" + UUID.randomUUID() + "@ex.com")
                .passwordHash(passwordEncoder.encode("pw"))
                .role(role)
                .active(active)
                .build();
        return userRepository.save(user);
    }

    private String createWorkspace(String name) throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("name", name);
        String res = mockMvc.perform(post("/api/admin/workspaces")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(name))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).get("id").asText();
    }

    private void addMember(String workspaceId, UUID userId) throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("userId", userId.toString());
        mockMvc.perform(post("/api/admin/workspaces/" + workspaceId + "/members")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId.toString()));
    }

    private String assignInWorkspace(User patient, User doctor, String workspaceId) throws Exception {
        if (workspaceId == null) {
            // Legacy (pre-D6) row simulated directly: the API no longer creates these.
            PatientDoctorAssignment legacy = PatientDoctorAssignment.builder()
                    .patient(patient).doctor(doctor).isActive(true).build();
            return assignmentRepository.save(legacy).getId().toString();
        }
        AssignDoctorRequest req = new AssignDoctorRequest();
        req.setPatientId(patient.getId());
        req.setDoctorId(doctor.getId());
        req.setWorkspaceId(UUID.fromString(workspaceId));
        String res = mockMvc.perform(post("/api/admin/assignments")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workspaceId").value(workspaceId))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(res).get("id").asText();
    }

    // 1. Admin can create and read workspaces
    @Test
    void testAdminCanCreateAndReadWorkspace() throws Exception {
        String wsId = createWorkspace("Cardiology");

        mockMvc.perform(get("/api/admin/workspaces/" + wsId)
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Cardiology"));

        mockMvc.perform(get("/api/admin/workspaces")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // 2. Blank workspace name is rejected
    @Test
    void testCreateWorkspaceValidation() throws Exception {
        Map<String, String> body = new HashMap<>();
        body.put("name", "  ");
        mockMvc.perform(post("/api/admin/workspaces")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    // 3. Non-admins cannot manage workspaces (existing role rules authoritative)
    @Test
    void testNonAdminCannotManageWorkspaces() throws Exception {
        User doctor = createUser("WD", "ws_doc", "ROLE_DOCTOR", true);
        User patient = createUser("WP", "ws_pat", "ROLE_PATIENT", true);
        Map<String, String> body = new HashMap<>();
        body.put("name", "Nope");

        mockMvc.perform(post("/api/admin/workspaces")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/workspaces")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(patient)))
                .andExpect(status().isForbidden());

        String wsId = createWorkspace("W");
        mockMvc.perform(post("/api/admin/workspaces/" + wsId + "/members")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("userId", patient.getId().toString()))))
                .andExpect(status().isForbidden());
    }

    // 4. No credentials -> 401; presented-but-invalid credentials -> 403
    @Test
    void testUnauthenticatedWorkspaceRequestDenied() throws Exception {
        mockMvc.perform(get("/api/admin/workspaces"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/doctor/patients"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testInvalidTokenWorkspaceRequestForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/workspaces")
                        .header("Authorization", "Bearer garbage-token-value"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/doctor/patients")
                        .header("Authorization", "Bearer garbage-token-value"))
                .andExpect(status().isForbidden());
    }

    // 5. Membership add / remove / re-add (reactivation, single row)
    @Test
    void testMemberAddRemoveAndReactivate() throws Exception {
        String wsId = createWorkspace("Oncology");
        User doctor = createUser("MD", "ws_mbr_doc", "ROLE_DOCTOR", true);

        addMember(wsId, doctor.getId());
        assertEquals(1, membershipRepository.findByWorkspaceIdAndIsActiveTrue(
                UUID.fromString(wsId)).size());

        mockMvc.perform(delete("/api/admin/workspaces/" + wsId + "/members/" + doctor.getId())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNoContent());
        assertTrue(membershipRepository.findByWorkspaceIdAndIsActiveTrue(
                UUID.fromString(wsId)).isEmpty());

        // Removing again -> 404; re-adding reactivates the same row
        mockMvc.perform(delete("/api/admin/workspaces/" + wsId + "/members/" + doctor.getId())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNotFound());

        addMember(wsId, doctor.getId());
        assertEquals(1, membershipRepository.findByWorkspaceIdAndIsActiveTrue(
                UUID.fromString(wsId)).size());
    }

    // 6. Unknown user or workspace -> 404
    @Test
    void testAddMemberUnknownUserOrWorkspace404() throws Exception {
        String wsId = createWorkspace("Radiology");
        User doctor = createUser("XD", "ws_x_doc", "ROLE_DOCTOR", true);

        mockMvc.perform(post("/api/admin/workspaces/" + UUID.randomUUID() + "/members")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("userId", doctor.getId().toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/admin/workspaces/" + wsId + "/members")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("userId", UUID.randomUUID().toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/admin/workspaces/" + UUID.randomUUID())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNotFound());
    }

    // 7. Scoped assignment: member access ok, removal revokes to 404
    @Test
    void testScopedAssignmentMembershipGate() throws Exception {
        String wsId = createWorkspace("Pediatrics");
        User doctor = createUser("PD", "ws_scoped_doc", "ROLE_DOCTOR", true);
        User patient = createUser("PP", "ws_scoped_pat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);
        addMember(wsId, doctor.getId());
        addMember(wsId, patient.getId());

        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor)))
                .andExpect(status().isOk());

        // Remove the doctor: scoped records are hidden (404), not merely forbidden
        mockMvc.perform(delete("/api/admin/workspaces/" + wsId + "/members/" + doctor.getId())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor)))
                .andExpect(status().isNotFound());
    }

    // 8. Member without assignment still gets 403 (assignment checks authoritative)
    @Test
    void testMemberWithoutAssignmentStillForbidden() throws Exception {
        String wsId = createWorkspace("Neurology");
        User assigned = createUser("AD", "ws_adoc", "ROLE_DOCTOR", true);
        User outsider = createUser("OD", "ws_odoc", "ROLE_DOCTOR", true);
        User patient = createUser("NP", "ws_npat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, assigned, wsId);
        addMember(wsId, outsider.getId());

        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(outsider)))
                .andExpect(status().isForbidden());
    }

    // 9. Cross-workspace isolation: assigned in W1, member of W2 only -> 404
    @Test
    void testCrossWorkspaceIsolation() throws Exception {
        String w1 = createWorkspace("W1");
        String w2 = createWorkspace("W2");
        User doctor = createUser("CD", "ws_cdoc", "ROLE_DOCTOR", true);
        User patient = createUser("CP", "ws_cpat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, w1);
        addMember(w2, doctor.getId());

        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor)))
                .andExpect(status().isNotFound());
    }

    // 10. Unscoped (V1) assignments keep V1 semantics
    @Test
    void testUnscopedAssignmentPreservesV1Semantics() throws Exception {
        User doctor = createUser("UD", "ws_udoc", "ROLE_DOCTOR", true);
        User patient = createUser("UP", "ws_upat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, null);

        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor)))
                .andExpect(status().isOk());
    }

    // 11. Records inherit the workspace; removal hides them from the patient
    @Test
    void testRecordInheritsWorkspaceAndHidesAfterRemoval() throws Exception {
        String wsId = createWorkspace("Dermatology");
        User doctor = createUser("RD", "ws_rdoc", "ROLE_DOCTOR", true);
        User patient = createUser("RP", "ws_rpat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);
        addMember(wsId, doctor.getId());
        addMember(wsId, patient.getId());

        CreateRecordRequest req = new CreateRecordRequest();
        req.setDiagnosis("Rash");
        req.setPrescription("Cream");
        req.setRecordDate(LocalDate.now());
        String res = mockMvc.perform(post("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String recordId = objectMapper.readTree(res).get("id").asText();

        String patToken = jwtUtil.generateToken(patient);
        mockMvc.perform(get("/api/patient/records/" + recordId)
                        .header("Authorization", "Bearer " + patToken))
                .andExpect(status().isOk());

        // List totals reflect only visible rows (no hidden-row leak).
        mockMvc.perform(get("/api/patient/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(patient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        mockMvc.perform(delete("/api/admin/workspaces/" + wsId + "/members/" + patient.getId())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/patient/records/" + recordId)
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(patient)))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/patient/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(patient)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // 12. Reviews require membership when the assignment is scoped
    @Test
    void testReviewRequiresMembershipWhenScoped() throws Exception {
        String wsId = createWorkspace("Psychiatry");
        User doctor = createUser("VD", "ws_vdoc", "ROLE_DOCTOR", true);
        User patient = createUser("VP", "ws_vpat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);
        addMember(wsId, doctor.getId());

        CreateReviewRequest rev = new CreateReviewRequest();
        rev.setRating(5);
        rev.setComment("Excellent");
        String patToken = jwtUtil.generateToken(patient);

        // Patient assigned but not a member -> 404
        mockMvc.perform(post("/api/patient/reviews")
                        .header("Authorization", "Bearer " + patToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rev)))
                .andExpect(status().isNotFound());

        addMember(wsId, patient.getId());
        mockMvc.perform(post("/api/patient/reviews")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(patient))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rev)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(5));
    }

    // 13. A28 least privilege: admins cannot read record contents; record audit
    // responses carry metadata only (no clinical snapshot)
    @Test
    void testAdminCannotReadRecordContents() throws Exception {
        String wsId = createWorkspace("Oversight");
        User doctor = createUser("OD2", "ws_odoc2", "ROLE_DOCTOR", true);
        User patient = createUser("OP2", "ws_opat2", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);

        // Removed endpoint: no admin route serves clinical record contents
        mockMvc.perform(get("/api/admin/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNotFound());

        // Platform audit oversight still works
        mockMvc.perform(get("/api/admin/audit-logs")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk());
    }

    @Test
    void testAdminRecordAuditOmitsClinicalSnapshot() throws Exception {
        String wsId = createWorkspace("AuditRedact");
        User doctor = createUser("ARD", "ws_ardoc", "ROLE_DOCTOR", true);
        User patient = createUser("ARP", "ws_arpat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);
        addMember(wsId, doctor.getId());

        CreateRecordRequest req = new CreateRecordRequest();
        req.setDiagnosis("SensitiveDiagnosis");
        req.setPrescription("SensitivePrescription");
        req.setRecordDate(LocalDate.now());
        String res = mockMvc.perform(post("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String recordId = objectMapper.readTree(res).get("id").asText();

        String audit = mockMvc.perform(get("/api/admin/records/" + recordId + "/audit")
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].action").value("CREATE"))
                .andReturn().getResponse().getContentAsString();
        assertFalse(audit.contains("SensitiveDiagnosis"));
        assertFalse(audit.contains("SensitivePrescription"));
        assertTrue(objectMapper.readTree(audit).get("content").get(0).get("detailSnapshot").isNull());
    }

    // 14. Assigned-patient listing hides scoped assignments the doctor left
    @Test
    void testAssignedPatientsHidesUnmemberedScoped() throws Exception {
        String wsId = createWorkspace("Listing");
        User doctor = createUser("LD", "ws_ldoc", "ROLE_DOCTOR", true);
        User patient = createUser("LP", "ws_lpat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);
        addMember(wsId, doctor.getId());

        String docToken = jwtUtil.generateToken(doctor);
        mockMvc.perform(get("/api/doctor/patients")
                        .header("Authorization", "Bearer " + docToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(patient.getId().toString()));

        mockMvc.perform(delete("/api/admin/workspaces/" + wsId + "/members/" + doctor.getId())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/doctor/patients")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    // 16. D6: workspaceId is mandatory for new assignments (400 when missing)
    @Test
    void testAssignRequiresWorkspaceId() throws Exception {
        User doctor = createUser("MD6", "ws_d6doc", "ROLE_DOCTOR", true);
        User patient = createUser("MD6p", "ws_d6pat", "ROLE_PATIENT", true);

        Map<String, String> body = new HashMap<>();
        body.put("patientId", patient.getId().toString());
        body.put("doctorId", doctor.getId().toString());

        mockMvc.perform(post("/api/admin/assignments")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());

        assertTrue(assignmentRepository.findByPatient_Id(patient.getId()).isEmpty());
    }

    // 17. D6: unknown workspace IDs return 404
    @Test
    void testAssignUnknownWorkspaceReturns404() throws Exception {
        User doctor = createUser("UD6", "ws_u6doc", "ROLE_DOCTOR", true);
        User patient = createUser("UD6p", "ws_u6pat", "ROLE_PATIENT", true);

        AssignDoctorRequest req = new AssignDoctorRequest();
        req.setPatientId(patient.getId());
        req.setDoctorId(doctor.getId());
        req.setWorkspaceId(UUID.randomUUID());

        mockMvc.perform(post("/api/admin/assignments")
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    // 18. D6: reassignment of a legacy null-workspace assignment is blocked (409)
    @Test
    void testLegacyReassignmentBlocked() throws Exception {
        User oldDoc = createUser("LOD6", "ws_lodoc", "ROLE_DOCTOR", true);
        User newDoc = createUser("LND6", "ws_lndoc", "ROLE_DOCTOR", true);
        User patient = createUser("LP6", "ws_lpat", "ROLE_PATIENT", true);
        String legacyId = assignInWorkspace(patient, oldDoc, null);

        Map<String, String> body = new HashMap<>();
        body.put("newDoctorId", newDoc.getId().toString());

        String res = mockMvc.perform(put("/api/admin/assignments/" + legacyId)
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict())
                .andReturn().getResponse().getContentAsString();
        assertTrue(objectMapper.readTree(res).get("message").asText().contains("no workspace"));

        // Legacy assignment untouched and still active
        assertTrue(assignmentRepository.findById(UUID.fromString(legacyId)).orElseThrow().isActive());
    }

    // 19. D6: scoped reassignment inherits the workspace
    @Test
    void testScopedReassignmentInheritsWorkspace() throws Exception {
        String wsId = createWorkspace("Inherit");
        User oldDoc = createUser("IOD6", "ws_iodoc", "ROLE_DOCTOR", true);
        User newDoc = createUser("IND6", "ws_indoc", "ROLE_DOCTOR", true);
        User patient = createUser("IP6", "ws_ipat", "ROLE_PATIENT", true);
        String assignmentId = assignInWorkspace(patient, oldDoc, wsId);
        addMember(wsId, oldDoc.getId());
        addMember(wsId, newDoc.getId());

        Map<String, String> body = new HashMap<>();
        body.put("newDoctorId", newDoc.getId().toString());

        String res = mockMvc.perform(put("/api/admin/assignments/" + assignmentId)
                        .header("Authorization", "Bearer " + getAdminToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workspaceId").value(wsId))
                .andReturn().getResponse().getContentAsString();
        assertEquals(wsId, objectMapper.readTree(res).get("workspaceId").asText());

        // New doctor (member) can read; old doctor (member) immediately loses access
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(newDoc)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/doctor/patients/" + patient.getId() + "/records")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(oldDoc)))
                .andExpect(status().isForbidden());
    }

    // 15. Doctor review reads hide reviewers from workspaces the doctor left
    @Test
    void testDoctorReviewsHideUnmemberedWorkspace() throws Exception {
        String wsId = createWorkspace("Reviews");
        User doctor = createUser("GD", "ws_gdoc", "ROLE_DOCTOR", true);
        User patient = createUser("GP", "ws_gpat", "ROLE_PATIENT", true);
        assignInWorkspace(patient, doctor, wsId);
        addMember(wsId, doctor.getId());
        addMember(wsId, patient.getId());

        CreateReviewRequest rev = new CreateReviewRequest();
        rev.setRating(4);
        rev.setComment("Good");
        mockMvc.perform(post("/api/patient/reviews")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(patient))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rev)))
                .andExpect(status().isOk());

        String docToken = jwtUtil.generateToken(doctor);
        mockMvc.perform(get("/api/doctor/reviews")
                        .header("Authorization", "Bearer " + docToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].rating").value(4))
                .andExpect(jsonPath("$.totalElements").value(1));

        mockMvc.perform(delete("/api/admin/workspaces/" + wsId + "/members/" + doctor.getId())
                        .header("Authorization", "Bearer " + getAdminToken()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/doctor/reviews")
                        .header("Authorization", "Bearer " + jwtUtil.generateToken(doctor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }
}
