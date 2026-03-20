package com.medvault.controller;

import com.medvault.dto.ApiResponse;
import com.medvault.dto.AuthRequestDTO;
import com.medvault.dto.AuthResponseDTO;
import com.medvault.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for AuthController
 * Tests the complete authentication flow
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldRegisterNewUser() {
        // Given
        AuthRequestDTO request = new AuthRequestDTO();
        request.setName("Test User");
        request.setEmail("integration.test@medvault.com");
        request.setPassword("TestPass123!");
        request.setRole("PATIENT");
        request.setPhone("1234567890");
        request.setDateOfBirth("1990-01-01");
        request.setGender("Male");
        request.setAddress("Test Address");

        // When
        ResponseEntity<AuthResponseDTO> response = restTemplate.postForEntity(
            "/api/auth/register",
            request,
            AuthResponseDTO.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getEmail()).isEqualTo("integration.test@medvault.com");
        assertThat(response.getBody().getToken()).isNotNull();
    }

    @Test
    void shouldNotRegisterDuplicateEmail() {
        // Given - register first user
        AuthRequestDTO request = new AuthRequestDTO();
        request.setName("Test User");
        request.setEmail("duplicate@medvault.com");
        request.setPassword("TestPass123!");
        request.setRole("PATIENT");
        request.setPhone("1234567890");
        request.setDateOfBirth("1990-01-01");
        request.setGender("Male");
        request.setAddress("Test Address");

        restTemplate.postForEntity("/api/auth/register", request, AuthResponseDTO.class);

        // When - try to register same email again
        ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
            "/api/auth/register",
            request,
            ApiResponse.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldLoginWithValidCredentials() {
        // Given - register a user first
        AuthRequestDTO registerRequest = new AuthRequestDTO();
        registerRequest.setName("Login Test");
        registerRequest.setEmail("login.test@medvault.com");
        registerRequest.setPassword("LoginPass123!");
        registerRequest.setRole("PATIENT");
        registerRequest.setPhone("1234567890");
        registerRequest.setDateOfBirth("1990-01-01");
        registerRequest.setGender("Male");
        registerRequest.setAddress("Test Address");

        restTemplate.postForEntity("/api/auth/register", registerRequest, AuthResponseDTO.class);

        // When - login
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setEmail("login.test@medvault.com");
        loginRequest.setPassword("LoginPass123!");

        ResponseEntity<AuthResponseDTO> response = restTemplate.postForEntity(
            "/api/auth/login",
            loginRequest,
            AuthResponseDTO.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getToken()).isNotNull();
    }

    @Test
    void shouldNotLoginWithInvalidPassword() {
        // Given - register a user
        AuthRequestDTO registerRequest = new AuthRequestDTO();
        registerRequest.setName("Invalid Pass Test");
        registerRequest.setEmail("invalid.pass@medvault.com");
        registerRequest.setPassword("CorrectPass123!");
        registerRequest.setRole("PATIENT");
        registerRequest.setPhone("1234567890");
        registerRequest.setDateOfBirth("1990-01-01");
        registerRequest.setGender("Male");
        registerRequest.setAddress("Test Address");

        restTemplate.postForEntity("/api/auth/register", registerRequest, AuthResponseDTO.class);

        // When - try login with wrong password
        AuthRequestDTO loginRequest = new AuthRequestDTO();
        loginRequest.setEmail("invalid.pass@medvault.com");
        loginRequest.setPassword("WrongPassword123!");

        ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
            "/api/auth/login",
            loginRequest,
            ApiResponse.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
