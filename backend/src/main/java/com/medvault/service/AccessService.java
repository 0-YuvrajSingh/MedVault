package com.medvault.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.AccessRequestDTO;
import com.medvault.dto.NotificationRequestDTO;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ForbiddenException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.exception.UnauthorizedException;
import com.medvault.model.AccessRequest;
import com.medvault.model.AccessRequestStatus;
import com.medvault.model.Doctor;
import com.medvault.model.NotificationType;
import com.medvault.model.Patient;
import com.medvault.model.Role;
import com.medvault.model.User;
import com.medvault.repository.AccessRequestRepository;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;
import com.medvault.util.SecurityUtil;

@Service
public class AccessService {

    private final AccessRequestRepository accessRequestRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AccessService(AccessRequestRepository accessRequestRepository, 
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.accessRequestRepository = accessRequestRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public AccessRequestDTO requestAccess(@org.springframework.lang.NonNull UUID patientId, String reason) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        if (currentUser.getRole() != Role.DOCTOR) {
            throw new ForbiddenException("Only doctors can request access to patient records");
        }

        UUID doctorUserId = currentUser.getId();
        if (doctorUserId == null) {
            throw new UnauthorizedException("Doctor user ID is missing");
        }
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        // Check if there's already a pending request
        if (accessRequestRepository.existsByDoctorAndPatientAndStatus(doctor, patient, AccessRequestStatus.PENDING)) {
            throw new BadRequestException("You already have a pending access request for this patient");
        }

        // Check if there's an approved request
        if (accessRequestRepository.existsByDoctorAndPatientAndStatus(doctor, patient, AccessRequestStatus.APPROVED)) {
            throw new BadRequestException("You already have approved access to this patient's records");
        }

        AccessRequest accessRequest = new AccessRequest();
        accessRequest.setDoctor(doctor);
        accessRequest.setPatient(patient);
        accessRequest.setReason(reason);
        accessRequest.setStatus(AccessRequestStatus.PENDING);
        accessRequest.setRequestDate(LocalDateTime.now());

        AccessRequest saved = accessRequestRepository.save(accessRequest);

        // Send notification to patient
        NotificationRequestDTO notificationDTO = new NotificationRequestDTO();
        notificationDTO.setUserId(patient.getUser().getId());
        notificationDTO.setTitle("Access Request");
        notificationDTO.setMessage("Dr. " + doctor.getUser().getName() + " has requested access to your medical records");
        notificationDTO.setType(NotificationType.ACCESS_REQUEST);
        notificationService.createNotification(notificationDTO);

        return convertToDTO(saved);
    }

    public List<AccessRequestDTO> getMyAccessRequests() {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        switch (currentUser.getRole()) {
            case DOCTOR -> {
                UUID doctorUserId = currentUser.getId();
                if (doctorUserId == null) {
                    throw new UnauthorizedException("Doctor user ID is missing");
                }
                Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                        .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
                return accessRequestRepository.findByDoctor(doctor).stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
            }
            case PATIENT -> {
                UUID patientUserId = currentUser.getId();
                if (patientUserId == null) {
                    throw new UnauthorizedException("Patient user ID is missing");
                }
                Patient patient = patientRepository.findByUserId(patientUserId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
                return accessRequestRepository.findByPatient(patient).stream()
                        .map(this::convertToDTO)
                        .collect(Collectors.toList());
            }
            default -> throw new ForbiddenException("Only doctors and patients can view access requests");
        }
    }

    @Transactional
    public AccessRequestDTO respondToAccessRequest(@org.springframework.lang.NonNull UUID requestId, boolean approve, String response) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        if (currentUser.getRole() != Role.PATIENT) {
            throw new ForbiddenException("Only patients can respond to access requests");
        }

        UUID patientUserId = currentUser.getId();
        if (patientUserId == null) {
            throw new UnauthorizedException("Patient user ID is missing");
        }
        Patient patient = patientRepository.findByUserId(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        AccessRequest accessRequest = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request", "id", requestId));

        if (!accessRequest.getPatient().getId().equals(patient.getId())) {
            throw new ForbiddenException("You can only respond to your own access requests");
        }

        if (accessRequest.getStatus() != AccessRequestStatus.PENDING) {
            throw new BadRequestException("This access request has already been responded to");
        }

        accessRequest.setStatus(approve ? AccessRequestStatus.APPROVED : AccessRequestStatus.REJECTED);
        accessRequest.setResponseDate(LocalDateTime.now());
        accessRequest.setPatientResponse(response);

        AccessRequest updated = accessRequestRepository.save(accessRequest);

        // Notify doctor
        String notificationMessage = approve 
                ? "Your access request for " + patient.getUser().getName() + "'s medical records has been approved"
                : "Your access request for " + patient.getUser().getName() + "'s medical records has been rejected";
        
        NotificationRequestDTO notificationDTO = new NotificationRequestDTO();
        notificationDTO.setUserId(accessRequest.getDoctor().getUser().getId());
        notificationDTO.setTitle("Access Request Response");
        notificationDTO.setMessage(notificationMessage);
        notificationDTO.setType(NotificationType.ACCESS_RESPONSE);
        notificationService.createNotification(notificationDTO);

        return convertToDTO(updated);
    }

    @Transactional
    public void revokeAccess(@org.springframework.lang.NonNull UUID requestId) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        if (currentUser.getRole() != Role.PATIENT) {
            throw new ForbiddenException("Only patients can revoke access");
        }

        UUID patientUserId = currentUser.getId();
        if (patientUserId == null) {
            throw new UnauthorizedException("Patient user ID is missing");
        }
        Patient patient = patientRepository.findByUserId(patientUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        AccessRequest accessRequest = accessRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request", "id", requestId));

        if (!accessRequest.getPatient().getId().equals(patient.getId())) {
            throw new ForbiddenException("You can only revoke your own access grants");
        }

        if (accessRequest.getStatus() != AccessRequestStatus.APPROVED) {
            throw new BadRequestException("Can only revoke approved access requests");
        }

        accessRequest.setStatus(AccessRequestStatus.REVOKED);
        accessRequest.setResponseDate(LocalDateTime.now());
        accessRequestRepository.save(accessRequest);

        // Notify doctor
        NotificationRequestDTO notificationDTO = new NotificationRequestDTO();
        notificationDTO.setUserId(accessRequest.getDoctor().getUser().getId());
        notificationDTO.setTitle("Access Revoked");
        notificationDTO.setMessage(patient.getUser().getName() + " has revoked your access to their medical records");
        notificationDTO.setType(NotificationType.ACCESS_REVOKED);
        notificationService.createNotification(notificationDTO);
    }

    public boolean hasAccess(@org.springframework.lang.NonNull UUID doctorId, @org.springframework.lang.NonNull UUID patientId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", doctorId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));

        return accessRequestRepository.existsByDoctorAndPatientAndStatus(doctor, patient, AccessRequestStatus.APPROVED);
    }

    private AccessRequestDTO convertToDTO(AccessRequest accessRequest) {
        return new AccessRequestDTO(
                accessRequest.getId(),
                accessRequest.getDoctor().getId(),
                accessRequest.getDoctor().getUser().getName(),
                accessRequest.getPatient().getId(),
                accessRequest.getPatient().getUser().getName(),
                accessRequest.getReason(),
                accessRequest.getStatus().name(),
                accessRequest.getRequestDate(),
                accessRequest.getResponseDate(),
                accessRequest.getPatientResponse(),
                accessRequest.getCreatedAt(),
                accessRequest.getUpdatedAt()
        );
    }
}
