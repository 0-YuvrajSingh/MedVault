package com.medvault.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.PatientRequestDTO;
import com.medvault.dto.PatientResponseDTO;
import com.medvault.exception.ConflictException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Patient;
import com.medvault.model.User;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PatientResponseDTO createPatient(PatientRequestDTO request) {
        UUID userId = Objects.requireNonNull(request.getUserId(), "User ID cannot be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if patient profile already exists for this user
        if (patientRepository.findByUserId(userId).isPresent()) {
            throw new ConflictException("Patient profile already exists for this user");
        }

        // Create patient entity with extended fields
        Patient patient = new Patient();
        patient.setUser(user);
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setAllergies(request.getAllergies());
        patient.setMaritalStatus(request.getMaritalStatus());
        patient.setAadhaarNumber(request.getAadhaarNumber());
        patient.setLifestyle(request.getLifestyle());
        patient.setCurrentHealth(request.getCurrentHealth());
        patient.setProfilePicture(request.getProfilePicture());

        Patient savedPatient = patientRepository.save(patient);

        // Convert to DTO
        return PatientResponseDTO.builder()
                .id(savedPatient.getId())
                .userId(savedPatient.getUser().getId())
                .name(savedPatient.getUser().getName())
                .email(savedPatient.getUser().getEmail())
                .dateOfBirth(savedPatient.getDateOfBirth())
                .bloodGroup(savedPatient.getBloodGroup())
                .gender(savedPatient.getGender())
                .address(savedPatient.getAddress())
                .phoneNumber(savedPatient.getPhoneNumber())
                .emergencyContactName(savedPatient.getEmergencyContactName())
                .emergencyContactPhone(savedPatient.getEmergencyContactPhone())
                .medicalHistory(savedPatient.getMedicalHistory())
                .allergies(savedPatient.getAllergies())
                .createdAt(savedPatient.getCreatedAt())
                .updatedAt(savedPatient.getUpdatedAt())
                .maritalStatus(savedPatient.getMaritalStatus())
                .aadhaarNumber(savedPatient.getAadhaarNumber())
                .lifestyle(savedPatient.getLifestyle())
                .currentHealth(savedPatient.getCurrentHealth())
                .profilePicture(savedPatient.getProfilePicture())
                .build();
    }

    public PatientResponseDTO getPatientById(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));

        return PatientResponseDTO.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .name(patient.getUser().getName())
                .email(patient.getUser().getEmail())
                .dateOfBirth(patient.getDateOfBirth())
                .bloodGroup(patient.getBloodGroup())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .phoneNumber(patient.getPhoneNumber())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .medicalHistory(patient.getMedicalHistory())
                .allergies(patient.getAllergies())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .maritalStatus(patient.getMaritalStatus())
                .aadhaarNumber(patient.getAadhaarNumber())
                .lifestyle(patient.getLifestyle())
                .currentHealth(patient.getCurrentHealth())
                .profilePicture(patient.getProfilePicture())
                .build();
    }

    public PatientResponseDTO getPatientByUserId(UUID userId) {
        Patient patient = patientRepository.findByUserId(userId).orElse(null);
        if (patient == null) {
            // Fallback: auto-create minimal patient profile if user exists and is PATIENT
            UUID safeUserId = Objects.requireNonNull(userId, "User ID cannot be null");
            User user = userRepository.findById(safeUserId)
                    .orElseThrow(() -> new RuntimeException("User not found for user ID: " + safeUserId));
            if (user.getRole() != null && user.getRole().name().equals("PATIENT")) {
                patient = new Patient();
                patient.setUser(user);
                // Set minimal required fields (set defaults or nulls as needed)
                patient.setDateOfBirth(null);
                patient.setBloodGroup(null);
                patient.setGender(null);
                patient.setAddress(null);
                patient.setPhoneNumber(null);
                patient.setEmergencyContactName(null);
                patient.setEmergencyContactPhone(null);
                patient.setMedicalHistory(null);
                patient.setAllergies(null);
                patient.setMaritalStatus(null);
                patient.setAadhaarNumber(null);
                patient.setLifestyle(null);
                patient.setCurrentHealth(null);
                patient.setProfilePicture(null);
                patient = patientRepository.save(patient);
            } else {
                throw new RuntimeException("Patient not found for user ID: " + safeUserId);
            }
        }
        return PatientResponseDTO.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .name(patient.getUser().getName())
                .email(patient.getUser().getEmail())
                .dateOfBirth(patient.getDateOfBirth())
                .bloodGroup(patient.getBloodGroup())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .phoneNumber(patient.getPhoneNumber())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .medicalHistory(patient.getMedicalHistory())
                .allergies(patient.getAllergies())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .maritalStatus(patient.getMaritalStatus())
                .aadhaarNumber(patient.getAadhaarNumber())
                .lifestyle(patient.getLifestyle())
                .currentHealth(patient.getCurrentHealth())
                .profilePicture(patient.getProfilePicture())
                .build();
    }

    public List<PatientResponseDTO> getAllPatients() {
        return patientRepository.findAll().stream()
                .map(patient -> PatientResponseDTO.builder()
                .id(patient.getId())
                .userId(patient.getUser().getId())
                .name(patient.getUser().getName())
                .email(patient.getUser().getEmail())
                .dateOfBirth(patient.getDateOfBirth())
                .bloodGroup(patient.getBloodGroup())
                .gender(patient.getGender())
                .address(patient.getAddress())
                .phoneNumber(patient.getPhoneNumber())
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .medicalHistory(patient.getMedicalHistory())
                .allergies(patient.getAllergies())
                .createdAt(patient.getCreatedAt())
                .updatedAt(patient.getUpdatedAt())
                .maritalStatus(patient.getMaritalStatus())
                .aadhaarNumber(patient.getAadhaarNumber())
                .lifestyle(patient.getLifestyle())
                .currentHealth(patient.getCurrentHealth())
                .profilePicture(patient.getProfilePicture())
                .build())
                .toList();
    }

    @Transactional
    public PatientResponseDTO updatePatient(UUID id, PatientRequestDTO request) {
        if (id == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + id));

        // Update fields (including new ones)
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        patient.setMedicalHistory(request.getMedicalHistory());
        patient.setAllergies(request.getAllergies());
        patient.setMaritalStatus(request.getMaritalStatus());
        patient.setAadhaarNumber(request.getAadhaarNumber());
        patient.setLifestyle(request.getLifestyle());
        patient.setCurrentHealth(request.getCurrentHealth());
        patient.setProfilePicture(request.getProfilePicture());

        Patient updatedPatient = patientRepository.save(patient);

        return PatientResponseDTO.builder()
                .id(updatedPatient.getId())
                .userId(updatedPatient.getUser().getId())
                .name(updatedPatient.getUser().getName())
                .email(updatedPatient.getUser().getEmail())
                .dateOfBirth(updatedPatient.getDateOfBirth())
                .bloodGroup(updatedPatient.getBloodGroup())
                .gender(updatedPatient.getGender())
                .address(updatedPatient.getAddress())
                .phoneNumber(updatedPatient.getPhoneNumber())
                .emergencyContactName(updatedPatient.getEmergencyContactName())
                .emergencyContactPhone(updatedPatient.getEmergencyContactPhone())
                .medicalHistory(updatedPatient.getMedicalHistory())
                .allergies(updatedPatient.getAllergies())
                .createdAt(updatedPatient.getCreatedAt())
                .updatedAt(updatedPatient.getUpdatedAt())
                .maritalStatus(updatedPatient.getMaritalStatus())
                .aadhaarNumber(updatedPatient.getAadhaarNumber())
                .lifestyle(updatedPatient.getLifestyle())
                .currentHealth(updatedPatient.getCurrentHealth())
                .profilePicture(updatedPatient.getProfilePicture())
                .build();
    }

    @Transactional
    public void deletePatient(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }
        patientRepository.deleteById(id);
    }
}
