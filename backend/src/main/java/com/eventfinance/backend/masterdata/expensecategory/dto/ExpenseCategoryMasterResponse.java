package com.eventfinance.backend.masterdata.expensecategory.dto;

public record ExpenseCategoryMasterResponse(

        Long id,

        String code,

        String name,

        Boolean active

) {
}