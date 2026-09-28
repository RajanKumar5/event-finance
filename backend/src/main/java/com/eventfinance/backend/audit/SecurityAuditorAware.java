package com.eventfinance.backend.audit;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component("auditorAware")
public class SecurityAuditorAware
        implements AuditorAware<String> {


    @Override
    public Optional<String> getCurrentAuditor() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();


        if (
                authentication == null ||
                        !authentication.isAuthenticated() ||
                        "anonymousUser".equals(
                                authentication.getPrincipal()
                        )
        ) {

            return Optional.of(
                    "SYSTEM"
            );
        }


        String username =
                authentication.getName();


        if (
                username == null ||
                        username.isBlank()
        ) {

            return Optional.of(
                    "SYSTEM"
            );
        }


        return Optional.of(
                username
        );
    }
}