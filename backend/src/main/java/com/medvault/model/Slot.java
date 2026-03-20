package com.medvault.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
// Removed Lombok imports

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "slots", indexes = {
    @Index(name = "idx_slot_doctor_id", columnList = "doctor_id"),
    @Index(name = "idx_slot_available", columnList = "available"),
    @Index(name = "idx_slot_start_time", columnList = "startTime"),
    @Index(name = "idx_slot_composite", columnList = "doctor_id, available, startTime")
})
// Removed Lombok annotations
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor is required")
    private Doctor doctor;

    @Column(nullable = false)
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @Column(nullable = false)
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Column(nullable = false)
    @Min(value = 1, message = "Maximum appointments must be at least 1")
    private Integer maxAppointments = 1;

    @Column(nullable = false)
    private Integer currentAppointments = 0;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // No-args constructor
    public Slot() {}

    // All-args constructor
    public Slot(UUID id, Doctor doctor, LocalDateTime startTime, LocalDateTime endTime, Integer maxAppointments, Integer currentAppointments, Boolean available, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.doctor = doctor;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxAppointments = maxAppointments;
        this.currentAppointments = currentAppointments;
        this.available = available;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Integer getMaxAppointments() { return maxAppointments; }
    public void setMaxAppointments(Integer maxAppointments) { this.maxAppointments = maxAppointments; }
    public Integer getCurrentAppointments() { return currentAppointments; }
    public void setCurrentAppointments(Integer currentAppointments) { this.currentAppointments = currentAppointments; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
