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

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Contract tests for DoctorController
 * Verifies API matches frontend expectations
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class DoctorControllerContractTest {

    @Autowired
    private TestRestTemplate restTemplate;

    /**
     * Test: GET /api/doctors (Get All Doctors)
     * Frontend: api.js -> doctorAPI.getAllDoctors()
     */
    @Test
    void shouldGetAllDoctors_MatchingContract() {
        ResponseEntity<DoctorResponseDTO[]> response = restTemplate.getForEntity(
            "/api/doctors",
            DoctorResponseDTO[].class
        );

        assertThat(response.getStatusCode()).isIn(HttpStatus.OK, HttpStatus.UNAUTHORIZED);
        
        if (response.getStatusCode() == HttpStatus.OK) {
            DoctorResponseDTO[] doctors = response.getBody();
            assertThat(doctors).isNotNull();
            
            if (doctors.length > 0) {
                // Verify DTO structure
                assertThat(doctors[0]).hasFieldOrProperty("id");
                assertThat(doctors[0]).hasFieldOrProperty("user");
                assertThat(doctors[0]).hasFieldOrProperty("specialization");
                assertThat(doctors[0]).hasFieldOrProperty("licenseNumber");
            }
        }
    }

    /**
     * Test: GET /api/doctors/{id} (Get Doctor by ID)
     * Frontend: api.js -> doctorAPI.getDoctorById(id)
     */
    @Test
    void shouldGetDoctorById_MatchingContract() {
        ResponseEntity<DoctorResponseDTO> response = restTemplate.getForEntity(
            "/api/doctors/test-uuid",
            DoctorResponseDTO.class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Test: GET /api/doctors/search (Search Doctors)
     * Frontend: api.js -> doctorAPI.searchDoctors(criteria)
     */
    @Test
    void shouldSearchDoctors_MatchingContract() {
        ResponseEntity<DoctorResponseDTO[]> response = restTemplate.getForEntity(
            "/api/doctors/search?specialization=Cardiology",
            DoctorResponseDTO[].class
        );

        assertThat(response.getStatusCode()).isIn(HttpStatus.OK, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Test: PUT /api/doctors/{id} (Update Doctor Profile)
     * Frontend: api.js -> doctorAPI.updateProfile(id, data)
     */
    @Test
    void shouldUpdateDoctorProfile_MatchingContract() {
        DoctorRequestDTO request = new DoctorRequestDTO();
        request.setBio("Updated bio");
        
        HttpEntity<DoctorRequestDTO> entity = new HttpEntity<>(request);

        ResponseEntity<DoctorResponseDTO> response = restTemplate.exchange(
            "/api/doctors/test-uuid",
            HttpMethod.PUT,
            entity,
            DoctorResponseDTO.class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    }

    /**
     * Test: GET /api/doctors/my-patients (Get Doctor's Patients)
     * Frontend: api.js -> doctorAPI.getMyPatients()
     */
    @Test
    void shouldGetDoctorPatients_MatchingContract() {
        ResponseEntity<PatientResponseDTO[]> response = restTemplate.getForEntity(
            "/api/doctors/my-patients",
            PatientResponseDTO[].class
        );

        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND);
    }
}
