package com.medvault.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.MedicalRecordRequestDTO;
import com.medvault.dto.MedicalRecordResponseDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Doctor;
import com.medvault.model.MedicalRecord;
import com.medvault.model.Patient;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientRepository;
import com.medvault.repository.UserRepository;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                               DoctorRepository doctorRepository,
                               PatientRepository patientRepository,
                               UserRepository userRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MedicalRecordResponseDTO createMedicalRecord(MedicalRecordRequestDTO request) {
        // Validate doctor exists
        if (request.getDoctorId() == null) throw new IllegalArgumentException("Doctor ID cannot be null");
        Doctor doctor = doctorRepository.findById(Objects.requireNonNull(request.getDoctorId(), "Doctor ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        // Validate patient exists
        if (request.getPatientId() == null) throw new IllegalArgumentException("Patient ID cannot be null");
        Patient patient = patientRepository.findById(Objects.requireNonNull(request.getPatientId(), "Patient ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));

        // Create medical record
        MedicalRecord record = new MedicalRecord();
        record.setDoctor(doctor);
        record.setPatient(patient);
        record.setRecordDate(request.getRecordDate());
        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setPrescription(request.getPrescription());
        record.setDoctorNotes(request.getDoctorNotes());
        record.setTestResults(request.getTestResults());
        record.setFollowUpInstructions(request.getFollowUpInstructions());

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        return toResponseDTO(savedRecord);
    }

    public MedicalRecordResponseDTO getMedicalRecordById(UUID id) {
        MedicalRecord record = medicalRecordRepository.findById(Objects.requireNonNull(id, "MedicalRecord ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));
        return toResponseDTO(record);
    }

    public List<MedicalRecordResponseDTO> getAllMedicalRecords() {
        return medicalRecordRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<MedicalRecordResponseDTO> getMedicalRecordsByPatientId(UUID patientId) {
        return medicalRecordRepository.findByPatient_IdOrderByRecordDateDesc(Objects.requireNonNull(patientId, "Patient ID cannot be null")).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public List<MedicalRecordResponseDTO> getMedicalRecordsByDoctorId(UUID doctorId) {
        return medicalRecordRepository.findByDoctor_IdOrderByRecordDateDesc(Objects.requireNonNull(doctorId, "Doctor ID cannot be null")).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public List<MedicalRecordResponseDTO> getMyRecords(String email) {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
        if (user.getId() == null) throw new IllegalArgumentException("User ID cannot be null");
        var patient = patientRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + user.getId()));
        return getMedicalRecordsByPatientId(patient.getId());
    }

    public List<MedicalRecordResponseDTO> getDoctorMyRecords(String email) {
        var user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
        if (user.getId() == null) throw new IllegalArgumentException("User ID cannot be null");
        var doctor = doctorRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user id: " + user.getId()));
        return getMedicalRecordsByDoctorId(doctor.getId());
    }

    @Transactional
    public MedicalRecordResponseDTO updateMedicalRecord(UUID id, MedicalRecordRequestDTO request) {
        MedicalRecord record = medicalRecordRepository.findById(Objects.requireNonNull(id, "MedicalRecord ID cannot be null"))
            .orElseThrow(() -> new ResourceNotFoundException("Medical record not found with ID: " + id));

        record.setRecordDate(request.getRecordDate());
        record.setDiagnosis(request.getDiagnosis());
        record.setTreatment(request.getTreatment());
        record.setPrescription(request.getPrescription());
        record.setDoctorNotes(request.getDoctorNotes());
        record.setTestResults(request.getTestResults());
        record.setFollowUpInstructions(request.getFollowUpInstructions());

        MedicalRecord updatedRecord = medicalRecordRepository.save(record);
        return toResponseDTO(updatedRecord);
    }

    @Transactional
    public void deleteMedicalRecord(UUID id) {
        if (!medicalRecordRepository.existsById(Objects.requireNonNull(id, "MedicalRecord ID cannot be null"))) {
            throw new ResourceNotFoundException("Medical record not found with ID: " + id);
        }
        medicalRecordRepository.deleteById(id);
    }

    // Helper method for DTO conversion (NO MAPPER)
    private MedicalRecordResponseDTO toResponseDTO(MedicalRecord record) {
        return new MedicalRecordResponseDTO(
                record.getId(),
                record.getPatient().getId(),
                record.getPatient().getUser().getName(),
                record.getDoctor().getId(),
                record.getDoctor().getUser().getName(),
                record.getDoctor().getSpecialization(),
                record.getRecordDate(),
                record.getDiagnosis(),
                record.getTreatment(),
                record.getPrescription(),
                record.getDoctorNotes(),
                record.getTestResults(),
                record.getFollowUpInstructions(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
