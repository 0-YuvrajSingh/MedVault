package com.medvault.service;

import com.medvault.dto.MedicalRecordResponse;
import com.medvault.entity.MedicalRecord;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.exception.AccessDeniedException;
import com.medvault.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class PatientService {

    private final MedicalRecordRepository medicalRecordRepository;

    public PatientService(MedicalRecordRepository medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordResponse> getRecords(UUID patientId, Pageable pageable) {
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getRecord(UUID recordId, UUID requesterId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record not found"));

        if (!record.getPatient().getId().equals(requesterId)) {
            throw new AccessDeniedException("You do not have permission to view this record");
        }

        return mapToResponse(record);
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return new MedicalRecordResponse(
                record.getId(),
                record.getPatient().getId(),
                record.getDoctor().getFullName(),
                record.getDiagnosis(),
                record.getPrescription(),
                record.getNotes(),
                record.getRecordDate(),
                record.getCreatedAt()
        );
    }
}
