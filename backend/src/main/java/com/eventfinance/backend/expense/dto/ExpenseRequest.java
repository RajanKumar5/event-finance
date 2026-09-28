package com.eventfinance.backend.expense.dto;

import com.eventfinance.backend.common.payment.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;


public record ExpenseRequest(

        @NotNull(
                message = "Event is required"
        )
        Long eventId,


        @NotBlank(
                message = "Expense category is required"
        )
        String category,


        @NotBlank(
                message = "Description is required"
        )
        @Size(
                max = 255,
                message = "Description must not exceed 255 characters"
        )
        String description,


        @Size(
                max = 150,
                message = "Vendor name must not exceed 150 characters"
        )
        String vendorName,


        @NotNull(
                message = "Amount is required"
        )
        @DecimalMin(
                value = "0.01",
                message = "Amount must be greater than zero"
        )
        BigDecimal amount,


        @NotNull(
                message = "Expense date is required"
        )
        LocalDate expenseDate,


        @NotNull(
                message = "Payment mode is required"
        )
        PaymentMode paymentMode,


        @Size(
                max = 150,
                message = "Paid by must not exceed 150 characters"
        )
        String paidBy,


        @Size(
                max = 150,
                message = "Payment reference must not exceed 150 characters"
        )
        String paymentReference,


        String notes

) {
}