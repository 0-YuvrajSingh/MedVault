package com.medvault.service;

import com.medvault.dto.TimelineEventResponse;
import com.medvault.entity.EventType;
import com.medvault.entity.TimelineEvent;
import com.medvault.repository.TimelineEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    public Page<TimelineEventResponse> getEvents(UUID userId, Pageable pageable) {
        return timelineEventRepository.findByUserIdOrderByEventDateDescCreatedAtDesc(userId, pageable)
                .map(e -> TimelineEventResponse.builder()
                        .id(e.getId())
                        .title(e.getTitle())
                        .description(e.getDescription())
                        .eventDate(e.getEventDate())
                        .eventType(e.getEventType().name())
                        .createdAt(e.getCreatedAt())
                        .build());
    }

    /**
     * Creates and persists a timeline event for the given user.
     * Called within the same transaction as the triggering business operation.
     */
    @Transactional
    public void createEvent(UUID userId, String title, String description, EventType eventType) {
        TimelineEvent event = TimelineEvent.builder()
                .userId(userId)
                .title(title)
                .description(description)
                .eventType(eventType)
                .eventDate(LocalDate.now())
                .build();
        timelineEventRepository.save(event);
    }
}
