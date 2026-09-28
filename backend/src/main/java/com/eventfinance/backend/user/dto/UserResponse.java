package com.eventfinance.backend.user.dto;

import com.eventfinance.backend.security.Role;

import java.time.LocalDateTime;


public record UserResponse(

        Long id,

        String username,

        String displayName,

        Role role,

        Boolean enabled,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}