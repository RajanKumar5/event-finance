package com.eventfinance.backend.contributor.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContributorRequest(

        @NotBlank(
                message = "Contributor name is required"
        )
        @Size(
                max = 150,
                message = "Contributor name cannot exceed 150 characters"
        )
        String name,

        @NotBlank(
                message = "House number is required"
        )
        @Size(
                max = 100,
                message = "House number cannot exceed 100 characters"
        )
        String houseNumber,

        @NotBlank(
                message = "Area is required"
        )
        String area,

        @Size(
                max = 30,
                message = "Phone cannot exceed 30 characters"
        )
        String phone,

        @Size(
                max = 1000,
                message = "Notes cannot exceed 1000 characters"
        )
        String notes

) {
}