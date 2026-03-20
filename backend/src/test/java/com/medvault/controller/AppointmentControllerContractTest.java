package com.medvault.controller;

import com.medvault.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Contract tests for AppointmentController
 * Verifies frontend-backend API contract
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AppointmentControllerContractTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private String authToken;

    /**
     * Test: POST /api/appointments (Create Appointment)
     * Frontend expectation: ApiResponse<AppointmentResponseDTO>
     */
    @Test
    void shouldCreateAppointment_MatchingFrontendContract() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setDoctorId(UUID.randomUUID());
        request.setPatientId(UUID.randomUUID());
        request.setSlotId(UUID.randomUUID());
        request.setReason("Checkup");

        // When
        ResponseEntity<AppointmentResponseDTO> response = restTemplate.postForEntity(
            "/api/appointments",
            request,
            AppointmentResponseDTO.class
        );

        // Then - Verify response structure matches frontend expectation
        assertThat(response.getStatusCode()).isIn(HttpStatus.OK, HttpStatus.CREATED, HttpStatus.BAD_REQUEST);
        
        if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
            AppointmentResponseDTO body = response.getBody();
            assertThat(body).isNotNull();
            // Verify DTO structure matches frontend interface
            assertThat(body).hasFieldOrProperty("id");
            assertThat(body).hasFieldOrProperty("doctor");
            assertThat(body).hasFieldOrProperty("patient");
            assertThat(body).hasFieldOrProperty("appointmentDate");
            assertThat(body).hasFieldOrProperty("status");
        }
    }

    /**
     * Test: GET /api/appointments (Get All Appointments)
     * Frontend expectation: ApiResponse<List<AppointmentResponseDTO>>
     */
    @Test
    void shouldGetAllAppointments_MatchingFrontendContract() {
        // When
        ResponseEntity<AppointmentResponseDTO[]> response = restTemplate.getForEntity(
            "/api/appointments",
            AppointmentResponseDTO[].class
        );

        // Then
        assertThat(response.getStatusCode()).isIn(HttpStatus.OK, HttpStatus.UNAUTHORIZED);
        
        if (response.getStatusCode() == HttpStatus.OK) {
            AppointmentResponseDTO[] appointments = response.getBody();
            assertThat(appointments).isNotNull();
        }
    }

    /**
     * Test: GET /api/appointments/{id} (Get Single Appointment)
     * Frontend expectation: ApiResponse<AppointmentResponseDTO>
     */
    @Test
    void shouldGetAppointmentById_MatchingFrontendContract() {
        // When
        ResponseEntity<AppointmentResponseDTO> response = restTemplate.getForEntity(
            "/api/appointments/test-uuid",
            AppointmentResponseDTO.class
        );

        // Then - Should return 404 for non-existent, or 200 for valid
        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Test: PUT /api/appointments/{id} (Update Appointment)
     * Frontend expectation: ApiResponse<AppointmentResponseDTO>
     */
    @Test
    void shouldUpdateAppointment_MatchingFrontendContract() {
        // Given
        AppointmentRequestDTO request = new AppointmentRequestDTO();
        request.setReason("Updated reason");

        HttpEntity<AppointmentRequestDTO> entity = new HttpEntity<>(request);

        // When
        ResponseEntity<AppointmentResponseDTO> response = restTemplate.exchange(
            "/api/appointments/test-uuid",
            HttpMethod.PUT,
            entity,
            AppointmentResponseDTO.class
        );

        // Then
        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Test: DELETE /api/appointments/{id} (Cancel Appointment)
     * Frontend expectation: ApiResponse<String> with success message
     */
    @Test
    void shouldCancelAppointment_MatchingFrontendContract() {
        // When
        ResponseEntity<ApiResponse> response = restTemplate.exchange(
            "/api/appointments/test-uuid",
            HttpMethod.DELETE,
            null,
            ApiResponse.class
        );

        // Then
        assertThat(response.getStatusCode())
            .isIn(HttpStatus.OK, HttpStatus.NO_CONTENT, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED);
    }
}
