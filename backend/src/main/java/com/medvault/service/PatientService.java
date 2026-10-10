package com.medvault.service;

import com.medvault.dto.DoctorResponse;
import com.medvault.dto.MedicalRecordResponse;
import com.medvault.entity.MedicalRecord;
import com.medvault.entity.PatientDoctorAssignment;
import com.medvault.entity.User;
import com.medvault.exception.AccessDeniedException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.repository.MedicalRecordRepository;
import com.medvault.repository.PatientDoctorAssignmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class PatientService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientDoctorAssignmentRepository assignmentRepository;
    private final WorkspaceAccessService workspaceAccessService;

    public PatientService(MedicalRecordRepository medicalRecordRepository,
                          PatientDoctorAssignmentRepository assignmentRepository,
                          WorkspaceAccessService workspaceAccessService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.assignmentRepository = assignmentRepository;
        this.workspaceAccessService = workspaceAccessService;
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordResponse> getRecords(UUID patientId, Pageable pageable) {
        // Visibility enforced in the query (with matching count) so pagination totals
        // never reveal hidden workspace-scoped rows.
        return medicalRecordRepository.findVisibleByPatientId(patientId, patientId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public MedicalRecordResponse getRecord(UUID recordId, UUID requesterId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Record not found"));

        // Workspace gate first (non-members get 404), then the ownership check (403).
        workspaceAccessService.requireMemberOf(record.getWorkspace(), requesterId);

        if (!record.getPatient().getId().equals(requesterId)) {
            throw new AccessDeniedException("You do not have permission to view this record");
        }

        return mapToResponse(record);
    }

    @Transactional(readOnly = true)
    public DoctorResponse getMyDoctor(UUID patientId) {
        // Only return the ACTIVE assignment
        Optional<PatientDoctorAssignment> assignmentOpt =
                assignmentRepository.findByPatientIdAndIsActiveTrue(patientId);

        if (assignmentOpt.isEmpty()) {
            return null;
        }

        PatientDoctorAssignment assignment = assignmentOpt.get();
        // A patient who is not an active member of the assignment's workspace
        // sees no doctor (association hidden, consistent with the 404 rule).
        if (assignment.getWorkspace() != null
                && !workspaceAccessService.isActiveMember(
                        assignment.getWorkspace().getId(), patientId)) {
            return null;
        }

        User doctor = assignment.getDoctor();
        return new DoctorResponse(doctor.getId(), doctor.getFullName(), doctor.getEmail(), assignment.getAssignedAt());
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
