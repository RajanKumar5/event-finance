package com.eventfinance.backend.expense.dto;

import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.expense.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(

        @NotNull(message = "Event ID is required")
        Long eventId,

        @NotNull(message = "Expense category is required")
        ExpenseCategory category,

        @NotBlank(message = "Description is required")
        @Size(max = 200)
        String description,

        @Size(max = 150)
        String vendorName,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
        BigDecimal amount,

        @NotNull(message = "Expense date is required")
        LocalDate expenseDate,

        @NotNull(message = "Payment mode is required")
        PaymentMode paymentMode,

        @Size(max = 150)
        String paidBy,

        @Size(max = 100)
        String paymentReference,

        @Size(max = 500)
        String notes
) {
}