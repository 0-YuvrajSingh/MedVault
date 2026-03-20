package com.medvault.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.medvault.model.Appointment;
import com.medvault.model.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByDoctor_Id(UUID doctorId);

    List<Appointment> findByPatient_Id(UUID patientId);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByDoctor_IdAndStatus(UUID doctorId, AppointmentStatus status);

    List<Appointment> findByPatient_IdAndStatus(UUID patientId, AppointmentStatus status);

    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);

    List<Appointment> findByDoctor_IdAndAppointmentDateBetween(UUID doctorId, LocalDateTime start, LocalDateTime end);

    // Added for patient filtered time-series
    List<Appointment> findByPatient_IdAndAppointmentDateBetween(UUID patientId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByStatusAndAppointmentDateBefore(AppointmentStatus status, LocalDateTime date);

    List<Appointment> findByStatusAndAppointmentDateBetween(AppointmentStatus status, LocalDateTime start, LocalDateTime end);

    // Paginated search methods
    Page<Appointment> findByDoctor_Id(UUID doctorId, Pageable pageable);

    Page<Appointment> findByPatient_Id(UUID patientId, Pageable pageable);

    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByDoctor_IdAndStatus(UUID doctorId, AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByPatient_IdAndStatus(UUID patientId, AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Appointment> findByDoctor_IdAndAppointmentDateBetween(UUID doctorId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    Page<Appointment> findByPatient_IdAndAppointmentDateBetween(UUID patientId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE "
            + "a.doctor.id = :doctorId AND "
            + "a.status = :status AND "
            + "a.appointmentDate BETWEEN :start AND :end")
    Page<Appointment> findByDoctorStatusAndDateRange(
            @Param("doctorId") UUID doctorId,
            @Param("status") AppointmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    @Query("SELECT a FROM Appointment a WHERE "
            + "a.patient.id = :patientId AND "
            + "a.status = :status AND "
            + "a.appointmentDate BETWEEN :start AND :end")
    Page<Appointment> findByPatientStatusAndDateRange(
            @Param("patientId") UUID patientId,
            @Param("status") AppointmentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.id = :doctorId")
    List<com.medvault.model.Patient> findDistinctPatientsByDoctorId(@Param("doctorId") UUID doctorId);
}
