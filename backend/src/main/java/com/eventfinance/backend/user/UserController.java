package com.eventfinance.backend.user;

import com.eventfinance.backend.user.dto.CreateUserRequest;
import com.eventfinance.backend.user.dto.ResetPasswordRequest;
import com.eventfinance.backend.user.dto.UpdateUserRequest;
import com.eventfinance.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService
            userService;


    public UserController(
            UserService userService
    ) {

        this.userService =
                userService;
    }


    @GetMapping
    public ResponseEntity<List<UserResponse>>
    getAllUsers() {

        return ResponseEntity.ok(
                userService
                        .getAllUsers()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<UserResponse>
    getUserById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                userService
                        .getUserById(
                                id
                        )
        );
    }


    @PostMapping
    public ResponseEntity<UserResponse>
    createUser(
            @Valid
            @RequestBody
            CreateUserRequest request
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        userService
                                .createUser(
                                        request
                                )
                );
    }


    @PutMapping("/{id}")
    public ResponseEntity<UserResponse>
    updateUser(
            @PathVariable Long id,
            @Valid
            @RequestBody
            UpdateUserRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                userService
                        .updateUser(
                                id,
                                request,
                                authentication
                        )
        );
    }


    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void>
    resetPassword(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ResetPasswordRequest request
    ) {

        userService.resetPassword(
                id,
                request
        );


        return ResponseEntity
                .noContent()
                .build();
    }
}