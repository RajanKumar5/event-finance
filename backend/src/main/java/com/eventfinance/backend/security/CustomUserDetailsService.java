package com.eventfinance.backend.security;

import com.eventfinance.backend.user.AppUser;
import com.eventfinance.backend.user.AppUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final AppUserRepository
            appUserRepository;


    public CustomUserDetailsService(
            AppUserRepository appUserRepository
    ) {

        this.appUserRepository =
                appUserRepository;
    }


    @Override
    public UserDetails loadUserByUsername(
            String username
    ) throws UsernameNotFoundException {

        AppUser user =
                appUserRepository
                        .findByUsernameIgnoreCase(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new UsernameNotFoundException(
                                                "User not found"
                                        )
                        );


        return User
                .withUsername(
                        user.getUsername()
                )
                .password(
                        user.getPasswordHash()
                )
                .roles(
                        user.getRole()
                                .name()
                )
                .disabled(
                        !Boolean.TRUE.equals(
                                user.getEnabled()
                        )
                )
                .build();
    }
}