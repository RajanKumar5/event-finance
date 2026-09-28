package com.eventfinance.backend.contribution;

import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.contributor.Contributor;
import com.eventfinance.backend.event.Event;
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
        name = "contributions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_receipt",
                        columnNames = {
                                "event_id",
                                "receipt_number"
                        }
                )
        }
)
@EntityListeners(
        AuditingEntityListener.class
)
@Getter
@Setter
@NoArgsConstructor
public class Contribution {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "event_id",
            nullable = false
    )
    private Event event;


    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "contributor_id",
            nullable = false
    )
    private Contributor contributor;


    @Column(
            name = "receipt_number",
            nullable = false,
            length = 50
    )
    private String receiptNumber;


    @Column(
            name = "payment_date",
            nullable = false
    )
    private LocalDate paymentDate;


    @Enumerated(
            EnumType.STRING
    )
    @Column(
            name = "payment_mode",
            nullable = false,
            length = 20
    )
    private PaymentMode paymentMode;


    @Column(
            name = "amount_paid",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amountPaid;


    @Column(
            name = "upi_paid_to",
            length = 150
    )
    private String upiPaidTo;


    @Column(
            name = "payment_reference",
            length = 100
    )
    private String paymentReference;


    @Column(
            length = 500
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
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();


        createdAt =
                now;

        updatedAt =
                now;
    }


    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
    }
}