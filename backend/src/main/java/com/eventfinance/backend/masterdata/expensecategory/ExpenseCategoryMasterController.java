package com.eventfinance.backend.masterdata.expensecategory;

import com.eventfinance.backend.masterdata.expensecategory.dto.ExpenseCategoryMasterRequest;
import com.eventfinance.backend.masterdata.expensecategory.dto.ExpenseCategoryMasterResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(
        "/api/v1/master/expense-categories"
)
public class ExpenseCategoryMasterController {

    private final
    ExpenseCategoryMasterService service;


    public ExpenseCategoryMasterController(
            ExpenseCategoryMasterService service
    ) {
        this.service =
                service;
    }


    @PostMapping
    public ResponseEntity<
            ExpenseCategoryMasterResponse
            >
    create(
            @Valid
            @RequestBody
            ExpenseCategoryMasterRequest request
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        service.create(
                                request
                        )
                );
    }


    @GetMapping
    public ResponseEntity<
            List<ExpenseCategoryMasterResponse>
            >
    getAll(
            @RequestParam(
                    defaultValue = "false"
            )
            boolean activeOnly
    ) {

        if (
                activeOnly
        ) {
            return ResponseEntity.ok(
                    service.getActive()
            );
        }


        return ResponseEntity.ok(
                service.getAll()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<
            ExpenseCategoryMasterResponse
            >
    getById(
            @PathVariable
            Long id
    ) {

        return ResponseEntity.ok(
                service.getById(
                        id
                )
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<
            ExpenseCategoryMasterResponse
            >
    update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            ExpenseCategoryMasterRequest request
    ) {

        return ResponseEntity.ok(
                service.update(
                        id,
                        request
                )
        );
    }


    @PatchMapping(
            "/{id}/status"
    )
    public ResponseEntity<
            ExpenseCategoryMasterResponse
            >
    updateStatus(
            @PathVariable
            Long id,

            @RequestParam
            boolean active
    ) {

        return ResponseEntity.ok(
                service.updateStatus(
                        id,
                        active
                )
        );
    }


    /*
     * DELETE
     * /api/v1/master/expense-categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable
            Long id
    ) {

        service.delete(
                id
        );


        return ResponseEntity
                .noContent()
                .build();
    }
}