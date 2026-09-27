package com.eventfinance.backend.contributor.dto;

import com.eventfinance.backend.contributor.Area;
import com.eventfinance.backend.contributor.PaymentMode;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContributorRequest(

        @NotBlank(message = "Receipt number is required")
        @Size(max = 50, message = "Receipt number cannot exceed 50 characters")
        String receiptNumber,

        @NotNull(message = "Date is required")
        LocalDate date,

        @NotNull(message = "Payment mode is required")
        PaymentMode paymentMode,

        @NotBlank(message = "Contributor name is required")
        @Size(max = 150, message = "Name cannot exceed 150 characters")
        String name,

        @NotBlank(message = "House number is required")
        @Size(max = 30, message = "House number cannot exceed 30 characters")
        String houseNumber,

        @NotNull(message = "Area is required")
        Area area,

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

        @Size(max = 20)
        String phone,

        @Size(max = 500)
        String notes
) {
}