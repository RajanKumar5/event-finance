package com.eventfinance.backend.contributor;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.contribution.ContributionRepository;
import com.eventfinance.backend.contributor.dto.ContributorRequest;
import com.eventfinance.backend.contributor.dto.ContributorResponse;
import com.eventfinance.backend.masterdata.area.AreaMaster;
import com.eventfinance.backend.masterdata.area.AreaMasterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContributorService {

    private final ContributorRepository contributorRepository;

    private final ContributionRepository contributionRepository;

    private final AreaMasterRepository areaMasterRepository;


    public ContributorService(
            ContributorRepository contributorRepository,
            ContributionRepository contributionRepository,
            AreaMasterRepository areaMasterRepository
    ) {

        this.contributorRepository =
                contributorRepository;

        this.contributionRepository =
                contributionRepository;

        this.areaMasterRepository =
                areaMasterRepository;
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


    /*
     * Kept temporarily because ContributorController
     * currently still accepts the old Area enum.
     *
     * The entity itself no longer depends on the enum.
     *
     * We can remove Area.java after updating
     * ContributorController separately.
     */
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


        /*
         * If the contributor keeps the same area,
         * allow it even when that area has since
         * been deactivated.
         *
         * This preserves historical relationships.
         */
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

            /*
             * A new/different Area assignment must
             * always use an active Area.
             */
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