package com.eventfinance.backend.contributor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "contributors")
@Getter
@Setter
@NoArgsConstructor
public class Contributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "house_number", nullable = false, length = 30)
    private String houseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Area area;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Transient
    public String getAddress() {
        if (area == null || houseNumber == null) {
            return null;
        }

        return area.name() + "-" + houseNumber;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}