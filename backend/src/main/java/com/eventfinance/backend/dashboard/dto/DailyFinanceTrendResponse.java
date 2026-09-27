package com.eventfinance.backend.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyFinanceTrendResponse(
        LocalDate date,
        BigDecimal collected,
        BigDecimal expenses
) {
}