package com.eventfinance.backend.dashboard.dto;

import java.math.BigDecimal;

public record AreaCollectionSummaryResponse(
        String area,
        BigDecimal totalCollected,
        long contributionCount,
        long contributorCount
) {
}