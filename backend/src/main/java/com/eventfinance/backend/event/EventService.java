package com.eventfinance.backend.event;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
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
                        new ResourceNotFoundException("Event not found with id: " + id)
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

    public EventResponse updateEvent(Long id, EventRequest request) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found with id: " + id)
                );

        if (request.endDate().isBefore(request.startDate())) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        event.setName(request.name());
        event.setEventType(request.eventType());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setBudget(request.budget());
        event.setStatus(request.status());

        Event updatedEvent = eventRepository.save(event);

        return mapToResponse(updatedEvent);
    }

    public void deleteEvent(Long id) {

        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Event not found with id: " + id
            );
        }

        eventRepository.deleteById(id);
    }
}