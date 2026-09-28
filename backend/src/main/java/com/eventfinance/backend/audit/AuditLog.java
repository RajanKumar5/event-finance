package com.eventfinance.backend.audit;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "audit_log",
        indexes = {
                @Index(
                        name = "idx_audit_entity",
                        columnList = "entity_type, entity_id"
                ),

                @Index(
                        name = "idx_audit_changed_at",
                        columnList = "changed_at"
                ),

                @Index(
                        name = "idx_audit_changed_by",
                        columnList = "changed_by"
                )
        }
)
public class AuditLog {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @Column(
            name = "entity_type",
            nullable = false,
            length = 50
    )
    private String entityType;


    @Column(
            name = "entity_id",
            nullable = false
    )
    private Long entityId;


    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 20
    )
    private AuditAction action;


    @Column(
            name = "changed_by",
            nullable = false,
            length = 100
    )
    private String changedBy;


    @Column(
            name = "changed_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime changedAt;


    /*
     * JSON snapshot of the entity before
     * the operation.
     *
     * CREATE -> normally null
     * UPDATE -> previous values
     * DELETE -> values before deletion
     */
    @Column(
            name = "old_values",
            columnDefinition = "LONGTEXT"
    )
    private String oldValues;


    /*
     * JSON snapshot of the entity after
     * the operation.
     *
     * CREATE -> created values
     * UPDATE -> updated values
     * DELETE -> normally null
     */
    @Column(
            name = "new_values",
            columnDefinition = "LONGTEXT"
    )
    private String newValues;


    @PrePersist
    public void prePersist() {

        if (
                changedAt == null
        ) {

            changedAt =
                    LocalDateTime.now();
        }
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


    public String getEntityType() {

        return entityType;
    }


    public void setEntityType(
            String entityType
    ) {

        this.entityType =
                entityType;
    }


    public Long getEntityId() {

        return entityId;
    }


    public void setEntityId(
            Long entityId
    ) {

        this.entityId =
                entityId;
    }


    public AuditAction getAction() {

        return action;
    }


    public void setAction(
            AuditAction action
    ) {

        this.action =
                action;
    }


    public String getChangedBy() {

        return changedBy;
    }


    public void setChangedBy(
            String changedBy
    ) {

        this.changedBy =
                changedBy;
    }


    public LocalDateTime getChangedAt() {

        return changedAt;
    }


    public void setChangedAt(
            LocalDateTime changedAt
    ) {

        this.changedAt =
                changedAt;
    }


    public String getOldValues() {

        return oldValues;
    }


    public void setOldValues(
            String oldValues
    ) {

        this.oldValues =
                oldValues;
    }


    public String getNewValues() {

        return newValues;
    }


    public void setNewValues(
            String newValues
    ) {

        this.newValues =
                newValues;
    }
}