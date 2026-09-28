package com.eventfinance.backend.expense;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ExpenseRepository
        extends JpaRepository<
        Expense,
        Long
        > {

    List<Expense>
    findByEventId(
            Long eventId
    );


    boolean existsByEventId(
            Long eventId
    );
}