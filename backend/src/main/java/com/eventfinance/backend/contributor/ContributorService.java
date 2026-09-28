package com.eventfinance.backend.contributor;

import com.eventfinance.backend.audit.AuditLogService;
import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.contribution.ContributionRepository;
import com.eventfinance.backend.contributor.dto.ContributorRequest;
import com.eventfinance.backend.contributor.dto.ContributorResponse;
import com.eventfinance.backend.masterdata.area.AreaMaster;
import com.eventfinance.backend.masterdata.area.AreaMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
public class ContributorService {

    private static final String AUDIT_ENTITY_TYPE =
            "CONTRIBUTOR";


    private final ContributorRepository
            contributorRepository;

    private final ContributionRepository
            contributionRepository;

    private final AreaMasterRepository
            areaMasterRepository;

    private final AuditLogService
            auditLogService;


    public ContributorService(
            ContributorRepository contributorRepository,
            ContributionRepository contributionRepository,
            AreaMasterRepository areaMasterRepository,
            AuditLogService auditLogService
    ) {

        this.contributorRepository =
                contributorRepository;

        this.contributionRepository =
                contributionRepository;

        this.areaMasterRepository =
                areaMasterRepository;

        this.auditLogService =
                auditLogService;
    }


    /*
     * =========================
     * Create
     * =========================
     */

    @Transactional
    public ContributorResponse createContributor(
            ContributorRequest request
    ) {

        AreaMaster area =
                resolveActiveArea(
                        request.area()
                );


        Contributor contributor =
                new Contributor();


        contributor.setName(
                normalizeRequired(
                        request.name()
                )
        );


        contributor.setHouseNumber(
                normalizeRequired(
                        request.houseNumber()
                )
        );


        contributor.setAreaMaster(
                area
        );


        contributor.setPhone(
                normalizeOptional(
                        request.phone()
                )
        );


        contributor.setNotes(
                normalizeOptional(
                        request.notes()
                )
        );


        Contributor saved =
                contributorRepository.save(
                        contributor
                );


        auditLogService.logCreate(
                AUDIT_ENTITY_TYPE,
                saved.getId(),
                snapshot(
                        saved
                )
        );


        return mapToResponse(
                saved
        );
    }


    /*
     * =========================
     * Read
     * =========================
     */

    @Transactional(readOnly = true)
    public List<ContributorResponse> getAllContributors() {

        return contributorRepository
                .findAllByOrderByNameAsc()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public ContributorResponse getContributorById(
            Long id
    ) {

        return mapToResponse(
                getContributorEntity(
                        id
                )
        );
    }


    @Transactional(readOnly = true)
    public List<ContributorResponse> getContributorsByArea(
            String area
    ) {

        String areaCode =
                normalizeAreaCode(
                        area
                );


        if (
                areaCode == null ||
                        areaCode.isBlank()
        ) {

            return List.of();
        }


        return contributorRepository
                .findAllByOrderByNameAsc()
                .stream()
                .filter(
                        contributor -> {

                            String contributorArea =
                                    contributor.getArea();


                            return contributorArea != null &&
                                    contributorArea
                                            .equalsIgnoreCase(
                                                    areaCode
                                            );
                        }
                )
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ContributorResponse> searchContributorsByName(
            String name
    ) {

        if (
                name == null ||
                        name.isBlank()
        ) {

            return getAllContributors();
        }


        String normalizedSearch =
                name
                        .trim()
                        .toLowerCase();


        return contributorRepository
                .findAllByOrderByNameAsc()
                .stream()
                .filter(
                        contributor ->
                                contributor.getName() != null &&
                                        contributor
                                                .getName()
                                                .toLowerCase()
                                                .contains(
                                                        normalizedSearch
                                                )
                )
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public List<ContributorResponse> getContributorsByHouseNumber(
            String houseNumber
    ) {

        if (
                houseNumber == null ||
                        houseNumber.isBlank()
        ) {

            return List.of();
        }


        String normalizedSearch =
                houseNumber
                        .trim()
                        .toLowerCase();


        return contributorRepository
                .findAllByOrderByNameAsc()
                .stream()
                .filter(
                        contributor ->
                                contributor.getHouseNumber() != null &&
                                        contributor
                                                .getHouseNumber()
                                                .toLowerCase()
                                                .contains(
                                                        normalizedSearch
                                                )
                )
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    /*
     * =========================
     * Update
     * =========================
     */

    @Transactional
    public ContributorResponse updateContributor(
            Long id,
            ContributorRequest request
    ) {

        Contributor contributor =
                getContributorEntity(
                        id
                );


        Map<String, Object> oldValues =
                snapshot(
                        contributor
                );


        contributor.setName(
                normalizeRequired(
                        request.name()
                )
        );


        contributor.setHouseNumber(
                normalizeRequired(
                        request.houseNumber()
                )
        );


        String requestedArea =
                normalizeAreaCode(
                        request.area()
                );


        AreaMaster currentArea =
                contributor.getAreaMaster();


        boolean keepingCurrentArea =
                currentArea != null &&
                        currentArea.getCode() != null &&
                        currentArea
                                .getCode()
                                .equalsIgnoreCase(
                                        requestedArea
                                );


        if (
                !keepingCurrentArea
        ) {

            AreaMaster newArea =
                    resolveActiveArea(
                            requestedArea
                    );


            contributor.setAreaMaster(
                    newArea
            );
        }


        contributor.setPhone(
                normalizeOptional(
                        request.phone()
                )
        );


        contributor.setNotes(
                normalizeOptional(
                        request.notes()
                )
        );


        Contributor saved =
                contributorRepository.save(
                        contributor
                );


        auditLogService.logUpdate(
                AUDIT_ENTITY_TYPE,
                saved.getId(),
                oldValues,
                snapshot(
                        saved
                )
        );


        return mapToResponse(
                saved
        );
    }


    /*
     * =========================
     * Delete
     * =========================
     */

    @Transactional
    public void deleteContributor(
            Long id
    ) {

        Contributor contributor =
                getContributorEntity(
                        id
                );


        if (
                contributionRepository
                        .existsByContributorId(
                                id
                        )
        ) {

            throw new IllegalStateException(
                    "Contributor cannot be deleted because contribution records exist"
            );
        }


        Map<String, Object> oldValues =
                snapshot(
                        contributor
                );


        auditLogService.logDelete(
                AUDIT_ENTITY_TYPE,
                contributor.getId(),
                oldValues
        );


        contributorRepository.delete(
                contributor
        );
    }


    /*
     * =========================
     * Entity Lookup
     * =========================
     */

    private Contributor getContributorEntity(
            Long id
    ) {

        return contributorRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Contributor not found with id: "
                                                + id
                                )
                );
    }


    /*
     * =========================
     * Area Resolution
     * =========================
     */

    private AreaMaster resolveActiveArea(
            String areaCode
    ) {

        String normalized =
                normalizeAreaCode(
                        areaCode
                );


        if (
                normalized == null ||
                        normalized.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "Area is required"
            );
        }


        AreaMaster area =
                areaMasterRepository
                        .findByCodeIgnoreCase(
                                normalized
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Invalid area: "
                                                        + normalized
                                        )
                        );


        if (
                !Boolean.TRUE.equals(
                        area.getActive()
                )
        ) {

            throw new IllegalArgumentException(
                    "Area is inactive: "
                            + area.getCode()
            );
        }


        return area;
    }


    /*
     * =========================
     * Normalization
     * =========================
     */

    private String normalizeAreaCode(
            String value
    ) {

        if (
                value == null
        ) {

            return null;
        }


        return value
                .trim()
                .toUpperCase();
    }


    private String normalizeRequired(
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


    private String normalizeOptional(
            String value
    ) {

        if (
                value == null
        ) {

            return null;
        }


        String normalized =
                value
                        .trim()
                        .replaceAll(
                                "\\s+",
                                " "
                        );


        return normalized.isBlank()
                ? null
                : normalized;
    }


    /*
     * =========================
     * Audit Snapshot
     * =========================
     */

    private Map<String, Object> snapshot(
            Contributor contributor
    ) {

        Map<String, Object> values =
                new LinkedHashMap<>();


        AreaMaster area =
                contributor.getAreaMaster();


        values.put(
                "id",
                contributor.getId()
        );

        values.put(
                "name",
                contributor.getName()
        );

        values.put(
                "houseNumber",
                contributor.getHouseNumber()
        );

        values.put(
                "areaId",
                area != null
                        ? area.getId()
                        : null
        );

        values.put(
                "areaCode",
                area != null
                        ? area.getCode()
                        : null
        );

        values.put(
                "areaName",
                area != null
                        ? area.getName()
                        : null
        );

        values.put(
                "phone",
                contributor.getPhone()
        );

        values.put(
                "notes",
                contributor.getNotes()
        );


        return values;
    }


    /*
     * =========================
     * Response Mapping
     * =========================
     */

    private ContributorResponse mapToResponse(
            Contributor contributor
    ) {

        AreaMaster area =
                contributor.getAreaMaster();


        Long areaId =
                area != null
                        ? area.getId()
                        : null;


        String areaCode =
                area != null
                        ? area.getCode()
                        : null;


        String areaName =
                area != null
                        ? area.getName()
                        : null;


        return new ContributorResponse(
                contributor.getId(),
                contributor.getName(),
                contributor.getHouseNumber(),

                areaId,
                areaCode,
                areaName,

                contributor.getAddress(),

                contributor.getPhone(),
                contributor.getNotes(),

                contributor.getCreatedAt(),
                contributor.getUpdatedAt()
        );
    }
}