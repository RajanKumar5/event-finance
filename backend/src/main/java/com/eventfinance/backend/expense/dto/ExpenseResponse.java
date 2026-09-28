package com.eventfinance.backend.expense.dto;

import com.eventfinance.backend.common.payment.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


public record ExpenseResponse(

        Long id,

        Long eventId,

        String eventName,

        Long categoryId,

        String category,

        String categoryName,

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