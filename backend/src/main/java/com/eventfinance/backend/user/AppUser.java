package com.eventfinance.backend.user;

import com.eventfinance.backend.security.Role;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "app_user",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_app_user_username",
                        columnNames = "username"
                )
        }
)
public class AppUser {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @Column(
            nullable = false,
            length = 100
    )
    private String username;


    @Column(
            name = "password_hash",
            nullable = false,
            length = 255
    )
    private String passwordHash;


    @Column(
            name = "display_name",
            nullable = false,
            length = 150
    )
    private String displayName;


    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private Role role;


    @Column(
            nullable = false
    )
    private Boolean enabled = true;


    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;


    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;


    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;


        if (
                enabled == null
        ) {

            enabled = true;
        }
    }


    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
    }


    public Long getId() {
        return id;
    }


    public void setId(
            Long id
    ) {
        this.id = id;
    }


    public String getUsername() {
        return username;
    }


    public void setUsername(
            String username
    ) {
        this.username = username;
    }


    public String getPasswordHash() {
        return passwordHash;
    }


    public void setPasswordHash(
            String passwordHash
    ) {
        this.passwordHash = passwordHash;
    }


    public String getDisplayName() {
        return displayName;
    }


    public void setDisplayName(
            String displayName
    ) {
        this.displayName = displayName;
    }


    public Role getRole() {
        return role;
    }


    public void setRole(
            Role role
    ) {
        this.role = role;
    }


    public Boolean getEnabled() {
        return enabled;
    }


    public void setEnabled(
            Boolean enabled
    ) {
        this.enabled = enabled;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}