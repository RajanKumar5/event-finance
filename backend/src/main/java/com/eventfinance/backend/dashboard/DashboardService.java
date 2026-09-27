package com.eventfinance.backend.dashboard;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.contribution.Contribution;
import com.eventfinance.backend.contribution.ContributionRepository;
import com.eventfinance.backend.contributor.ContributorRepository;
import com.eventfinance.backend.dashboard.dto.DailyFinanceTrendResponse;
import com.eventfinance.backend.dashboard.dto.EventDashboardResponse;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.expense.Expense;
import com.eventfinance.backend.expense.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.TreeSet;

@Service
public class DashboardService {

    private final EventRepository eventRepository;
    private final ContributionRepository contributionRepository;
    private final ExpenseRepository expenseRepository;
    private final ContributorRepository contributorRepository;

    public DashboardService(
            EventRepository eventRepository,
            ContributionRepository contributionRepository,
            ExpenseRepository expenseRepository,
            ContributorRepository contributorRepository
    ) {
        this.eventRepository = eventRepository;
        this.contributionRepository = contributionRepository;
        this.expenseRepository = expenseRepository;
        this.contributorRepository = contributorRepository;
    }

    public EventDashboardResponse getEventDashboard(
            Long eventId
    ) {

        Event event = eventRepository
                .findById(eventId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with id: " + eventId
                        )
                );

        List<Contribution> contributions =
                contributionRepository.findByEventId(eventId);

        List<Expense> expenses =
                expenseRepository.findByEventId(eventId);

        BigDecimal totalCollected =
                contributions.stream()
                        .map(Contribution::getAmountPaid)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalExpenses =
                expenses.stream()
                        .map(Expense::getAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal cashCollected =
                getContributionTotalByMode(
                        contributions,
                        PaymentMode.CASH
                );

        BigDecimal upiCollected =
                getContributionTotalByMode(
                        contributions,
                        PaymentMode.UPI
                );

        BigDecimal bankCollected =
                getContributionTotalByMode(
                        contributions,
                        PaymentMode.BANK
                );

        BigDecimal cashExpenses =
                getExpenseTotalByMode(
                        expenses,
                        PaymentMode.CASH
                );

        BigDecimal upiExpenses =
                getExpenseTotalByMode(
                        expenses,
                        PaymentMode.UPI
                );

        BigDecimal bankExpenses =
                getExpenseTotalByMode(
                        expenses,
                        PaymentMode.BANK
                );

        BigDecimal balance =
                totalCollected.subtract(
                        totalExpenses
                );

        BigDecimal cashBalance =
                cashCollected.subtract(
                        cashExpenses
                );

        BigDecimal upiBalance =
                upiCollected.subtract(
                        upiExpenses
                );

        BigDecimal bankBalance =
                bankCollected.subtract(
                        bankExpenses
                );

        BigDecimal budgetRemaining =
                event.getBudget() != null
                        ? event.getBudget()
                        .subtract(totalExpenses)
                        : null;

        long contributionCount =
                contributions.size();

        long expenseCount =
                expenses.size();

        long totalContributorCount =
                contributorRepository.count();

        long uniqueContributorCount =
                contributions.stream()
                        .map(contribution ->
                                contribution
                                        .getContributor()
                                        .getId()
                        )
                        .distinct()
                        .count();

        List<DailyFinanceTrendResponse>
                dailyTrend =
                buildDailyTrend(
                        contributions,
                        expenses
                );

        return new EventDashboardResponse(
                event.getId(),
                event.getName(),

                event.getBudget(),
                budgetRemaining,

                totalCollected,
                totalExpenses,
                balance,

                cashCollected,
                upiCollected,
                bankCollected,

                cashExpenses,
                upiExpenses,
                bankExpenses,

                cashBalance,
                upiBalance,
                bankBalance,

                contributionCount,
                expenseCount,

                totalContributorCount,
                uniqueContributorCount,

                dailyTrend
        );
    }

    private BigDecimal getContributionTotalByMode(
            List<Contribution> contributions,
            PaymentMode paymentMode
    ) {

        return contributions.stream()
                .filter(contribution ->
                        contribution.getPaymentMode()
                                == paymentMode
                )
                .map(Contribution::getAmountPaid)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    private BigDecimal getExpenseTotalByMode(
            List<Expense> expenses,
            PaymentMode paymentMode
    ) {

        return expenses.stream()
                .filter(expense ->
                        expense.getPaymentMode()
                                == paymentMode
                )
                .map(Expense::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    private List<DailyFinanceTrendResponse>
    buildDailyTrend(
            List<Contribution> contributions,
            List<Expense> expenses
    ) {

        Map<LocalDate, BigDecimal>
                collectionsByDate =
                new TreeMap<>();

        Map<LocalDate, BigDecimal>
                expensesByDate =
                new TreeMap<>();

        for (
                Contribution contribution :
                contributions
        ) {

            LocalDate date =
                    contribution.getPaymentDate();

            collectionsByDate.merge(
                    date,
                    contribution.getAmountPaid(),
                    BigDecimal::add
            );
        }

        for (Expense expense : expenses) {

            LocalDate date =
                    expense.getExpenseDate();

            expensesByDate.merge(
                    date,
                    expense.getAmount(),
                    BigDecimal::add
            );
        }

        TreeSet<LocalDate> activityDates =
                new TreeSet<>();

        activityDates.addAll(
                collectionsByDate.keySet()
        );

        activityDates.addAll(
                expensesByDate.keySet()
        );

        if (activityDates.isEmpty()) {
            return List.of();
        }

        LocalDate firstDate =
                activityDates.first();

        LocalDate lastDate =
                activityDates.last();

        List<DailyFinanceTrendResponse>
                trend =
                new ArrayList<>();

        LocalDate currentDate =
                firstDate;

        while (
                !currentDate.isAfter(lastDate)
        ) {

            BigDecimal collected =
                    collectionsByDate
                            .getOrDefault(
                                    currentDate,
                                    BigDecimal.ZERO
                            );

            BigDecimal expense =
                    expensesByDate
                            .getOrDefault(
                                    currentDate,
                                    BigDecimal.ZERO
                            );

            trend.add(
                    new DailyFinanceTrendResponse(
                            currentDate,
                            collected,
                            expense
                    )
            );

            currentDate =
                    currentDate.plusDays(1);
        }

        return trend;
    }
}