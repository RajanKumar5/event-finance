package com.eventfinance.backend.masterdata.area;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.masterdata.area.dto.AreaMasterRequest;
import com.eventfinance.backend.masterdata.area.dto.AreaMasterResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AreaMasterService {

    private final AreaMasterRepository repository;


    public AreaMasterService(
            AreaMasterRepository repository
    ) {
        this.repository = repository;
    }


    @Transactional
    public AreaMasterResponse create(
            AreaMasterRequest request
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
                    "Area already exists with code: "
                            + code
            );
        }


        AreaMaster area =
                new AreaMaster();

        area.setCode(
                code
        );

        area.setName(
                name
        );

        area.setActive(
                request.active()
        );


        return mapToResponse(
                repository.save(
                        area
                )
        );
    }


    @Transactional(readOnly = true)
    public List<AreaMasterResponse> getAll() {

        return repository
                .findAllByOrderByNameAsc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AreaMasterResponse> getActive() {

        return repository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<AreaMasterResponse> getAll(
            boolean activeOnly
    ) {

        if (activeOnly) {
            return getActive();
        }

        return getAll();
    }


    @Transactional(readOnly = true)
    public AreaMasterResponse getById(
            Long id
    ) {

        return mapToResponse(
                getEntity(
                        id
                )
        );
    }


    @Transactional
    public AreaMasterResponse update(
            Long id,
            AreaMasterRequest request
    ) {

        AreaMaster area =
                getEntity(
                        id
                );


        /*
         * Code stays immutable.
         */
        area.setName(
                normalizeName(
                        request.name()
                )
        );

        area.setActive(
                request.active()
        );


        return mapToResponse(
                repository.save(
                        area
                )
        );
    }


    @Transactional
    public AreaMasterResponse updateStatus(
            Long id,
            boolean active
    ) {

        AreaMaster area =
                getEntity(
                        id
                );


        area.setActive(
                active
        );


        return mapToResponse(
                repository.save(
                        area
                )
        );
    }


    private AreaMaster getEntity(
            Long id
    ) {

        return repository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Area not found with id: "
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


    private AreaMasterResponse mapToResponse(
            AreaMaster area
    ) {

        return new AreaMasterResponse(
                area.getId(),
                area.getCode(),
                area.getName(),
                area.getActive()
        );
    }
}