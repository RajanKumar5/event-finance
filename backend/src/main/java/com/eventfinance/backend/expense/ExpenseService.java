package com.eventfinance.backend.expense;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.expense.dto.ExpenseRequest;
import com.eventfinance.backend.expense.dto.ExpenseResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final EventRepository eventRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            EventRepository eventRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.eventRepository = eventRepository;
    }

    public ExpenseResponse createExpense(ExpenseRequest request) {

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with id: " + request.eventId()
                        )
                );

        Expense expense = new Expense();

        expense.setEvent(event);
        expense.setCategory(request.category());
        expense.setDescription(request.description());
        expense.setVendorName(request.vendorName());
        expense.setAmount(request.amount());
        expense.setExpenseDate(request.expenseDate());
        expense.setPaymentMode(request.paymentMode());
        expense.setPaidBy(request.paidBy());
        expense.setPaymentReference(request.paymentReference());
        expense.setNotes(request.notes());

        return mapToResponse(
                expenseRepository.save(expense)
        );
    }

    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ExpenseResponse> getExpensesByEvent(Long eventId) {

        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException(
                    "Event not found with id: " + eventId
            );
        }

        return expenseRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getEvent().getId(),
                expense.getEvent().getName(),
                expense.getCategory(),
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

    public BigDecimal getTotalExpensesByEvent(Long eventId) {

        return expenseRepository.findByEventId(eventId)
                .stream()
                .map(Expense::getAmount)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    public long getExpenseCountByEvent(Long eventId) {
        return expenseRepository
                .findByEventId(eventId)
                .size();
    }
}