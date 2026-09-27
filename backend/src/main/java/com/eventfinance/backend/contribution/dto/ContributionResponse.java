package com.eventfinance.backend.contribution.dto;

import com.eventfinance.backend.contribution.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContributionResponse(

        Long id,

        Long eventId,

        String eventName,

        Long contributorId,

        String contributorName,

        String contributorAddress,

        String receiptNumber,

        LocalDate paymentDate,

        PaymentMode paymentMode,

        BigDecimal amountPaid,

        String upiPaidTo,

        String paymentReference,

        String notes,

        LocalDateTime createdAt,

        LocalDateTime updatedAt
) {
}