package com.eventfinance.backend.masterdata.expensecategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExpenseCategoryMasterRequest(

        @NotBlank(
                message = "Expense category code is required"
        )
        @Size(
                max = 100,
                message = "Expense category code cannot exceed 100 characters"
        )
        String code,

        @NotBlank(
                message = "Expense category name is required"
        )
        @Size(
                max = 150,
                message = "Expense category name cannot exceed 150 characters"
        )
        String name,

        @NotNull(
                message = "Active status is required"
        )
        Boolean active

) {
}