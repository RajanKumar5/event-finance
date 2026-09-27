package com.eventfinance.backend.event.dto;

import com.eventfinance.backend.event.EventStatus;
import com.eventfinance.backend.event.EventType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String name,
        EventType eventType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal budget,
        EventStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}