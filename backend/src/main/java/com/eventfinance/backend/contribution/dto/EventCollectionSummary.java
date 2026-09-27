package com.eventfinance.backend.contribution.dto;

import java.math.BigDecimal;

public record EventCollectionSummary(
        Long eventId,
        String eventName,
        BigDecimal totalCollected,
        BigDecimal cashCollected,
        BigDecimal upiCollected,
        BigDecimal bankCollected,
        long contributionCount,
        long uniqueContributorCount
) {
}