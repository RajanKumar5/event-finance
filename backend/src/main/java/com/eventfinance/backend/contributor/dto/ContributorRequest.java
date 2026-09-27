package com.eventfinance.backend.contributor.dto;

import com.eventfinance.backend.contributor.Area;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContributorRequest(

        @NotBlank(message = "Contributor name is required")
        @Size(max = 150)
        String name,

        @NotBlank(message = "House number is required")
        @Size(max = 30)
        String houseNumber,

        @NotNull(message = "Area is required")
        Area area,

        @Size(max = 20)
        String phone,

        @Size(max = 500)
        String notes
) {
}