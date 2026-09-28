package com.eventfinance.backend.masterdata.expensecategory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseCategoryMasterRepository
        extends JpaRepository<ExpenseCategoryMaster, Long> {

    boolean existsByCodeIgnoreCase(
            String code
    );

    Optional<ExpenseCategoryMaster>
    findByCodeIgnoreCase(
            String code
    );

    List<ExpenseCategoryMaster>
    findAllByOrderByNameAsc();

    List<ExpenseCategoryMaster>
    findByActiveTrueOrderByNameAsc();
}