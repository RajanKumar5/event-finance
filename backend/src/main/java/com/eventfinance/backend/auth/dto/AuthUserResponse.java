package com.eventfinance.backend.auth.dto;

import com.eventfinance.backend.security.Role;


public record AuthUserResponse(

        Long id,

        String username,

        String displayName,

        Role role

) {
}