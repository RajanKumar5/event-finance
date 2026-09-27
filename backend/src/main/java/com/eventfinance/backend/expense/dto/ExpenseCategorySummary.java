package com.eventfinance.backend.expense.dto;

import com.eventfinance.backend.expense.ExpenseCategory;

import java.math.BigDecimal;

public record ExpenseCategorySummary(
        ExpenseCategory category,
        BigDecimal totalAmount
) {
}