package com.eventfinance.backend.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {


    List<AuditLog>
    findAllByOrderByChangedAtDesc();


    List<AuditLog>
    findByEntityTypeOrderByChangedAtDesc(
            String entityType
    );


    List<AuditLog>
    findByEntityTypeAndEntityIdOrderByChangedAtDesc(
            String entityType,
            Long entityId
    );


    List<AuditLog>
    findByChangedByIgnoreCaseOrderByChangedAtDesc(
            String changedBy
    );
}