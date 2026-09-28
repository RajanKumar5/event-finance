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


    /*
     * Used before deleting an expense category.
     *
     * If at least one Expense references the
     * category, the master record must not
     * be deleted.
     */
    boolean existsByCategoryMasterId(
            Long categoryId
    );
}