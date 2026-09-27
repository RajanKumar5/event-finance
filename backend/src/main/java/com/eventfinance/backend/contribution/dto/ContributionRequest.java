package com.eventfinance.backend.contribution.dto;

import com.eventfinance.backend.contribution.PaymentMode;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContributionRequest(

        @NotNull(message = "Event ID is required")
        Long eventId,

        @NotNull(message = "Contributor ID is required")
        Long contributorId,

        @NotBlank(message = "Receipt number is required")
        @Size(max = 50)
        String receiptNumber,

        @NotNull(message = "Payment date is required")
        LocalDate paymentDate,

        @NotNull(message = "Payment mode is required")
        PaymentMode paymentMode,

        @NotNull(message = "Amount paid is required")
        @DecimalMin(
                value = "0.01",
                message = "Amount paid must be greater than zero"
        )
        BigDecimal amountPaid,

        @Size(max = 150)
        String upiPaidTo,

        @Size(max = 100)
        String paymentReference,

        @Size(max = 500)
        String notes
) {
}