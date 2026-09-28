package com.eventfinance.backend.expense;

import com.eventfinance.backend.audit.AuditLogService;
import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.expense.dto.ExpenseCategorySummary;
import com.eventfinance.backend.expense.dto.ExpenseRequest;
import com.eventfinance.backend.expense.dto.ExpenseResponse;
import com.eventfinance.backend.masterdata.expensecategory.ExpenseCategoryMaster;
import com.eventfinance.backend.masterdata.expensecategory.ExpenseCategoryMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;


@Service
public class ExpenseService {

    private static final String AUDIT_ENTITY_TYPE =
            "EXPENSE";


    private final ExpenseRepository
            expenseRepository;

    private final EventRepository
            eventRepository;

    private final ExpenseCategoryMasterRepository
            expenseCategoryRepository;

    private final AuditLogService
            auditLogService;


    public ExpenseService(
            ExpenseRepository expenseRepository,
            EventRepository eventRepository,
            ExpenseCategoryMasterRepository expenseCategoryRepository,
            AuditLogService auditLogService
    ) {

        this.expenseRepository =
                expenseRepository;

        this.eventRepository =
                eventRepository;

        this.expenseCategoryRepository =
                expenseCategoryRepository;

        this.auditLogService =
                auditLogService;
    }


    /*
     * =========================
     * Create
     * =========================
     */

    @Transactional
    public ExpenseResponse createExpense(
            ExpenseRequest request
    ) {

        Event event =
                getEvent(
                        request.eventId()
                );


        validateEventWritable(
                event
        );


        ExpenseCategoryMaster category =
                resolveActiveExpenseCategory(
                        request.category()
                );


        Expense expense =
                new Expense();


        expense.setEvent(
                event
        );


        expense.setCategoryMaster(
                category
        );


        applyRequest(
                expense,
                request
        );


        Expense savedExpense =
                expenseRepository.save(
                        expense
                );


        auditLogService.logCreate(
                AUDIT_ENTITY_TYPE,
                savedExpense.getId(),
                snapshot(
                        savedExpense
                )
        );


        return mapToResponse(
                savedExpense
        );
    }


    /*
     * =========================
     * Read
     * =========================
     */

    @Transactional(readOnly = true)
    public List<ExpenseResponse>
    getAllExpenses() {

        return expenseRepository
                .findAll()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public ExpenseResponse
    getExpenseById(
            Long id
    ) {

        Expense expense =
                getExpenseEntity(
                        id
                );


        return mapToResponse(
                expense
        );
    }


    @Transactional(readOnly = true)
    public List<ExpenseResponse>
    getExpensesByEvent(
            Long eventId
    ) {

        validateEventExists(
                eventId
        );


        return expenseRepository
                .findByEventId(
                        eventId
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    /*
     * =========================
     * Summary By Category
     * =========================
     */

    @Transactional(readOnly = true)
    public List<ExpenseCategorySummary>
    getExpenseSummaryByCategory(
            Long eventId
    ) {

        validateEventExists(
                eventId
        );


        List<Expense> expenses =
                expenseRepository
                        .findByEventId(
                                eventId
                        );


        Map<String, List<Expense>>
                expensesByCategory =
                new TreeMap<>();


        for (
                Expense expense :
                expenses
        ) {

            String categoryCode =
                    expense
                            .getCategoryMaster()
                            .getCode();


            expensesByCategory
                    .computeIfAbsent(
                            categoryCode,
                            key ->
                                    new ArrayList<>()
                    )
                    .add(
                            expense
                    );
        }


        List<ExpenseCategorySummary>
                summaries =
                new ArrayList<>();


        for (
                Map.Entry<
                        String,
                        List<Expense>
                        > entry :
                expensesByCategory
                        .entrySet()
        ) {

            String category =
                    entry.getKey();


            List<Expense>
                    categoryExpenses =
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


            summaries.add(
                    new ExpenseCategorySummary(
                            category,
                            totalExpense,
                            categoryExpenses.size()
                    )
            );
        }


        summaries.sort(
                (
                        first,
                        second
                ) ->
                        second
                                .totalExpense()
                                .compareTo(
                                        first.totalExpense()
                                )
        );


        return summaries;
    }


    /*
     * =========================
     * Update
     * =========================
     */

    @Transactional
    public ExpenseResponse updateExpense(
            Long id,
            ExpenseRequest request
    ) {

        Expense expense =
                getExpenseEntity(
                        id
                );


        Map<String, Object> oldValues =
                snapshot(
                        expense
                );


        Event newEvent =
                getEvent(
                        request.eventId()
                );


        validateEventWritable(
                expense.getEvent()
        );


        validateEventWritable(
                newEvent
        );


        String requestedCategory =
                normalizeCategoryCode(
                        request.category()
                );


        ExpenseCategoryMaster currentCategory =
                expense.getCategoryMaster();


        boolean keepingCurrentCategory =
                currentCategory != null &&
                        currentCategory.getCode() != null &&
                        currentCategory
                                .getCode()
                                .equalsIgnoreCase(
                                        requestedCategory
                                );


        if (
                !keepingCurrentCategory
        ) {

            ExpenseCategoryMaster newCategory =
                    resolveActiveExpenseCategory(
                            requestedCategory
                    );


            expense.setCategoryMaster(
                    newCategory
            );
        }


        expense.setEvent(
                newEvent
        );


        applyRequest(
                expense,
                request
        );


        Expense updatedExpense =
                expenseRepository.save(
                        expense
                );


        auditLogService.logUpdate(
                AUDIT_ENTITY_TYPE,
                updatedExpense.getId(),
                oldValues,
                snapshot(
                        updatedExpense
                )
        );


        return mapToResponse(
                updatedExpense
        );
    }


    /*
     * =========================
     * Delete
     * =========================
     */

    @Transactional
    public void deleteExpense(
            Long id
    ) {

        Expense expense =
                getExpenseEntity(
                        id
                );


        validateEventWritable(
                expense.getEvent()
        );


        Map<String, Object> oldValues =
                snapshot(
                        expense
                );


        auditLogService.logDelete(
                AUDIT_ENTITY_TYPE,
                expense.getId(),
                oldValues
        );


        expenseRepository.delete(
                expense
        );
    }


    /*
     * =========================
     * Apply Request
     * =========================
     */

    private void applyRequest(
            Expense expense,
            ExpenseRequest request
    ) {

        expense.setDescription(
                request.description()
                        .trim()
        );


        expense.setVendorName(
                normalizeNullable(
                        request.vendorName()
                )
        );


        expense.setAmount(
                request.amount()
        );


        expense.setExpenseDate(
                request.expenseDate()
        );


        expense.setPaymentMode(
                request.paymentMode()
        );


        expense.setPaidBy(
                normalizeNullable(
                        request.paidBy()
                )
        );


        expense.setPaymentReference(
                normalizeNullable(
                        request.paymentReference()
                )
        );


        expense.setNotes(
                normalizeNullable(
                        request.notes()
                )
        );
    }


    /*
     * =========================
     * Event Lookup
     * =========================
     */

    private Event getEvent(
            Long eventId
    ) {

        return eventRepository
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
    }


    private void validateEventExists(
            Long eventId
    ) {

        if (
                !eventRepository
                        .existsById(
                                eventId
                        )
        ) {

            throw new ResourceNotFoundException(
                    "Event not found with id: "
                            + eventId
            );
        }
    }


    /*
     * =========================
     * Expense Lookup
     * =========================
     */

    private Expense getExpenseEntity(
            Long id
    ) {

        return expenseRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Expense not found with id: "
                                                + id
                                )
                );
    }


    /*
     * =========================
     * Category Resolution
     * =========================
     */

    private ExpenseCategoryMaster
    resolveActiveExpenseCategory(
            String categoryCode
    ) {

        String normalizedCode =
                normalizeCategoryCode(
                        categoryCode
                );


        if (
                normalizedCode == null ||
                        normalizedCode.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Expense category is required"
            );
        }


        ExpenseCategoryMaster category =
                expenseCategoryRepository
                        .findByCodeIgnoreCase(
                                normalizedCode
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Expense category not found: "
                                                        + normalizedCode
                                        )
                        );


        if (
                !Boolean.TRUE.equals(
                        category.getActive()
                )
        ) {

            throw new IllegalArgumentException(
                    "Expense category is inactive: "
                            + category.getName()
            );
        }


        return category;
    }


    private String normalizeCategoryCode(
            String value
    ) {

        if (
                value == null
        ) {

            return null;
        }


        return value
                .trim()
                .toUpperCase();
    }


    /*
     * =========================
     * Event Write Protection
     * =========================
     */

    private void validateEventWritable(
            Event event
    ) {

        if (
                event == null ||
                        event.getStatus() == null
        ) {

            return;
        }


        String status =
                event
                        .getStatus()
                        .name();


        if (
                "COMPLETED".equals(
                        status
                ) ||
                        "ARCHIVED".equals(
                                status
                        )
        ) {

            throw new IllegalArgumentException(
                    "Financial records cannot be modified for a completed or archived event"
            );
        }
    }


    /*
     * =========================
     * Normalization
     * =========================
     */

    private String normalizeNullable(
            String value
    ) {

        if (
                value == null
        ) {

            return null;
        }


        String normalized =
                value.trim();


        if (
                normalized.isEmpty()
        ) {

            return null;
        }


        return normalized;
    }


    /*
     * =========================
     * Audit Snapshot
     * =========================
     */

    private Map<String, Object> snapshot(
            Expense expense
    ) {

        Map<String, Object> values =
                new LinkedHashMap<>();


        Event event =
                expense.getEvent();


        ExpenseCategoryMaster category =
                expense.getCategoryMaster();


        values.put(
                "id",
                expense.getId()
        );

        values.put(
                "eventId",
                event != null
                        ? event.getId()
                        : null
        );

        values.put(
                "eventName",
                event != null
                        ? event.getName()
                        : null
        );

        values.put(
                "categoryId",
                category != null
                        ? category.getId()
                        : null
        );

        values.put(
                "categoryCode",
                category != null
                        ? category.getCode()
                        : null
        );

        values.put(
                "categoryName",
                category != null
                        ? category.getName()
                        : null
        );

        values.put(
                "description",
                expense.getDescription()
        );

        values.put(
                "vendorName",
                expense.getVendorName()
        );

        values.put(
                "amount",
                expense.getAmount()
        );

        values.put(
                "expenseDate",
                expense.getExpenseDate()
        );

        values.put(
                "paymentMode",
                expense.getPaymentMode()
        );

        values.put(
                "paidBy",
                expense.getPaidBy()
        );

        values.put(
                "paymentReference",
                expense.getPaymentReference()
        );

        values.put(
                "notes",
                expense.getNotes()
        );


        return values;
    }


    /*
     * =========================
     * Response Mapping
     * =========================
     */

    private ExpenseResponse mapToResponse(
            Expense expense
    ) {

        ExpenseCategoryMaster category =
                expense.getCategoryMaster();


        return new ExpenseResponse(

                expense.getId(),

                expense
                        .getEvent()
                        .getId(),

                expense
                        .getEvent()
                        .getName(),

                category.getId(),

                category.getCode(),

                category.getName(),

                expense.getDescription(),

                expense.getVendorName(),

                expense.getAmount(),

                expense.getExpenseDate(),

                expense.getPaymentMode(),

                expense.getPaidBy(),

                expense.getPaymentReference(),

                expense.getNotes(),

                expense.getCreatedAt(),

                expense.getUpdatedAt()
        );
    }
}