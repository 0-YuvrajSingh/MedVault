package com.medvault.controller;

import com.medvault.dto.SlotRequestDTO;
import com.medvault.dto.SlotResponseDTO;
import com.medvault.dto.ApiResponse;
import com.medvault.service.SlotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<SlotResponseDTO>> createSlot(
            @Valid @RequestBody SlotRequestDTO requestDTO,
            Authentication authentication) {
        String email = authentication.getName();
        SlotResponseDTO slot = slotService.createSlot(email, requestDTO);
        return ResponseEntity.ok(ApiResponse.success("Slot created", slot));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<SlotResponseDTO>>> getMySlots(Authentication authentication) {
        String email = authentication.getName();
        List<SlotResponseDTO> slots = slotService.getMySlots(email);
        return ResponseEntity.ok(ApiResponse.success("Doctor slots fetched", slots));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<SlotResponseDTO>>> getDoctorSlots(@PathVariable UUID doctorId) {
        List<SlotResponseDTO> slots = slotService.getAllSlotsByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Slots by doctor fetched", slots));
    }

    @GetMapping("/available/{doctorId}")
    public ResponseEntity<ApiResponse<List<SlotResponseDTO>>> getAvailableSlots(@PathVariable UUID doctorId) {
        List<SlotResponseDTO> slots = slotService.getAvailableSlotsByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Available slots fetched", slots));
    }

    @GetMapping("/{slotId}")
    public ResponseEntity<ApiResponse<SlotResponseDTO>> getSlotById(@PathVariable UUID slotId) {
        SlotResponseDTO slot = slotService.getSlotById(slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot fetched", slot));
    }

    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(
            @PathVariable UUID slotId,
            Authentication authentication) {
        String email = authentication.getName();
        slotService.deleteSlot(slotId, email);
        return ResponseEntity.ok(ApiResponse.success("Slot deleted", null));
    }

    @GetMapping("/check-availability/{slotId}")
    public ResponseEntity<ApiResponse<Boolean>> checkSlotAvailability(@PathVariable UUID slotId) {
        boolean available = slotService.isSlotAvailable(slotId);
        return ResponseEntity.ok(ApiResponse.success("Slot availability checked", available));
    }
}
