package com.eventfinance.backend.audit;

import com.eventfinance.backend.audit.dto.AuditLogResponse;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


@Service
public class AuditLogService {

    private final AuditLogRepository
            auditLogRepository;

    private final ObjectMapper
            objectMapper;

    private final AuditorAware<String>
            auditorAware;


    public AuditLogService(
            AuditLogRepository auditLogRepository,
            ObjectMapper objectMapper,
            AuditorAware<String> auditorAware
    ) {

        this.auditLogRepository =
                auditLogRepository;

        this.objectMapper =
                objectMapper;

        this.auditorAware =
                auditorAware;
    }


    /*
     * =========================
     * Write Audit Logs
     * =========================
     */

    public void logCreate(
            String entityType,
            Long entityId,
            Map<String, Object> newValues
    ) {

        saveAuditLog(
                entityType,
                entityId,
                AuditAction.CREATE,
                null,
                newValues
        );
    }


    public void logUpdate(
            String entityType,
            Long entityId,
            Map<String, Object> oldValues,
            Map<String, Object> newValues
    ) {

        saveAuditLog(
                entityType,
                entityId,
                AuditAction.UPDATE,
                oldValues,
                newValues
        );
    }


    public void logDelete(
            String entityType,
            Long entityId,
            Map<String, Object> oldValues
    ) {

        saveAuditLog(
                entityType,
                entityId,
                AuditAction.DELETE,
                oldValues,
                null
        );
    }


    /*
     * =========================
     * Read Audit Logs
     * =========================
     */

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAll() {

        return auditLogRepository
                .findAllByOrderByChangedAtDesc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByEntityType(
            String entityType
    ) {

        String normalized =
                normalizeEntityType(
                        entityType
                );


        return auditLogRepository
                .findByEntityTypeOrderByChangedAtDesc(
                        normalized
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AuditLogResponse> getEntityHistory(
            String entityType,
            Long entityId
    ) {

        String normalized =
                normalizeEntityType(
                        entityType
                );


        return auditLogRepository
                .findByEntityTypeAndEntityIdOrderByChangedAtDesc(
                        normalized,
                        entityId
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AuditLogResponse> getByUser(
            String username
    ) {

        if (
                username == null ||
                        username.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Username is required"
            );
        }


        return auditLogRepository
                .findByChangedByIgnoreCaseOrderByChangedAtDesc(
                        username.trim()
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    /*
     * =========================
     * Internal Save
     * =========================
     */

    private void saveAuditLog(
            String entityType,
            Long entityId,
            AuditAction action,
            Map<String, Object> oldValues,
            Map<String, Object> newValues
    ) {

        AuditLog auditLog =
                new AuditLog();


        auditLog.setEntityType(
                entityType
        );

        auditLog.setEntityId(
                entityId
        );

        auditLog.setAction(
                action
        );

        auditLog.setChangedBy(
                auditorAware
                        .getCurrentAuditor()
                        .orElse(
                                "SYSTEM"
                        )
        );

        auditLog.setChangedAt(
                LocalDateTime.now()
        );

        auditLog.setOldValues(
                toJson(
                        oldValues
                )
        );

        auditLog.setNewValues(
                toJson(
                        newValues
                )
        );


        auditLogRepository.save(
                auditLog
        );
    }


    /*
     * =========================
     * Helpers
     * =========================
     */

    private String normalizeEntityType(
            String entityType
    ) {

        if (
                entityType == null ||
                        entityType.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Entity type is required"
            );
        }


        return entityType
                .trim()
                .toUpperCase();
    }


    private String toJson(
            Map<String, Object> values
    ) {

        if (
                values == null
        ) {

            return null;
        }


        try {

            return objectMapper
                    .writeValueAsString(
                            values
                    );

        } catch (
                JacksonException exception
        ) {

            throw new IllegalStateException(
                    "Failed to serialize audit data",
                    exception
            );
        }
    }


    private AuditLogResponse mapToResponse(
            AuditLog auditLog
    ) {

        return new AuditLogResponse(

                auditLog.getId(),

                auditLog.getEntityType(),

                auditLog.getEntityId(),

                auditLog.getAction(),

                auditLog.getChangedBy(),

                auditLog.getChangedAt(),

                auditLog.getOldValues(),

                auditLog.getNewValues()
        );
    }
}