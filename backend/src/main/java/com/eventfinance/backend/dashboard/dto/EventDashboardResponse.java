package com.eventfinance.backend.dashboard.dto;

import java.math.BigDecimal;

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

        long contributionCount,

        long expenseCount,

        long uniqueContributorCount

) {

}