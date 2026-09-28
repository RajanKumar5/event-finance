package com.eventfinance.backend.auth;

import com.eventfinance.backend.auth.dto.AuthUserResponse;
import com.eventfinance.backend.auth.dto.LoginRequest;
import com.eventfinance.backend.user.AppUser;
import com.eventfinance.backend.user.AppUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager
            authenticationManager;

    private final SecurityContextRepository
            securityContextRepository;

    private final AppUserRepository
            appUserRepository;


    public AuthController(
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository,
            AppUserRepository appUserRepository
    ) {

        this.authenticationManager =
                authenticationManager;

        this.securityContextRepository =
                securityContextRepository;

        this.appUserRepository =
                appUserRepository;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthUserResponse>
    login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {

        Authentication authentication =
                authenticationManager
                        .authenticate(
                                new UsernamePasswordAuthenticationToken(
                                        request.username(),
                                        request.password()
                                )
                        );


        SecurityContext context =
                SecurityContextHolder
                        .createEmptyContext();


        context.setAuthentication(
                authentication
        );


        SecurityContextHolder
                .setContext(
                        context
                );


        securityContextRepository
                .saveContext(
                        context,
                        httpRequest,
                        httpResponse
                );


        return ResponseEntity.ok(
                getCurrentUserResponse(
                        authentication
                                .getName()
                )
        );
    }


    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse>
    me(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                getCurrentUserResponse(
                        authentication
                                .getName()
                )
        );
    }


    @PostMapping("/logout")
    public ResponseEntity<Void>
    logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {

        SecurityContextLogoutHandler logoutHandler =
                new SecurityContextLogoutHandler();


        logoutHandler.logout(
                request,
                response,
                authentication
        );


        return ResponseEntity
                .noContent()
                .build();
    }


    @GetMapping("/csrf")
    public Map<String, String> csrf(
            CsrfToken token
    ) {

        return Map.of(
                "token",
                token.getToken(),
                "headerName",
                token.getHeaderName(),
                "parameterName",
                token.getParameterName()
        );
    }


    private AuthUserResponse
    getCurrentUserResponse(
            String username
    ) {

        AppUser user =
                appUserRepository
                        .findByUsernameIgnoreCase(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalStateException(
                                                "Authenticated user not found"
                                        )
                        );


        return new AuthUserResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole()
        );
    }
}