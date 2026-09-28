package com.eventfinance.backend.masterdata.expensecategory;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.expense.ExpenseRepository;
import com.eventfinance.backend.masterdata.expensecategory.dto.ExpenseCategoryMasterRequest;
import com.eventfinance.backend.masterdata.expensecategory.dto.ExpenseCategoryMasterResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;


@Service
public class ExpenseCategoryMasterService {

    private final ExpenseCategoryMasterRepository repository;

    private final ExpenseRepository expenseRepository;


    public ExpenseCategoryMasterService(
            ExpenseCategoryMasterRepository repository,
            ExpenseRepository expenseRepository
    ) {
        this.repository = repository;
        this.expenseRepository = expenseRepository;
    }


    @Transactional
    public ExpenseCategoryMasterResponse create(
            ExpenseCategoryMasterRequest request
    ) {

        String code =
                normalizeCode(
                        request.code()
                );

        String name =
                normalizeName(
                        request.name()
                );


        if (
                repository.existsByCodeIgnoreCase(
                        code
                )
        ) {
            throw new IllegalArgumentException(
                    "Expense category already exists with code: "
                            + code
            );
        }


        ExpenseCategoryMaster category =
                new ExpenseCategoryMaster();


        category.setCode(
                code
        );


        category.setName(
                name
        );


        category.setActive(
                request.active()
        );


        category.setSortOrder(
                0
        );


        ExpenseCategoryMaster saved =
                repository.save(
                        category
                );


        return mapToResponse(
                saved
        );
    }


    @Transactional(readOnly = true)
    public List<ExpenseCategoryMasterResponse> getAll() {

        return repository
                .findAllByOrderByNameAsc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ExpenseCategoryMasterResponse> getActive() {

        return repository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ExpenseCategoryMasterResponse> getAll(
            boolean activeOnly
    ) {

        if (activeOnly) {
            return getActive();
        }

        return getAll();
    }


    @Transactional(readOnly = true)
    public ExpenseCategoryMasterResponse getById(
            Long id
    ) {

        return mapToResponse(
                getEntity(
                        id
                )
        );
    }


    @Transactional
    public ExpenseCategoryMasterResponse update(
            Long id,
            ExpenseCategoryMasterRequest request
    ) {

        ExpenseCategoryMaster category =
                getEntity(
                        id
                );


        /*
         * Category code remains immutable.
         *
         * Existing expenses may depend on this
         * stable master-data record.
         */
        String name =
                normalizeName(
                        request.name()
                );


        category.setName(
                name
        );


        category.setActive(
                request.active()
        );


        ExpenseCategoryMaster saved =
                repository.save(
                        category
                );


        return mapToResponse(
                saved
        );
    }


    @Transactional
    public ExpenseCategoryMasterResponse updateStatus(
            Long id,
            boolean active
    ) {

        ExpenseCategoryMaster category =
                getEntity(
                        id
                );


        category.setActive(
                active
        );


        ExpenseCategoryMaster saved =
                repository.save(
                        category
                );


        return mapToResponse(
                saved
        );
    }


    /*
     * Permanently delete an expense category
     * only when it has never been used by an
     * Expense record.
     */
    @Transactional
    public void delete(
            Long id
    ) {

        ExpenseCategoryMaster category =
                getEntity(
                        id
                );


        boolean used =
                expenseRepository
                        .existsByCategoryMasterId(
                                id
                        );


        if (used) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Expense category \""
                            + category.getName()
                            + "\" cannot be deleted because it is already used by one or more expenses."
            );
        }


        repository.delete(
                category
        );
    }


    private ExpenseCategoryMaster getEntity(
            Long id
    ) {

        return repository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Expense category not found with id: "
                                                + id
                                )
                );
    }


    private String normalizeCode(
            String value
    ) {

        if (
                value == null
        ) {
            return null;
        }


        return value
                .trim()
                .toUpperCase()
                .replaceAll(
                        "\\s+",
                        "_"
                )
                .replaceAll(
                        "[^A-Z0-9_]",
                        ""
                );
    }


    private String normalizeName(
            String value
    ) {

        if (
                value == null
        ) {
            return null;
        }


        return value
                .trim()
                .replaceAll(
                        "\\s+",
                        " "
                );
    }


    private ExpenseCategoryMasterResponse mapToResponse(
            ExpenseCategoryMaster category
    ) {

        return new ExpenseCategoryMasterResponse(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getActive()
        );
    }
}