package com.eventfinance.backend.dashboard;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.contribution.ContributionService;
import com.eventfinance.backend.contribution.dto.EventCollectionSummary;
import com.eventfinance.backend.dashboard.dto.EventDashboardResponse;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.expense.ExpenseService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DashboardService {

    private final EventRepository eventRepository;
    private final ContributionService contributionService;
    private final ExpenseService expenseService;

    public DashboardService(
            EventRepository eventRepository,
            ContributionService contributionService,
            ExpenseService expenseService
    ) {
        this.eventRepository = eventRepository;
        this.contributionService = contributionService;
        this.expenseService = expenseService;
    }

    public EventDashboardResponse getEventDashboard(Long eventId) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with id: " + eventId
                        )
                );

        EventCollectionSummary collectionSummary =
                contributionService.getEventCollectionSummary(eventId);

        BigDecimal totalExpenses =
                expenseService.getTotalExpensesByEvent(eventId);

        long expenseCount =
                expenseService.getExpenseCountByEvent(eventId);

        BigDecimal balance =
                collectionSummary.totalCollected()
                        .subtract(totalExpenses);

        BigDecimal budgetRemaining =
                event.getBudget() == null
                        ? null
                        : event.getBudget()
                        .subtract(totalExpenses);

        return new EventDashboardResponse(
                event.getId(),
                event.getName(),
                event.getBudget(),
                budgetRemaining,
                collectionSummary.totalCollected(),
                totalExpenses,
                balance,
                collectionSummary.cashCollected(),
                collectionSummary.upiCollected(),
                collectionSummary.bankCollected(),
                collectionSummary.contributionCount(),
                expenseCount,
                collectionSummary.uniqueContributorCount()
        );
    }
}