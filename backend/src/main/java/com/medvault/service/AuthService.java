package com.medvault.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.AuthRequestDTO;
import com.medvault.dto.AuthResponseDTO;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.UnauthorizedException;
import com.medvault.model.Doctor;
import com.medvault.model.Patient;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.security.JwtUtil;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponseDTO register(AuthRequestDTO request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));

        User savedUser = userRepository.save(user);

        // Create role-specific entity
        if (savedUser.getRole() == Role.DOCTOR) {
            Doctor doctor = new Doctor();
            doctor.setUser(savedUser);
            doctor.setSpecialization(request.getSpecialization());
            doctor.setLicenseNumber(request.getLicenseNumber());
            doctor.setQualifications(request.getQualifications());
            Integer experienceYears = request.getExperienceYears();
            doctor.setExperienceYears(experienceYears != null ? experienceYears : 0);
            doctor.setHospitalAffiliation(request.getHospitalAffiliation());
            doctor.setConsultationFee(request.getConsultationFee());
            doctor.setBio(request.getBio());
            doctor.setIsVerified(false); // Requires admin verification
            doctorRepository.save(doctor);
        } else if (savedUser.getRole() == Role.PATIENT) {
            try {
                Patient patient = new Patient();
                patient.setUser(savedUser);
                patient.setPhoneNumber(request.getPhone());
                // Parse date of birth
                if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
                    try {
                        patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
                    } catch (Exception e) {
                        throw new BadRequestException("Invalid date format. Use yyyy-MM-dd");
                    }
                }
                patient.setBloodGroup(request.getBloodGroup());
                patient.setAddress(request.getAddress());
                patient.setGender(request.getGender());
                // Handle emergency contact (can be name+phone or just phone)
                if (request.getEmergencyContact() != null) {
                    patient.setEmergencyContactPhone(request.getEmergencyContact());
                }
                // Set additional fields to ensure profile is always complete
                patient.setMedicalHistory(request.getMedicalHistory());
                patient.setAllergies(request.getAllergies());
                patient.setMaritalStatus(request.getMaritalStatus());
                patient.setAadhaarNumber(request.getAadhaarNumber());
                patient.setLifestyle(request.getLifestyle());
                patient.setCurrentHealth(request.getCurrentHealth());
                patient.setProfilePicture(request.getProfilePicture());
                patientRepository.save(patient);
            } catch (Exception ex) {
                logger.error("Failed to create patient profile for user {}: {}", savedUser.getId(), ex.getMessage(), ex);
                throw new BadRequestException("Failed to create patient profile: " + ex.getMessage());
            }
        }

        // Send welcome email asynchronously
        emailService.sendWelcomeEmail(
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole().name()
        );

        // Validate email before generating token
        if (savedUser.getEmail() == null || savedUser.getEmail().isEmpty()) {
            throw new IllegalStateException("User email cannot be null or empty");
        }

        // Generate token with userId as subject
        logger.info("Generating token for userId: {} (email: {})", savedUser.getId(), savedUser.getEmail());
        String token = jwtUtil.generateToken(savedUser.getId().toString(), savedUser.getEmail(), savedUser.getRole().name());

        // Return response DTO
        return new AuthResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                token,
                savedUser.getCreatedAt()
        );
    }

    public AuthResponseDTO login(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Validate email before generating token
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new IllegalStateException("User email cannot be null or empty");
        }

        // Generate token with userId as subject
        logger.info("Generating token for userId: {} (email: {})", user.getId(), user.getEmail());
        String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail(), user.getRole().name());

        // Return response DTO
        return new AuthResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                token,
                user.getCreatedAt()
        );
    }

    public AuthResponseDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Validate email before generating token
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new IllegalStateException("User email cannot be null or empty");
        }

        // Generate new token with userId as subject
        logger.info("Generating token for userId: {} (email: {})", user.getId(), user.getEmail());
        String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail(), user.getRole().name());

        return new AuthResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                token,
                user.getCreatedAt()
        );
    }
}
