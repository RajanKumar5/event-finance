package com.eventfinance.backend.security;

import com.eventfinance.backend.user.AppUser;
import com.eventfinance.backend.user.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
public class AdminUserSeeder
        implements CommandLineRunner {

    private final AppUserRepository
            appUserRepository;

    private final PasswordEncoder
            passwordEncoder;


    @Value(
            "${app.bootstrap-admin.username:admin}"
    )
    private String adminUsername;


    @Value(
            "${app.bootstrap-admin.password:}"
    )
    private String adminPassword;


    @Value(
            "${app.bootstrap-admin.display-name:Administrator}"
    )
    private String adminDisplayName;


    public AdminUserSeeder(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.appUserRepository =
                appUserRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    @Override
    public void run(
            String... args
    ) {

        if (
                adminPassword == null ||
                        adminPassword.isBlank()
        ) {

            return;
        }


        if (
                appUserRepository
                        .existsByUsernameIgnoreCase(
                                adminUsername
                        )
        ) {

            return;
        }


        AppUser admin =
                new AppUser();


        admin.setUsername(
                adminUsername
                        .trim()
        );


        admin.setDisplayName(
                adminDisplayName
                        .trim()
        );


        admin.setPasswordHash(
                passwordEncoder
                        .encode(
                                adminPassword
                        )
        );


        admin.setRole(
                Role.ADMIN
        );


        admin.setEnabled(
                true
        );


        appUserRepository.save(
                admin
        );
    }
}