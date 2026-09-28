package com.eventfinance.backend.masterdata.area.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AreaMasterRequest(

        @NotBlank(
                message = "Area code is required"
        )
        @Size(
                max = 50,
                message = "Area code cannot exceed 50 characters"
        )
        String code,

        @NotBlank(
                message = "Area name is required"
        )
        @Size(
                max = 100,
                message = "Area name cannot exceed 100 characters"
        )
        String name,

        @NotNull(
                message = "Active status is required"
        )
        Boolean active

) {
}