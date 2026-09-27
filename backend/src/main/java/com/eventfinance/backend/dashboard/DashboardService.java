package com.eventfinance.backend.dashboard;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.contribution.ContributionService;
import com.eventfinance.backend.contribution.dto.EventCollectionSummary;
import com.eventfinance.backend.contributor.ContributorRepository;
import com.eventfinance.backend.dashboard.dto.EventDashboardResponse;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.expense.Expense;
import com.eventfinance.backend.expense.ExpenseRepository;
import com.eventfinance.backend.expense.ExpenseService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final EventRepository eventRepository;

    private final ContributionService contributionService;

    private final ExpenseService expenseService;

    private final ExpenseRepository expenseRepository;

    private final ContributorRepository contributorRepository;

    public DashboardService(
            EventRepository eventRepository,
            ContributionService contributionService,
            ExpenseService expenseService,
            ExpenseRepository expenseRepository,
            ContributorRepository contributorRepository
    ) {

        this.eventRepository =
                eventRepository;

        this.contributionService =
                contributionService;

        this.expenseService =
                expenseService;

        this.expenseRepository =
                expenseRepository;

        this.contributorRepository =
                contributorRepository;
    }

    public EventDashboardResponse getEventDashboard(
            Long eventId
    ) {

        Event event =
                eventRepository
                        .findById(eventId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event not found with id: "
                                                + eventId
                                )
                        );

        /*
         * Contribution totals for the selected event.
         *
         * This already contains:
         *
         * totalCollected
         * cashCollected
         * upiCollected
         * bankCollected
         * contributionCount
         * uniqueContributorCount
         */
        EventCollectionSummary collectionSummary =
                contributionService
                        .getEventCollectionSummary(
                                eventId
                        );

        /*
         * Overall expenses.
         */
        BigDecimal totalExpenses =
                expenseService
                        .getTotalExpensesByEvent(
                                eventId
                        );

        long expenseCount =
                expenseService
                        .getExpenseCountByEvent(
                                eventId
                        );

        /*
         * Load all expenses once so that we can
         * calculate payment-mode-wise expenses.
         */
        List<Expense> expenses =
                expenseRepository
                        .findByEventId(eventId);

        /*
         * CASH expenses.
         */
        BigDecimal cashExpenses =
                expenses.stream()
                        .filter(expense ->
                                expense.getPaymentMode()
                                        == PaymentMode.CASH
                        )
                        .map(Expense::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        /*
         * UPI expenses.
         */
        BigDecimal upiExpenses =
                expenses.stream()
                        .filter(expense ->
                                expense.getPaymentMode()
                                        == PaymentMode.UPI
                        )
                        .map(Expense::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        /*
         * BANK expenses.
         */
        BigDecimal bankExpenses =
                expenses.stream()
                        .filter(expense ->
                                expense.getPaymentMode()
                                        == PaymentMode.BANK
                        )
                        .map(Expense::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        /*
         * Overall current balance.
         */
        BigDecimal balance =
                collectionSummary
                        .totalCollected()
                        .subtract(
                                totalExpenses
                        );

        /*
         * CASH balance.
         */
        BigDecimal cashBalance =
                collectionSummary
                        .cashCollected()
                        .subtract(
                                cashExpenses
                        );

        /*
         * UPI balance.
         */
        BigDecimal upiBalance =
                collectionSummary
                        .upiCollected()
                        .subtract(
                                upiExpenses
                        );

        /*
         * BANK balance.
         */
        BigDecimal bankBalance =
                collectionSummary
                        .bankCollected()
                        .subtract(
                                bankExpenses
                        );

        /*
         * Remaining event budget.
         */
        BigDecimal budgetRemaining =
                event.getBudget() == null
                        ? null
                        : event.getBudget()
                        .subtract(
                                totalExpenses
                        );

        /*
         * Total contributors registered in the
         * contributor master list.
         */
        long totalContributorCount =
                contributorRepository.count();

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

                cashExpenses,

                upiExpenses,

                bankExpenses,

                cashBalance,

                upiBalance,

                bankBalance,

                collectionSummary.contributionCount(),

                expenseCount,

                totalContributorCount,

                collectionSummary.uniqueContributorCount()
        );
    }
}