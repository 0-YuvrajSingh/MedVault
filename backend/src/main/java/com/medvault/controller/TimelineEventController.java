package com.medvault.controller;

import com.medvault.dto.TimelineEventResponse;
import com.medvault.service.TimelineEventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
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
    public ResponseEntity<Page<TimelineEventResponse>> getDoctorTimeline(
            Principal principal,
            @PageableDefault(size = 20, sort = "eventDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(timelineEventService.getEvents(UUID.fromString(principal.getName()), pageable));
    }

    @GetMapping("/patient/timeline")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Page<TimelineEventResponse>> getPatientTimeline(
            Principal principal,
            @PageableDefault(size = 20, sort = "eventDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(timelineEventService.getEvents(UUID.fromString(principal.getName()), pageable));
    }
}
