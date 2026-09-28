package com.eventfinance.backend.masterdata.area.dto;

public record AreaMasterResponse(

        Long id,

        String code,

        String name,

        Boolean active

) {
}