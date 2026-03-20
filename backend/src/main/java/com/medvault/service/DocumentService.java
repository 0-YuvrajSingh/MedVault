package com.medvault.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medvault.dto.DocumentRequestDTO;
import com.medvault.dto.DocumentResponseDTO;
import com.medvault.dto.NotificationRequestDTO;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.model.Doctor;
import com.medvault.model.Document;
import com.medvault.model.DocumentType;
import com.medvault.model.NotificationType;
import com.medvault.model.Patient;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.DocumentRepository;
import com.medvault.repository.PatientRepository;

@Service
public class DocumentService {
        private final DocumentRepository documentRepository;
        private final PatientRepository patientRepository;
        private final DoctorRepository doctorRepository;
        private final NotificationService notificationService;
        private final EmailService emailService;
        private final AuditService auditService;

        public DocumentService(DocumentRepository documentRepository,
                                                  PatientRepository patientRepository,
                                                  DoctorRepository doctorRepository,
                                                  NotificationService notificationService,
                                                  EmailService emailService,
                                                  AuditService auditService) {
                this.documentRepository = documentRepository;
                this.patientRepository = patientRepository;
                this.doctorRepository = doctorRepository;
                this.notificationService = notificationService;
                this.emailService = emailService;
                this.auditService = auditService;
        }

        @Transactional
        public DocumentResponseDTO createDocument(@org.springframework.lang.NonNull DocumentRequestDTO request) {
                UUID patientId = request.getPatientId();
                if (patientId == null) throw new IllegalArgumentException("Patient ID cannot be null");
                Patient patient = patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

                Doctor uploadedByDoctor = null;
                UUID uploadedByDoctorId = request.getUploadedByDoctorId();
                if (uploadedByDoctorId != null) {
                        uploadedByDoctor = doctorRepository.findById(uploadedByDoctorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + uploadedByDoctorId));
                }

                Document document = new Document();
                document.setPatient(patient);
                document.setUploadedByDoctor(uploadedByDoctor);
                document.setFileName(request.getFileName());
                document.setDocumentType(DocumentType.valueOf(request.getDocumentType().toUpperCase()));
                document.setFilePath(request.getFilePath());
                document.setDescription(request.getDescription());
                document.setFileSize(request.getFileSize());
                document.setUploadDate(request.getUploadDate());
                document.setIsVerified(false);

                Document savedDocument = documentRepository.save(document);

                if (uploadedByDoctor != null) {
                        auditService.logActionWithUserId(
                                uploadedByDoctor.getUser().getId(),
                                uploadedByDoctor.getUser().getName(),
                                uploadedByDoctor.getUser().getRole(),
                                "CREATE",
                                "Document",
                                savedDocument.getId(),
                                "Uploaded document '" + document.getFileName() + "' for patient " + patient.getUser().getName()
                        );
                } else {
                        auditService.logActionWithUserId(
                                patient.getUser().getId(),
                                patient.getUser().getName(),
                                patient.getUser().getRole(),
                                "CREATE",
                                "Document",
                                savedDocument.getId(),
                                "Patient uploaded document '" + document.getFileName() + "'"
                        );
                }

                notificationService.createNotification(new NotificationRequestDTO(
                        patient.getUser().getId(),
                        "Document Uploaded",
                        "New " + document.getDocumentType() + " document uploaded: " + document.getFileName(),
                        NotificationType.DOCUMENT
                ));

                return toResponseDTO(savedDocument);
        }


        public List<DocumentResponseDTO> getAllDocuments() {
                return documentRepository.findAll().stream()
                                .map(this::toResponseDTO)
                                .toList();
        }


        public List<DocumentResponseDTO> getDocumentsByPatientId(@org.springframework.lang.NonNull UUID patientId) {
                return documentRepository.findByPatient_IdOrderByUploadDateDesc(patientId).stream()
                                .map(this::toResponseDTO)
                                .toList();
        }


        public List<DocumentResponseDTO> getDocumentsByDoctorId(@org.springframework.lang.NonNull UUID doctorId) {
                return documentRepository.findByUploadedByDoctor_Id(doctorId).stream()
                                .map(this::toResponseDTO)
                                .toList();
        }

        public List<DocumentResponseDTO> getDocumentsByType(String type) {
                DocumentType documentType = DocumentType.valueOf(type.toUpperCase());
                return documentRepository.findByDocumentType(documentType).stream()
                                .map(this::toResponseDTO)
                                .toList();
        }

        public DocumentResponseDTO getDocumentById(@org.springframework.lang.NonNull UUID id) {
                Document document = documentRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));
                return toResponseDTO(document);
        }

        public List<DocumentResponseDTO> getUnverifiedDocuments() {
                return documentRepository.findByIsVerified(false).stream()
                                .map(this::toResponseDTO)
                                .toList();
        }

        @Transactional
        public DocumentResponseDTO verifyDocument(@org.springframework.lang.NonNull UUID id, @org.springframework.lang.NonNull UUID doctorId) {
                Document document = documentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

                Doctor doctor = doctorRepository.findById(doctorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

                document.setIsVerified(true);
                document.setVerifiedDate(LocalDateTime.now());
                document.setVerifiedByDoctor(doctor);

                Document verifiedDocument = documentRepository.save(document);

                auditService.logActionWithUserId(
                        doctor.getUser().getId(),
                        doctor.getUser().getName(),
                        doctor.getUser().getRole(),
                        "VERIFY",
                        "Document",
                        verifiedDocument.getId(),
                        "Verified document '" + document.getFileName() + "' for patient " + document.getPatient().getUser().getName()
                );

                notificationService.createNotification(new NotificationRequestDTO(
                        document.getPatient().getUser().getId(),
                        "Document Verified",
                        "Your " + document.getDocumentType() + " document '" + document.getFileName() + "' has been verified by Dr. " + doctor.getUser().getName(),
                        NotificationType.DOCUMENT
                ));

                emailService.sendDocumentVerification(
                        document.getPatient().getUser().getEmail(),
                        document.getPatient().getUser().getName(),
                        document.getFileName(),
                        doctor.getUser().getName(),
                        true
                );

                return toResponseDTO(verifiedDocument);
        }

        @Transactional
        public DocumentResponseDTO updateDocument(@org.springframework.lang.NonNull UUID id, DocumentRequestDTO request) {
                Document document = documentRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));
                document.setFileName(request.getFileName());
                document.setDocumentType(DocumentType.valueOf(request.getDocumentType().toUpperCase()));
                document.setDescription(request.getDescription());

                Document updatedDocument = documentRepository.save(document);

                auditService.logActionWithUserId(
                        document.getPatient().getUser().getId(),
                        document.getPatient().getUser().getName(),
                        document.getPatient().getUser().getRole(),
                        "UPDATE",
                        "Document",
                        updatedDocument.getId(),
                        "Updated document metadata to name '" + document.getFileName() + "'"
                );
                return toResponseDTO(updatedDocument);
        }

        @Transactional
        public void deleteDocument(@org.springframework.lang.NonNull UUID id) {
                if (!documentRepository.existsById(id)) {
                        throw new ResourceNotFoundException("Document not found with ID: " + id);
                }
                Document existing = documentRepository.findById(id).orElse(null);
                documentRepository.deleteById(id);

                if (existing != null) {
                        auditService.logActionWithUserId(
                                existing.getPatient().getUser().getId(),
                                existing.getPatient().getUser().getName(),
                                existing.getPatient().getUser().getRole(),
                                "DELETE",
                                "Document",
                                id,
                                "Deleted document '" + existing.getFileName() + "'"
                        );
                }
        }

        private DocumentResponseDTO toResponseDTO(Document document) {
                return new DocumentResponseDTO(
                        document.getId(),
                        document.getPatient().getId(),
                        document.getPatient().getUser().getName(),
                        (document.getUploadedByDoctor() != null ? document.getUploadedByDoctor().getId() : null),
                        (document.getUploadedByDoctor() != null ? document.getUploadedByDoctor().getUser().getName() : null),
                        document.getFileName(),
                        document.getDocumentType().name(),
                        document.getFilePath(),
                        document.getDescription(),
                        document.getFileSize(),
                        document.getUploadDate(),
                        document.getIsVerified(),
                        document.getVerifiedDate(),
                        (document.getVerifiedByDoctor() != null ? document.getVerifiedByDoctor().getId() : null),
                        (document.getVerifiedByDoctor() != null ? document.getVerifiedByDoctor().getUser().getName() : null),
                        document.getCreatedAt(),
                        document.getUpdatedAt()
                );
        }
}
