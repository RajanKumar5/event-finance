package com.eventfinance.backend.user.dto;

import com.eventfinance.backend.security.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record UpdateUserRequest(

        @NotBlank(
                message = "Display name is required"
        )
        @Size(
                max = 150,
                message = "Display name must not exceed 150 characters"
        )
        String displayName,


        @NotNull(
                message = "Role is required"
        )
        Role role,


        @NotNull(
                message = "Enabled status is required"
        )
        Boolean enabled

) {
}