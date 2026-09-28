package com.eventfinance.backend.contributor;

import com.eventfinance.backend.masterdata.area.AreaMaster;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "contributor"
)
@EntityListeners(
        AuditingEntityListener.class
)
public class Contributor {

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


    @Column(
            name = "house_number",
            nullable = false,
            length = 100
    )
    private String houseNumber;


    /*
     * Dynamic Area relationship.
     *
     * area_id is the single source of truth.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "area_id",
            nullable = false
    )
    private AreaMaster areaMaster;


    @Column(
            length = 30
    )
    private String phone;


    @Column(
            length = 1000
    )
    private String notes;


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


    @CreatedBy
    @Column(
            name = "created_by",
            length = 100,
            updatable = false
    )
    private String createdBy;


    @LastModifiedBy
    @Column(
            name = "updated_by",
            length = 100
    )
    private String updatedBy;


    @PrePersist
    protected void onCreate() {

        LocalDateTime now =
                LocalDateTime.now();


        createdAt =
                now;

        updatedAt =
                now;
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

        this.id =
                id;
    }


    public String getName() {

        return name;
    }


    public void setName(
            String name
    ) {

        this.name =
                name;
    }


    public String getHouseNumber() {

        return houseNumber;
    }


    public void setHouseNumber(
            String houseNumber
    ) {

        this.houseNumber =
                houseNumber;
    }


    public String getArea() {

        if (
                areaMaster == null
        ) {

            return null;
        }


        return areaMaster
                .getCode();
    }


    public AreaMaster getAreaMaster() {

        return areaMaster;
    }


    public void setAreaMaster(
            AreaMaster areaMaster
    ) {

        this.areaMaster =
                areaMaster;
    }


    public String getPhone() {

        return phone;
    }


    public void setPhone(
            String phone
    ) {

        this.phone =
                phone;
    }


    public String getNotes() {

        return notes;
    }


    public void setNotes(
            String notes
    ) {

        this.notes =
                notes;
    }


    public LocalDateTime getCreatedAt() {

        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {

        return updatedAt;
    }


    public String getCreatedBy() {

        return createdBy;
    }


    public String getUpdatedBy() {

        return updatedBy;
    }


    public String getAddress() {

        String area =
                getArea();


        if (
                houseNumber == null ||
                        houseNumber.isBlank()
        ) {

            return area;
        }


        if (
                area == null ||
                        area.isBlank()
        ) {

            return houseNumber;
        }


        return houseNumber
                + ", "
                + area;
    }
}