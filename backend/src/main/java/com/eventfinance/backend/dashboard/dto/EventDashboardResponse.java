package com.eventfinance.backend.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public record EventDashboardResponse(
        Long eventId,
        String eventName,

        BigDecimal budget,
        BigDecimal budgetRemaining,

        BigDecimal totalCollected,
        BigDecimal totalExpenses,
        BigDecimal balance,

        BigDecimal cashCollected,
        BigDecimal upiCollected,
        BigDecimal bankCollected,

        BigDecimal cashExpenses,
        BigDecimal upiExpenses,
        BigDecimal bankExpenses,

        BigDecimal cashBalance,
        BigDecimal upiBalance,
        BigDecimal bankBalance,

        long contributionCount,
        long expenseCount,

        long totalContributorCount,
        long uniqueContributorCount,

        List<DailyFinanceTrendResponse> dailyTrend
) {
}