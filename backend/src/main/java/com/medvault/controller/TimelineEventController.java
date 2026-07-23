package com.medvault.controller;

import com.medvault.dto.TimelineEventResponse;
import com.medvault.service.TimelineEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class TimelineEventController {

    private final TimelineEventService timelineEventService;

    public TimelineEventController(TimelineEventService timelineEventService) {
        this.timelineEventService = timelineEventService;
    }

    @GetMapping("/doctor/timeline")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<TimelineEventResponse>> getDoctorTimeline(Principal principal) {
        return ResponseEntity.ok(timelineEventService.getEvents(UUID.fromString(principal.getName())));
    }

    @GetMapping("/patient/timeline")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<TimelineEventResponse>> getPatientTimeline(Principal principal) {
        return ResponseEntity.ok(timelineEventService.getEvents(UUID.fromString(principal.getName())));
    }
}
