package com.eventfinance.backend.event;

import com.eventfinance.backend.event.dto.EventRequest;
import com.eventfinance.backend.event.dto.EventResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public EventResponse createEvent(EventRequest request) {

        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        Event event = new Event();
        event.setName(request.name());
        event.setEventType(request.eventType());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setBudget(request.budget());
        event.setStatus(request.status());

        Event savedEvent = eventRepository.save(event);

        return mapToResponse(savedEvent);
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Event not found with id: " + id)
                );

        return mapToResponse(event);
    }

    private EventResponse mapToResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getName(),
                event.getEventType(),
                event.getStartDate(),
                event.getEndDate(),
                event.getBudget(),
                event.getStatus(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}