package com.medvault.service;

import com.medvault.dto.TimelineEventResponse;
import com.medvault.repository.TimelineEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TimelineEventService {

    private final TimelineEventRepository timelineEventRepository;

    public TimelineEventService(TimelineEventRepository timelineEventRepository) {
        this.timelineEventRepository = timelineEventRepository;
    }

    @Transactional(readOnly = true)
    public List<TimelineEventResponse> getEvents(UUID userId) {
        return timelineEventRepository.findByUserIdOrderByEventDateDescCreatedAtDesc(userId)
                .stream()
                .map(e -> TimelineEventResponse.builder()
                        .id(e.getId())
                        .title(e.getTitle())
                        .description(e.getDescription())
                        .eventDate(e.getEventDate())
                        .eventType(e.getEventType().name())
                        .createdAt(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
