package com.eventfinance.backend.contributor.dto;

import com.eventfinance.backend.contributor.Area;
import com.eventfinance.backend.contributor.PaymentMode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContributorResponse(

        Long id,

        String receiptNumber,

        LocalDate date,

        PaymentMode paymentMode,

        String name,

        String houseNumber,

        Area area,

        String address,

        BigDecimal amountPaid,

        String upiPaidTo,

        String paymentReference,

        String phone,

        String notes,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {
}