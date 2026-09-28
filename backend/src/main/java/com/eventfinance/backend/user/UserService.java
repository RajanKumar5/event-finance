package com.eventfinance.backend.user;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.security.Role;
import com.eventfinance.backend.user.dto.CreateUserRequest;
import com.eventfinance.backend.user.dto.ResetPasswordRequest;
import com.eventfinance.backend.user.dto.UpdateUserRequest;
import com.eventfinance.backend.user.dto.UserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class UserService {

    private final AppUserRepository
            appUserRepository;

    private final PasswordEncoder
            passwordEncoder;


    public UserService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {

        this.appUserRepository =
                appUserRepository;

        this.passwordEncoder =
                passwordEncoder;
    }


    @Transactional(readOnly = true)
    public List<UserResponse>
    getAllUsers() {

        return appUserRepository
                .findAllByOrderByDisplayNameAsc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public UserResponse getUserById(
            Long id
    ) {

        return mapToResponse(
                getUserEntity(
                        id
                )
        );
    }


    @Transactional
    public UserResponse createUser(
            CreateUserRequest request
    ) {

        String username =
                normalizeUsername(
                        request.username()
                );


        if (
                appUserRepository
                        .existsByUsernameIgnoreCase(
                                username
                        )
        ) {

            throw new IllegalArgumentException(
                    "Username already exists: "
                            + username
            );
        }


        AppUser user =
                new AppUser();


        user.setUsername(
                username
        );


        user.setDisplayName(
                request.displayName()
                        .trim()
        );


        user.setPasswordHash(
                passwordEncoder
                        .encode(
                                request.password()
                        )
        );


        user.setRole(
                request.role()
        );


        user.setEnabled(
                true
        );


        AppUser savedUser =
                appUserRepository.save(
                        user
                );


        return mapToResponse(
                savedUser
        );
    }


    @Transactional
    public UserResponse updateUser(
            Long id,
            UpdateUserRequest request,
            Authentication authentication
    ) {

        AppUser user =
                getUserEntity(
                        id
                );


        boolean editingSelf =
                authentication != null &&
                        user.getUsername()
                                .equalsIgnoreCase(
                                        authentication
                                                .getName()
                                );


        if (
                editingSelf &&
                        request.role() !=
                                user.getRole()
        ) {

            throw new IllegalArgumentException(
                    "You cannot change your own role"
            );
        }


        if (
                editingSelf &&
                        !Boolean.TRUE.equals(
                                request.enabled()
                        )
        ) {

            throw new IllegalArgumentException(
                    "You cannot disable your own account"
            );
        }


        user.setDisplayName(
                request.displayName()
                        .trim()
        );


        user.setRole(
                request.role()
        );


        user.setEnabled(
                request.enabled()
        );


        AppUser savedUser =
                appUserRepository.save(
                        user
                );


        return mapToResponse(
                savedUser
        );
    }


    @Transactional
    public void resetPassword(
            Long id,
            ResetPasswordRequest request
    ) {

        AppUser user =
                getUserEntity(
                        id
                );


        user.setPasswordHash(
                passwordEncoder
                        .encode(
                                request.password()
                        )
        );


        appUserRepository.save(
                user
        );
    }


    private AppUser getUserEntity(
            Long id
    ) {

        return appUserRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "User not found with id: "
                                                + id
                                )
                );
    }


    private String normalizeUsername(
            String username
    ) {

        if (
                username == null ||
                        username.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Username is required"
            );
        }


        return username
                .trim()
                .toLowerCase();
    }


    private UserResponse mapToResponse(
            AppUser user
    ) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole(),
                user.getEnabled(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}