package com.eventfinance.backend.masterdata.expensecategory;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.masterdata.expensecategory.dto.ExpenseCategoryMasterRequest;
import com.eventfinance.backend.masterdata.expensecategory.dto.ExpenseCategoryMasterResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExpenseCategoryMasterService {

    private final ExpenseCategoryMasterRepository repository;


    public ExpenseCategoryMasterService(
            ExpenseCategoryMasterRepository repository
    ) {
        this.repository = repository;
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


        /*
         * sortOrder is no longer exposed
         * to the UI.
         *
         * Keep a default value only because
         * the existing entity/database still
         * contains this field.
         */
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


    /*
     * Used by the existing controller:
     *
     * GET /master/expense-categories
     */
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


    /*
     * Used by the existing controller when
     * activeOnly=true.
     */
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


    /*
     * Keeping this overload also makes the
     * service convenient if another class
     * already uses getAll(boolean).
     */
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
         * Category code is intentionally
         * immutable after creation.
         *
         * Existing expense records depend
         * on this stable code.
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