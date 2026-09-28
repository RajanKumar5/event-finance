package com.eventfinance.backend.expense;

import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.masterdata.expensecategory.ExpenseCategoryMaster;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(
        name = "expense"
)
public class Expense {

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
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_expense_event"
            )
    )
    private Event event;


    /*
     * Dynamic Expense Category relationship.
     *
     * category_id is now the single source
     * of truth for the expense category.
     */
    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "category_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_expense_category"
            )
    )
    private ExpenseCategoryMaster categoryMaster;


    @Column(
            nullable = false,
            length = 255
    )
    private String description;


    @Column(
            name = "vendor_name",
            length = 150
    )
    private String vendorName;


    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal amount;


    @Column(
            name = "expense_date",
            nullable = false
    )
    private LocalDate expenseDate;


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
            name = "paid_by",
            length = 150
    )
    private String paidBy;


    @Column(
            name = "payment_reference",
            length = 150
    )
    private String paymentReference;


    @Column(
            columnDefinition = "TEXT"
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
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
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


    public Event getEvent() {
        return event;
    }


    public void setEvent(
            Event event
    ) {
        this.event = event;
    }


    public ExpenseCategoryMaster getCategoryMaster() {
        return categoryMaster;
    }


    public void setCategoryMaster(
            ExpenseCategoryMaster categoryMaster
    ) {
        this.categoryMaster =
                categoryMaster;
    }


    /*
     * Convenience getter used by services
     * and reporting code.
     */
    public String getCategory() {

        if (
                categoryMaster == null
        ) {
            return null;
        }

        return categoryMaster.getCode();
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(
            String description
    ) {
        this.description =
                description;
    }


    public String getVendorName() {
        return vendorName;
    }


    public void setVendorName(
            String vendorName
    ) {
        this.vendorName =
                vendorName;
    }


    public BigDecimal getAmount() {
        return amount;
    }


    public void setAmount(
            BigDecimal amount
    ) {
        this.amount =
                amount;
    }


    public LocalDate getExpenseDate() {
        return expenseDate;
    }


    public void setExpenseDate(
            LocalDate expenseDate
    ) {
        this.expenseDate =
                expenseDate;
    }


    public PaymentMode getPaymentMode() {
        return paymentMode;
    }


    public void setPaymentMode(
            PaymentMode paymentMode
    ) {
        this.paymentMode =
                paymentMode;
    }


    public String getPaidBy() {
        return paidBy;
    }


    public void setPaidBy(
            String paidBy
    ) {
        this.paidBy =
                paidBy;
    }


    public String getPaymentReference() {
        return paymentReference;
    }


    public void setPaymentReference(
            String paymentReference
    ) {
        this.paymentReference =
                paymentReference;
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
}