package com.eventfinance.backend.dashboard.dto;

import java.math.BigDecimal;

public record ExpenseCategorySummaryResponse(
        String category,
        BigDecimal totalExpense,
        long expenseCount
) {
}