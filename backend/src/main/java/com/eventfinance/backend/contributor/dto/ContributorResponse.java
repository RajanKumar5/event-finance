package com.eventfinance.backend.contributor.dto;

import com.eventfinance.backend.contributor.Area;

import java.time.LocalDateTime;

public record ContributorResponse(
        Long id,
        String name,
        String houseNumber,
        Area area,
        String address,
        String phone,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}