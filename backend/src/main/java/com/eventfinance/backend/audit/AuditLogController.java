package com.eventfinance.backend.audit;

import com.eventfinance.backend.audit.dto.AuditLogResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(
        "/api/v1/audit-logs"
)
public class AuditLogController {

    private final AuditLogService
            auditLogService;


    public AuditLogController(
            AuditLogService auditLogService
    ) {

        this.auditLogService =
                auditLogService;
    }


    /*
     * GET /api/v1/audit-logs
     */
    @GetMapping
    public ResponseEntity<List<AuditLogResponse>>
    getAll() {

        return ResponseEntity.ok(
                auditLogService.getAll()
        );
    }


    /*
     * GET /api/v1/audit-logs/entity/EXPENSE
     */
    @GetMapping(
            "/entity/{entityType}"
    )
    public ResponseEntity<List<AuditLogResponse>>
    getByEntityType(
            @PathVariable
            String entityType
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getByEntityType(
                                entityType
                        )
        );
    }


    /*
     * GET
     * /api/v1/audit-logs/entity/EXPENSE/15
     */
    @GetMapping(
            "/entity/{entityType}/{entityId}"
    )
    public ResponseEntity<List<AuditLogResponse>>
    getEntityHistory(
            @PathVariable
            String entityType,

            @PathVariable
            Long entityId
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getEntityHistory(
                                entityType,
                                entityId
                        )
        );
    }


    /*
     * GET
     * /api/v1/audit-logs/user/admin
     */
    @GetMapping(
            "/user/{username}"
    )
    public ResponseEntity<List<AuditLogResponse>>
    getByUser(
            @PathVariable
            String username
    ) {

        return ResponseEntity.ok(
                auditLogService
                        .getByUser(
                                username
                        )
        );
    }
}