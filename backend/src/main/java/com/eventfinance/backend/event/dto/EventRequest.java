package com.eventfinance.backend.event.dto;

import com.eventfinance.backend.event.EventStatus;
import com.eventfinance.backend.event.EventType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EventRequest(

        @NotBlank(message = "Event name is required")
        @Size(max = 150, message = "Event name cannot exceed 150 characters")
        String name,

        @NotNull(message = "Event type is required")
        EventType eventType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @DecimalMin(value = "0.0", inclusive = true,
                message = "Budget cannot be negative")
        BigDecimal budget,

        @NotNull(message = "Event status is required")
        EventStatus status
) {
}