package com.eventfinance.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration
                .getAuthenticationManager();
    }


    @Bean
    public SecurityContextRepository
    securityContextRepository() {

        return new HttpSessionSecurityContextRepository();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        CookieCsrfTokenRepository csrfTokenRepository =
                CookieCsrfTokenRepository
                        .withHttpOnlyFalse();


        http

                .cors(
                        Customizer.withDefaults()
                )

                .csrf(
                        csrf ->
                                csrf
                                        .csrfTokenRepository(
                                                csrfTokenRepository
                                        )
                                        .ignoringRequestMatchers(
                                                "/api/v1/auth/login"
                                        )
                )

                .authorizeHttpRequests(
                        authorization ->
                                authorization

                                        /*
                                         * Public authentication endpoints.
                                         */
                                        .requestMatchers(
                                                "/api/v1/auth/login",
                                                "/api/v1/auth/csrf"
                                        )
                                        .permitAll()


                                        /*
                                         * Logged-in user endpoints.
                                         */
                                        .requestMatchers(
                                                "/api/v1/auth/me",
                                                "/api/v1/auth/logout"
                                        )
                                        .authenticated()


                                        /*
                                         * User administration is always
                                         * ADMIN-only.
                                         *
                                         * This must appear before generic
                                         * /api/v1/** rules.
                                         */
                                        .requestMatchers(
                                                "/api/v1/users/**"
                                        )
                                        .hasRole(
                                                "ADMIN"
                                        )


                                        /*
                                         * Master-data writes are
                                         * ADMIN-only.
                                         */
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/v1/master/**"
                                        )
                                        .hasRole(
                                                "ADMIN"
                                        )

                                        .requestMatchers(
                                                HttpMethod.PUT,
                                                "/api/v1/master/**"
                                        )
                                        .hasRole(
                                                "ADMIN"
                                        )

                                        .requestMatchers(
                                                HttpMethod.PATCH,
                                                "/api/v1/master/**"
                                        )
                                        .hasRole(
                                                "ADMIN"
                                        )

                                        .requestMatchers(
                                                HttpMethod.DELETE,
                                                "/api/v1/master/**"
                                        )
                                        .hasRole(
                                                "ADMIN"
                                        )


                                        /*
                                         * Master data may be read by all
                                         * authenticated roles.
                                         */
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/v1/master/**"
                                        )
                                        .hasAnyRole(
                                                "ADMIN",
                                                "EDITOR",
                                                "VIEWER"
                                        )


                                        /*
                                         * Normal application writes:
                                         *
                                         * ADMIN + EDITOR.
                                         */
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                "/api/v1/**"
                                        )
                                        .hasAnyRole(
                                                "ADMIN",
                                                "EDITOR"
                                        )

                                        .requestMatchers(
                                                HttpMethod.PUT,
                                                "/api/v1/**"
                                        )
                                        .hasAnyRole(
                                                "ADMIN",
                                                "EDITOR"
                                        )

                                        .requestMatchers(
                                                HttpMethod.PATCH,
                                                "/api/v1/**"
                                        )
                                        .hasAnyRole(
                                                "ADMIN",
                                                "EDITOR"
                                        )

                                        .requestMatchers(
                                                HttpMethod.DELETE,
                                                "/api/v1/**"
                                        )
                                        .hasAnyRole(
                                                "ADMIN",
                                                "EDITOR"
                                        )


                                        /*
                                         * Normal reads:
                                         *
                                         * ADMIN + EDITOR + VIEWER.
                                         */
                                        .requestMatchers(
                                                HttpMethod.GET,
                                                "/api/v1/**"
                                        )
                                        .hasAnyRole(
                                                "ADMIN",
                                                "EDITOR",
                                                "VIEWER"
                                        )


                                        /*
                                         * Everything else requires
                                         * authentication.
                                         */
                                        .anyRequest()
                                        .authenticated()
                )

                .formLogin(
                        form ->
                                form.disable()
                )

                .httpBasic(
                        basic ->
                                basic.disable()
                )

                .logout(
                        logout ->
                                logout.disable()
                )

                .exceptionHandling(
                        exception ->
                                exception

                                        /*
                                         * User is not logged in.
                                         */
                                        .authenticationEntryPoint(
                                                (
                                                        request,
                                                        response,
                                                        authenticationException
                                                ) -> {

                                                    response.setStatus(
                                                            401
                                                    );

                                                    response.setContentType(
                                                            "application/json"
                                                    );

                                                    response.setCharacterEncoding(
                                                            "UTF-8"
                                                    );

                                                    response.getWriter()
                                                            .write(
                                                                    """
                                                                    {
                                                                      "status": 401,
                                                                      "error": "Unauthorized",
                                                                      "message": "Please sign in to continue."
                                                                    }
                                                                    """
                                                            );
                                                }
                                        )


                                        /*
                                         * User is logged in,
                                         * but does not have permission.
                                         */
                                        .accessDeniedHandler(
                                                (
                                                        request,
                                                        response,
                                                        accessDeniedException
                                                ) -> {

                                                    response.setStatus(
                                                            403
                                                    );

                                                    response.setContentType(
                                                            "application/json"
                                                    );

                                                    response.setCharacterEncoding(
                                                            "UTF-8"
                                                    );

                                                    response.getWriter()
                                                            .write(
                                                                    """
                                                                    {
                                                                      "status": 403,
                                                                      "error": "Forbidden",
                                                                      "message": "You have read-only access. You cannot add, edit, or delete records."
                                                                    }
                                                                    """
                                                            );
                                                }
                                        )
                );


        return http.build();
    }


    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );


        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        configuration.setAllowedHeaders(
                List.of("*")
        );


        configuration.setAllowCredentials(
                true
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}