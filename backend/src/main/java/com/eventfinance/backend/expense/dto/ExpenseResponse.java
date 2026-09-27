package com.eventfinance.backend.expense.dto;

import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.expense.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseResponse(
        Long id,
        Long eventId,
        String eventName,
        ExpenseCategory category,
        String description,
        String vendorName,
        BigDecimal amount,
        LocalDate expenseDate,
        PaymentMode paymentMode,
        String paidBy,
        String paymentReference,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}