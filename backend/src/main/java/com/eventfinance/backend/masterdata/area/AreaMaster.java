package com.eventfinance.backend.masterdata.area;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "area_master",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_area_master_code",
                        columnNames = "code"
                )
        }
)
public class AreaMaster {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            nullable = false,
            length = 50
    )
    private String code;

    @Column(
            nullable = false,
            length = 100
    )
    private String name;

    @Column(
            nullable = false
    )
    private Boolean active = true;

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
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }


    @PreUpdate
    protected void onUpdate() {

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


    public String getCode() {
        return code;
    }


    public void setCode(
            String code
    ) {
        this.code = code;
    }


    public String getName() {
        return name;
    }


    public void setName(
            String name
    ) {
        this.name = name;
    }


    public Boolean getActive() {
        return active;
    }


    public void setActive(
            Boolean active
    ) {
        this.active = active;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}