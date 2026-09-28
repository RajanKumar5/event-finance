package com.eventfinance.backend.contributor;

import com.eventfinance.backend.masterdata.area.AreaMaster;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contributor")
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
     * The old "area" String column has been removed.
     * area_id is now the single source of truth.
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


    public String getName() {
        return name;
    }


    public void setName(
            String name
    ) {
        this.name = name;
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


    /*
     * Keep this convenience getter because
     * existing services/dashboard/frontend
     * expect contributor.getArea().
     *
     * It now reads only from AreaMaster.
     */
    public String getArea() {

        if (
                areaMaster == null
        ) {
            return null;
        }

        return areaMaster.getCode();
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
        this.phone = phone;
    }


    public String getNotes() {
        return notes;
    }


    public void setNotes(
            String notes
    ) {
        this.notes = notes;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    /*
     * Convenience address used by existing
     * contribution/contributor responses.
     */
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