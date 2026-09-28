package com.eventfinance.backend.audit.dto;

import com.eventfinance.backend.audit.AuditAction;

import java.time.LocalDateTime;


public record AuditLogResponse(

        Long id,

        String entityType,

        Long entityId,

        AuditAction action,

        String changedBy,

        LocalDateTime changedAt,

        String oldValues,

        String newValues

) {
}