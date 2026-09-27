package com.eventfinance.backend.contribution;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContributionRepository
        extends JpaRepository<Contribution, Long> {

    boolean existsByEventIdAndReceiptNumber(
            Long eventId,
            String receiptNumber
    );

    List<Contribution> findByEventId(Long eventId);

    List<Contribution> findByContributorId(Long contributorId);
}