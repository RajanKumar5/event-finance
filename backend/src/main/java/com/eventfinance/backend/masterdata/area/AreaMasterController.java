package com.eventfinance.backend.masterdata.area;

import com.eventfinance.backend.masterdata.area.dto.AreaMasterRequest;
import com.eventfinance.backend.masterdata.area.dto.AreaMasterResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/v1/master/areas"
)
public class AreaMasterController {

    private final AreaMasterService service;


    public AreaMasterController(
            AreaMasterService service
    ) {
        this.service = service;
    }


    @PostMapping
    public ResponseEntity<AreaMasterResponse> create(
            @Valid
            @RequestBody
            AreaMasterRequest request
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
    public ResponseEntity<List<AreaMasterResponse>> getAll(
            @RequestParam(
                    defaultValue = "false"
            )
            boolean activeOnly
    ) {

        if (activeOnly) {

            return ResponseEntity.ok(
                    service.getActive()
            );
        }


        return ResponseEntity.ok(
                service.getAll()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<AreaMasterResponse> getById(
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
    public ResponseEntity<AreaMasterResponse> update(
            @PathVariable
            Long id,

            @Valid
            @RequestBody
            AreaMasterRequest request
    ) {

        return ResponseEntity.ok(
                service.update(
                        id,
                        request
                )
        );
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<AreaMasterResponse> updateStatus(
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
}