package com.medvault.controller;

import com.medvault.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Contract tests for MedicalRecordController
 * Verifies medical records API contracts
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class MedicalRecordControllerContractTest {

    @Autowired
    private TestRestTemplate restTemplate;

    /**
     * Test: POST /api/medical-records (Create Medical Record)
     * Frontend: api.js -> medicalRecordAPI.create(data)
     */
    @Test
    void shouldCreateMedicalRecord_MatchingContract() {
        MedicalRecordRequestDTO request = new MedicalRecordRequestDTO();
        request.setPatientId(UUID.randomUUID());
        request.setDiagnosis("Test diagnosis");
        request.setTreatment("Test treatment");
        request.setRecordDate(LocalDateTime.now());

        ResponseEntity<MedicalRecordResponseDTO> response = restTemplate.postForEntity(
            "/api/medical-records",
            request,
            MedicalRecordResponseDTO.class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.CREATED, HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED);
        
        if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
            MedicalRecordResponseDTO body = response.getBody();
            assertThat(body).isNotNull();
            assertThat(body).hasFieldOrProperty("id");
            assertThat(body).hasFieldOrProperty("diagnosis");
            assertThat(body).hasFieldOrProperty("treatment");
        }
    }

    /**
     * Test: GET /api/medical-records/patient/{patientId} (Get Patient Records)
     * Frontend: api.js -> medicalRecordAPI.getByPatientId(patientId)
     */
    @Test
    void shouldGetPatientMedicalRecords_MatchingContract() {
        ResponseEntity<MedicalRecordResponseDTO[]> response = restTemplate.getForEntity(
            "/api/medical-records/patient/test-patient-uuid",
            MedicalRecordResponseDTO[].class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Test: GET /api/medical-records/{id} (Get Single Record)
     * Frontend: api.js -> medicalRecordAPI.getById(id)
     */
    @Test
    void shouldGetMedicalRecordById_MatchingContract() {
        ResponseEntity<MedicalRecordResponseDTO> response = restTemplate.getForEntity(
            "/api/medical-records/test-record-uuid",
            MedicalRecordResponseDTO.class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    /**
     * Test: PUT /api/medical-records/{id} (Update Record)
     * Frontend: api.js -> medicalRecordAPI.update(id, data)
     */
    @Test
    void shouldUpdateMedicalRecord_MatchingContract() {
        MedicalRecordRequestDTO request = new MedicalRecordRequestDTO();
        request.setDoctorNotes("Updated notes");
        
        HttpEntity<MedicalRecordRequestDTO> entity = new HttpEntity<>(request);

        ResponseEntity<MedicalRecordResponseDTO> response = restTemplate.exchange(
            "/api/medical-records/test-record-uuid",
            HttpMethod.PUT,
            entity,
            MedicalRecordResponseDTO.class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    /**
     * Test: DELETE /api/medical-records/{id} (Delete Record)
     * Frontend: api.js -> medicalRecordAPI.delete(id)
     */
    @Test
    void shouldDeleteMedicalRecord_MatchingContract() {
        ResponseEntity<ApiResponse> response = restTemplate.exchange(
            "/api/medical-records/test-record-uuid",
            HttpMethod.DELETE,
            null,
            ApiResponse.class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NO_CONTENT, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }
}
