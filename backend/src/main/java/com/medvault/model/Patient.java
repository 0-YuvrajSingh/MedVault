package com.medvault.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_user_id", columnList = "user_id"),
    @Index(name = "idx_patient_phone", columnList = "phone")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    private String bloodGroup;

    private String gender;

    @Column(length = 500)
    private String address;

    private String phoneNumber;

    private String emergencyContactName;

    private String emergencyContactPhone;

    @Column(length = 1000)
    private String medicalHistory;

    @Column(length = 500)
    private String allergies;


    // New fields for extended profile
    private String maritalStatus;

    private String aadhaarNumber;

    @Column(columnDefinition = "TEXT")
    private String lifestyle; // Store as JSON string

    @Column(columnDefinition = "TEXT")
    private String currentHealth; // Store as JSON string

    // Profile picture URL or path
    private String profilePicture;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}

