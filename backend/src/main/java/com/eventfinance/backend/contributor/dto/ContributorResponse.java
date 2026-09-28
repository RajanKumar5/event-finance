package com.eventfinance.backend.contributor.dto;

import java.time.LocalDateTime;

public record ContributorResponse(

        Long id,

        String name,

        String houseNumber,

        Long areaId,

        String area,

        String areaName,

        String address,

        String phone,

        String notes,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}