package com.medvault.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.medvault.dto.SlotRequestDTO;
import com.medvault.dto.SlotResponseDTO;
import com.medvault.exception.BadRequestException;
import com.medvault.exception.ResourceNotFoundException;
import com.medvault.exception.UnauthorizedException;
import com.medvault.model.Doctor;
import com.medvault.model.Slot;
import com.medvault.model.User;
import com.medvault.repository.DoctorRepository;
import com.medvault.repository.SlotRepository;
import com.medvault.repository.UserRepository;

@Service
public class SlotService {

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public SlotService(SlotRepository slotRepository, DoctorRepository doctorRepository, UserRepository userRepository) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @CacheEvict(value = "availableSlots", key = "#email")
    public SlotResponseDTO createSlot(String email, SlotRequestDTO requestDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        Doctor doctor = doctorRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "userId", user.getId()));

        // Validate slot times
        if (requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        Slot slot = new Slot();
        slot.setDoctor(doctor);
        slot.setStartTime(requestDTO.getStartTime());
        slot.setEndTime(requestDTO.getEndTime());
        Integer maxAppointments = requestDTO.getMaxAppointments();
        slot.setMaxAppointments(maxAppointments != null ? maxAppointments : 1);
        slot.setCurrentAppointments(0);
        slot.setAvailable(true);

        Slot savedSlot = slotRepository.save(slot);
        return toResponseDTO(savedSlot);
    }

    public List<SlotResponseDTO> getMySlots(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        Doctor doctor = doctorRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        List<Slot> slots = slotRepository.findByDoctor_IdAndStartTimeAfter(doctor.getId(), LocalDateTime.now());
        return slots.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public List<SlotResponseDTO> getAllSlotsByDoctor(UUID doctorId) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        List<Slot> slots = slotRepository.findByDoctor_Id(doctorId);
        return slots.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "availableSlots", key = "#doctorId")
    public List<SlotResponseDTO> getAvailableSlotsByDoctor(UUID doctorId) {
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID cannot be null");
        }
        LocalDateTime now = LocalDateTime.now();
        List<Slot> slots = slotRepository.findByDoctor_IdAndAvailableTrueAndStartTimeAfter(doctorId, now);
        // Filter out slots that are full
        return slots.stream()
            .filter(slot -> slot.getCurrentAppointments() < slot.getMaxAppointments())
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    public SlotResponseDTO getSlotById(UUID slotId) {
        if (slotId == null) {
            throw new IllegalArgumentException("Slot ID cannot be null");
        }
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        return toResponseDTO(slot);
    }

    @CacheEvict(value = "availableSlots", allEntries = true)
    public void deleteSlot(UUID slotId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        Doctor doctor = doctorRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile", "userId", user.getId()));

        if (slotId == null) {
            throw new IllegalArgumentException("Slot ID cannot be null");
        }
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new ResourceNotFoundException("Slot", "id", slotId));

        // Verify the slot belongs to this doctor
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new UnauthorizedException("Cannot delete another doctor's slot");
        }

        // Check if slot has appointments
        if (slot.getCurrentAppointments() > 0) {
            throw new BadRequestException("Cannot delete slot with existing appointments");
        }

        slotRepository.delete(slot);
    }

    @CacheEvict(value = "availableSlots", allEntries = true)
    public void incrementAppointmentCount(UUID slotId) {
        if (slotId == null) {
            throw new IllegalArgumentException("Slot ID cannot be null");
        }
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new ResourceNotFoundException("Slot", "id", slotId));

        if (slot.getCurrentAppointments() >= slot.getMaxAppointments()) {
            throw new BadRequestException("Slot is full");
        }

        slot.setCurrentAppointments(slot.getCurrentAppointments() + 1);
        
        // Mark as unavailable if full
        if (slot.getCurrentAppointments() >= slot.getMaxAppointments()) {
            slot.setAvailable(false);
        }

        slotRepository.save(slot);
    }

    public void decrementAppointmentCount(UUID slotId) {
        if (slotId == null) {
            throw new IllegalArgumentException("Slot ID cannot be null");
        }
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getCurrentAppointments() > 0) {
            slot.setCurrentAppointments(slot.getCurrentAppointments() - 1);
            slot.setAvailable(true);
            slotRepository.save(slot);
        }
    }

    public boolean isSlotAvailable(UUID slotId) {
        if (slotId == null) {
            throw new IllegalArgumentException("Slot ID cannot be null");
        }
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));

        return slot.getAvailable() && 
               slot.getCurrentAppointments() < slot.getMaxAppointments() &&
               slot.getStartTime().isAfter(LocalDateTime.now());
    }

    private SlotResponseDTO toResponseDTO(Slot slot) {
        SlotResponseDTO dto = new SlotResponseDTO();
        dto.setId(slot.getId());
        dto.setDoctorId(slot.getDoctor().getId());
        dto.setDoctorName(slot.getDoctor().getUser().getName());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        dto.setMaxAppointments(slot.getMaxAppointments());
        dto.setCurrentAppointments(slot.getCurrentAppointments());
        dto.setAvailable(slot.getAvailable());
        dto.setCreatedAt(slot.getCreatedAt());
        dto.setUpdatedAt(slot.getUpdatedAt());
        return dto;
    }
}
