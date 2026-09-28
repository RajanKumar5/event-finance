package com.eventfinance.backend.event;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(
        name = "events"
)
@EntityListeners(
        AuditingEntityListener.class
)
@Getter
@Setter
@NoArgsConstructor
public class Event {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @Column(
            nullable = false,
            length = 150
    )
    private String name;


    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 50
    )
    private EventType eventType;


    @Column(
            nullable = false
    )
    private LocalDate startDate;


    @Column(
            nullable = false
    )
    private LocalDate endDate;


    @Column(
            precision = 12,
            scale = 2
    )
    private BigDecimal budget;


    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private EventStatus status;


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


    /*
     * Username of the user who originally
     * created this event.
     *
     * Nullable for now because existing
     * database rows may not have audit data.
     */
    @CreatedBy
    @Column(
            name = "created_by",
            length = 100,
            updatable = false
    )
    private String createdBy;


    /*
     * Username of the user who most recently
     * modified this event.
     */
    @LastModifiedBy
    @Column(
            name = "updated_by",
            length = 100
    )
    private String updatedBy;


    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        this.createdAt =
                now;

        this.updatedAt =
                now;
    }


    @PreUpdate
    public void preUpdate() {

        this.updatedAt =
                LocalDateTime.now();
    }
}