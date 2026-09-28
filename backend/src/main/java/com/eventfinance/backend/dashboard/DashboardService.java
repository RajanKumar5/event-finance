package com.eventfinance.backend.dashboard;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.contribution.Contribution;
import com.eventfinance.backend.contribution.ContributionRepository;
import com.eventfinance.backend.contributor.ContributorRepository;
import com.eventfinance.backend.dashboard.dto.AreaCollectionSummaryResponse;
import com.eventfinance.backend.dashboard.dto.DailyFinanceTrendResponse;
import com.eventfinance.backend.dashboard.dto.EventDashboardResponse;
import com.eventfinance.backend.dashboard.dto.ExpenseCategorySummaryResponse;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.expense.Expense;
import com.eventfinance.backend.expense.ExpenseRepository;
import com.eventfinance.backend.masterdata.expensecategory.ExpenseCategoryMaster;
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

        this.eventRepository =
                eventRepository;

        this.contributionRepository =
                contributionRepository;

        this.expenseRepository =
                expenseRepository;

        this.contributorRepository =
                contributorRepository;
    }


    /*
     * Compatibility method.
     *
     * Existing code that does not provide
     * a date range can continue calling this.
     */
    public EventDashboardResponse getEventDashboard(
            Long eventId
    ) {

        return getEventDashboard(
                eventId,
                null,
                null
        );
    }


    public EventDashboardResponse getEventDashboard(
            Long eventId,
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (
                fromDate != null &&
                        toDate != null &&
                        fromDate.isAfter(
                                toDate
                        )
        ) {

            throw new IllegalArgumentException(
                    "From date cannot be after to date"
            );
        }


        Event event =
                eventRepository
                        .findById(
                                eventId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Event not found with id: "
                                                        + eventId
                                        )
                        );


        /*
         * Load all records first.
         *
         * We keep the full expense list because
         * budgetRemaining should always represent
         * the entire event budget position.
         */
        List<Contribution> allContributions =
                contributionRepository
                        .findByEventId(
                                eventId
                        );


        List<Expense> allExpenses =
                expenseRepository
                        .findByEventId(
                                eventId
                        );


        /*
         * Apply dashboard date-range filtering.
         */
        List<Contribution> contributions =
                allContributions
                        .stream()
                        .filter(
                                contribution ->
                                        isWithinDateRange(
                                                contribution
                                                        .getPaymentDate(),
                                                fromDate,
                                                toDate
                                        )
                        )
                        .toList();


        List<Expense> expenses =
                allExpenses
                        .stream()
                        .filter(
                                expense ->
                                        isWithinDateRange(
                                                expense
                                                        .getExpenseDate(),
                                                fromDate,
                                                toDate
                                        )
                        )
                        .toList();


        BigDecimal totalCollected =
                contributions
                        .stream()
                        .map(
                                Contribution::getAmountPaid
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        BigDecimal totalExpenses =
                expenses
                        .stream()
                        .map(
                                Expense::getAmount
                        )
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


        /*
         * Budget remaining must represent the
         * complete event, regardless of the
         * selected dashboard date range.
         */
        BigDecimal allEventExpenses =
                allExpenses
                        .stream()
                        .map(
                                Expense::getAmount
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        BigDecimal budgetRemaining =
                event.getBudget() != null
                        ? event
                        .getBudget()
                        .subtract(
                                allEventExpenses
                        )
                        : null;


        long contributionCount =
                contributions.size();


        long expenseCount =
                expenses.size();


        long totalContributorCount =
                contributorRepository.count();


        long uniqueContributorCount =
                contributions
                        .stream()
                        .map(
                                contribution ->
                                        contribution
                                                .getContributor()
                                                .getId()
                        )
                        .distinct()
                        .count();


        List<DailyFinanceTrendResponse> dailyTrend =
                buildDailyTrend(
                        contributions,
                        expenses
                );


        List<AreaCollectionSummaryResponse> areaCollections =
                buildAreaCollections(
                        contributions
                );


        List<ExpenseCategorySummaryResponse> expenseCategories =
                buildExpenseCategorySummary(
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

                dailyTrend,
                areaCollections,
                expenseCategories
        );
    }


    private boolean isWithinDateRange(
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (
                date == null
        ) {
            return false;
        }


        if (
                fromDate != null &&
                        date.isBefore(
                                fromDate
                        )
        ) {
            return false;
        }


        if (
                toDate != null &&
                        date.isAfter(
                                toDate
                        )
        ) {
            return false;
        }


        return true;
    }


    private BigDecimal getContributionTotalByMode(
            List<Contribution> contributions,
            PaymentMode paymentMode
    ) {

        return contributions
                .stream()
                .filter(
                        contribution ->
                                contribution
                                        .getPaymentMode()
                                        == paymentMode
                )
                .map(
                        Contribution::getAmountPaid
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }


    private BigDecimal getExpenseTotalByMode(
            List<Expense> expenses,
            PaymentMode paymentMode
    ) {

        return expenses
                .stream()
                .filter(
                        expense ->
                                expense
                                        .getPaymentMode()
                                        == paymentMode
                )
                .map(
                        Expense::getAmount
                )
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
                    contribution
                            .getPaymentDate();


            if (
                    date == null
            ) {
                continue;
            }


            collectionsByDate.merge(
                    date,
                    contribution.getAmountPaid(),
                    BigDecimal::add
            );
        }


        for (
                Expense expense :
                expenses
        ) {

            LocalDate date =
                    expense
                            .getExpenseDate();


            if (
                    date == null
            ) {
                continue;
            }


            expensesByDate.merge(
                    date,
                    expense.getAmount(),
                    BigDecimal::add
            );
        }


        TreeSet<LocalDate> activityDates =
                new TreeSet<>();


        activityDates.addAll(
                collectionsByDate
                        .keySet()
        );


        activityDates.addAll(
                expensesByDate
                        .keySet()
        );


        if (
                activityDates.isEmpty()
        ) {
            return List.of();
        }


        LocalDate firstDate =
                activityDates.first();


        LocalDate lastDate =
                activityDates.last();


        List<DailyFinanceTrendResponse> trend =
                new ArrayList<>();


        LocalDate currentDate =
                firstDate;


        while (
                !currentDate.isAfter(
                        lastDate
                )
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
                    currentDate.plusDays(
                            1
                    );
        }


        return trend;
    }


    private List<AreaCollectionSummaryResponse>
    buildAreaCollections(
            List<Contribution> contributions
    ) {

        Map<String, List<Contribution>>
                contributionsByArea =
                new TreeMap<>(
                        String.CASE_INSENSITIVE_ORDER
                );


        for (
                Contribution contribution :
                contributions
        ) {

            String area =
                    contribution
                            .getContributor()
                            .getArea();


            if (
                    area == null ||
                            area.isBlank()
            ) {

                area =
                        "UNKNOWN";
            }


            contributionsByArea
                    .computeIfAbsent(
                            area,
                            key ->
                                    new ArrayList<>()
                    )
                    .add(
                            contribution
                    );
        }


        List<AreaCollectionSummaryResponse> result =
                new ArrayList<>();


        for (
                Map.Entry<
                        String,
                        List<Contribution>
                        > entry :
                contributionsByArea
                        .entrySet()
        ) {

            List<Contribution> areaContributions =
                    entry.getValue();


            BigDecimal totalCollected =
                    areaContributions
                            .stream()
                            .map(
                                    Contribution::getAmountPaid
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );


            long contributorCount =
                    areaContributions
                            .stream()
                            .map(
                                    contribution ->
                                            contribution
                                                    .getContributor()
                                                    .getId()
                            )
                            .distinct()
                            .count();


            result.add(
                    new AreaCollectionSummaryResponse(
                            entry.getKey(),
                            totalCollected,
                            areaContributions.size(),
                            contributorCount
                    )
            );
        }


        /*
         * Keep highest collection areas first.
         */
        result.sort(
                (
                        first,
                        second
                ) ->
                        second
                                .totalCollected()
                                .compareTo(
                                        first
                                                .totalCollected()
                                )
        );


        return result;
    }


    private List<ExpenseCategorySummaryResponse>
    buildExpenseCategorySummary(
            List<Expense> expenses
    ) {

        Map<String, List<Expense>>
                expensesByCategory =
                new TreeMap<>(
                        String.CASE_INSENSITIVE_ORDER
                );


        for (
                Expense expense :
                expenses
        ) {

            String category =
                    getExpenseCategoryCode(
                            expense
                    );


            expensesByCategory
                    .computeIfAbsent(
                            category,
                            key ->
                                    new ArrayList<>()
                    )
                    .add(
                            expense
                    );
        }


        List<ExpenseCategorySummaryResponse> result =
                new ArrayList<>();


        for (
                Map.Entry<
                        String,
                        List<Expense>
                        > entry :
                expensesByCategory
                        .entrySet()
        ) {

            List<Expense> categoryExpenses =
                    entry.getValue();


            BigDecimal totalExpense =
                    categoryExpenses
                            .stream()
                            .map(
                                    Expense::getAmount
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );


            result.add(
                    new ExpenseCategorySummaryResponse(
                            entry.getKey(),
                            totalExpense,
                            categoryExpenses.size()
                    )
            );
        }


        /*
         * Dashboard expense analysis remains
         * sorted by amount spent rather than
         * alphabetically.
         */
        result.sort(
                (
                        first,
                        second
                ) ->
                        second
                                .totalExpense()
                                .compareTo(
                                        first
                                                .totalExpense()
                                )
        );


        return result;
    }


    /*
     * ExpenseCategoryMaster is now the only
     * source of truth for expense categories.
     *
     * The old legacy VARCHAR category column
     * has been completely removed.
     */
    private String getExpenseCategoryCode(
            Expense expense
    ) {

        ExpenseCategoryMaster categoryMaster =
                expense.getCategoryMaster();


        if (
                categoryMaster == null ||
                        categoryMaster.getCode() == null ||
                        categoryMaster
                                .getCode()
                                .isBlank()
        ) {

            return "UNKNOWN";
        }


        return categoryMaster
                .getCode();
    }
}