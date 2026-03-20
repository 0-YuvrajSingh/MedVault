package com.medvault.service;

import java.util.List;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.DoctorRequestDTO;
import com.medvault.dto.DoctorResponseDTO;
import com.medvault.dto.DoctorSearchDTO;
import com.medvault.exception.ConflictException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Doctor;
import com.medvault.model.User;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.UserRepository;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    private final com.medvault.repository.AppointmentRepository appointmentRepository;

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository, com.medvault.repository.AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    @CacheEvict(value = {"doctors", "verifiedDoctors", "doctorsBySpecialization", "doctorProfile"}, allEntries = true)
    public DoctorResponseDTO createDoctor(DoctorRequestDTO request) {
        // Check if license number already exists
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new ConflictException("License number already registered");
        }

        // Check if user exists
        UUID userId = request.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if doctor profile already exists for this user
        if (doctorRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new ConflictException("Doctor profile already exists for this user");
        }

        // Create doctor entity
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialization(request.getSpecialization());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setQualifications(request.getQualifications());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setIsVerified(false); // Default to unverified

        Doctor savedDoctor = doctorRepository.save(doctor);

        // Convert to DTO
        return new DoctorResponseDTO(
                savedDoctor.getId(),
                savedDoctor.getUser().getId(),
                savedDoctor.getUser().getName(),
                savedDoctor.getUser().getEmail(),
                savedDoctor.getSpecialization(),
                savedDoctor.getLicenseNumber(),
                savedDoctor.getQualifications(),
                savedDoctor.getExperienceYears(),
                savedDoctor.getHospitalAffiliation(),
                savedDoctor.getBio(),
                savedDoctor.getConsultationFee(),
                savedDoctor.getIsVerified(),
                savedDoctor.getCreatedAt(),
                savedDoctor.getUpdatedAt()
        );
    }

    @Transactional
    @CacheEvict(value = {"doctors", "verifiedDoctors", "doctorsBySpecialization", "doctorProfile"}, allEntries = true)
    public DoctorResponseDTO createProfileForAuthenticatedUser(String email, DoctorRequestDTO request) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Set the user ID in the request
        request.setUserId(user.getId());

        // Delegate to the existing createDoctor method
        return createDoctor(request);
    }

    @Cacheable(value = "doctorProfile", key = "#id")
    public DoctorResponseDTO getDoctorById(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Doctor ID must not be null");
        }
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        return new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }

    public DoctorResponseDTO getDoctorByUserId(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user ID: " + userId));

        return new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }

    @Cacheable(value = "doctors")
    public List<DoctorResponseDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(doctor -> new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        ))
                .toList();
    }

    @Cacheable(value = "doctorsBySpecialization", key = "#specialization")
    public List<DoctorResponseDTO> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization).stream()
                .map(doctor -> new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        ))
                .toList();
    }

    @Cacheable(value = "verifiedDoctors")
    public List<DoctorResponseDTO> getVerifiedDoctors() {
        return doctorRepository.findByIsVerified(true).stream()
                .map(doctor -> new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        ))
                .toList();
    }

    @Transactional
    @CacheEvict(value = {"doctors", "verifiedDoctors", "doctorsBySpecialization", "doctorProfile"}, allEntries = true)
    public DoctorResponseDTO updateDoctor(UUID id, DoctorRequestDTO request) {
        if (id == null) {
            throw new IllegalArgumentException("Doctor ID must not be null");
        }
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        // Check if license number is being changed and if it's already taken
        if (!doctor.getLicenseNumber().equals(request.getLicenseNumber())) {
            if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
                throw new ConflictException("License number already registered");
            }
        }

        // Update fields
        doctor.setSpecialization(request.getSpecialization());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setQualifications(request.getQualifications());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setHospitalAffiliation(request.getHospitalAffiliation());
        doctor.setBio(request.getBio());
        doctor.setConsultationFee(request.getConsultationFee());

        Doctor updatedDoctor = doctorRepository.save(doctor);

        return new DoctorResponseDTO(
                updatedDoctor.getId(),
                updatedDoctor.getUser().getId(),
                updatedDoctor.getUser().getName(),
                updatedDoctor.getUser().getEmail(),
                updatedDoctor.getSpecialization(),
                updatedDoctor.getLicenseNumber(),
                updatedDoctor.getQualifications(),
                updatedDoctor.getExperienceYears(),
                updatedDoctor.getHospitalAffiliation(),
                updatedDoctor.getBio(),
                updatedDoctor.getConsultationFee(),
                updatedDoctor.getIsVerified(),
                updatedDoctor.getCreatedAt(),
                updatedDoctor.getUpdatedAt()
        );
    }

    @Transactional
    @CacheEvict(value = {"doctors", "verifiedDoctors", "doctorsBySpecialization", "doctorProfile"}, allEntries = true)
    public DoctorResponseDTO verifyDoctor(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Doctor ID must not be null");
        }
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + id));

        doctor.setIsVerified(true);
        Doctor verifiedDoctor = doctorRepository.save(doctor);

        return new DoctorResponseDTO(
                verifiedDoctor.getId(),
                verifiedDoctor.getUser().getId(),
                verifiedDoctor.getUser().getName(),
                verifiedDoctor.getUser().getEmail(),
                verifiedDoctor.getSpecialization(),
                verifiedDoctor.getLicenseNumber(),
                verifiedDoctor.getQualifications(),
                verifiedDoctor.getExperienceYears(),
                verifiedDoctor.getHospitalAffiliation(),
                verifiedDoctor.getBio(),
                verifiedDoctor.getConsultationFee(),
                verifiedDoctor.getIsVerified(),
                verifiedDoctor.getCreatedAt(),
                verifiedDoctor.getUpdatedAt()
        );
    }

    @Transactional
    @CacheEvict(value = {"doctors", "verifiedDoctors", "doctorsBySpecialization", "doctorProfile"}, allEntries = true)
    public void deleteDoctor(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("Doctor ID must not be null");
        }
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor", "id", id);
        }
        doctorRepository.deleteById(id);
    }

    public Page<DoctorResponseDTO> searchDoctors(DoctorSearchDTO searchDTO) {
        // Build pageable with sorting
        String sortDirection = searchDTO.getSortDirection();
        if (sortDirection == null || sortDirection.trim().isEmpty()) {
            sortDirection = "ASC";
        }
        String sortBy = searchDTO.getSortBy();
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "id";
        }
        // Ensure non-null values for type safety
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(searchDTO.getPage(), searchDTO.getSize(), sort);

        Page<Doctor> doctorPage;

        // Apply filters based on what's provided
        boolean hasName = searchDTO.getName() != null && !searchDTO.getName().trim().isEmpty();
        boolean hasSpecialization = searchDTO.getSpecialization() != null && !searchDTO.getSpecialization().trim().isEmpty();
        boolean hasVerified = searchDTO.getIsVerified() != null;
        boolean hasExperience = searchDTO.getMinExperience() != null;

        if (hasName && hasSpecialization && hasVerified) {
            // All three filters
            doctorPage = doctorRepository.findByAllFilters(
                    searchDTO.getIsVerified(),
                    searchDTO.getSpecialization(),
                    searchDTO.getName(),
                    pageable
            );
        } else if (hasVerified && hasSpecialization) {
            // Verified + Specialization
            doctorPage = doctorRepository.findByVerifiedAndSpecialization(
                    searchDTO.getIsVerified(),
                    searchDTO.getSpecialization(),
                    pageable
            );
        } else if (hasVerified && hasName) {
            // Verified + Name
            doctorPage = doctorRepository.findByVerifiedAndName(
                    searchDTO.getIsVerified(),
                    searchDTO.getName(),
                    pageable
            );
        } else if (hasVerified && hasExperience) {
            // Verified + Experience
            doctorPage = doctorRepository.findByVerifiedAndExperience(
                    searchDTO.getIsVerified(),
                    searchDTO.getMinExperience(),
                    pageable
            );
        } else if (hasSpecialization) {
            // Just Specialization
            doctorPage = doctorRepository.findBySpecializationContainingIgnoreCase(
                    searchDTO.getSpecialization(),
                    pageable
            );
        } else if (hasName) {
            // Just Name
            doctorPage = doctorRepository.findByUserNameContaining(
                    searchDTO.getName(),
                    pageable
            );
        } else if (hasVerified) {
            // Just Verified
            doctorPage = doctorRepository.findByIsVerified(
                    searchDTO.getIsVerified(),
                    pageable
            );
        } else if (hasExperience) {
            // Just Experience
            doctorPage = doctorRepository.findByExperienceYearsGreaterThanEqual(
                    searchDTO.getMinExperience(),
                    pageable
            );
        } else {
            // No filters - return all
            doctorPage = doctorRepository.findAll(pageable);
        }

        // Convert to DTOs
        return doctorPage.map(doctor -> new DoctorResponseDTO(
                doctor.getId(),
                doctor.getUser().getId(),
                doctor.getUser().getName(),
                doctor.getUser().getEmail(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getQualifications(),
                doctor.getExperienceYears(),
                doctor.getHospitalAffiliation(),
                doctor.getBio(),
                doctor.getConsultationFee(),
                doctor.getIsVerified(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        ));
    }

    public List<com.medvault.dto.PatientResponseDTO> getDoctorPatients(UUID userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return appointmentRepository.findDistinctPatientsByDoctorId(doctor.getId()).stream()
                .map(patient -> com.medvault.dto.PatientResponseDTO.builder()
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
                .build())
                .toList();
    }

    public List<com.medvault.dto.PatientResponseDTO> getDoctorPatientsByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return appointmentRepository.findDistinctPatientsByDoctorId(doctor.getId()).stream()
                .map(patient -> com.medvault.dto.PatientResponseDTO.builder()
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
                .build())
                .toList();
    }
}
