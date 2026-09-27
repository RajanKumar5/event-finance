package com.eventfinance.backend.contributor;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.contribution.ContributionRepository;
import com.eventfinance.backend.contributor.dto.ContributorRequest;
import com.eventfinance.backend.contributor.dto.ContributorResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContributorService {

    private final ContributorRepository contributorRepository;
    private final ContributionRepository contributionRepository;

    public ContributorService(
            ContributorRepository contributorRepository,
            ContributionRepository contributionRepository
    ) {
        this.contributorRepository = contributorRepository;
        this.contributionRepository = contributionRepository;
    }

    public ContributorResponse createContributor(
            ContributorRequest request
    ) {
        Contributor contributor = new Contributor();

        contributor.setName(request.name());
        contributor.setHouseNumber(request.houseNumber());
        contributor.setArea(request.area());
        contributor.setPhone(request.phone());
        contributor.setNotes(request.notes());

        return mapToResponse(
                contributorRepository.save(contributor)
        );
    }

    public List<ContributorResponse> getAllContributors() {
        return contributorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ContributorResponse getContributorById(Long id) {
        Contributor contributor =
                contributorRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contributor not found with id: " + id
                                )
                        );

        return mapToResponse(contributor);
    }

    private ContributorResponse mapToResponse(
            Contributor contributor
    ) {
        return new ContributorResponse(
                contributor.getId(),
                contributor.getName(),
                contributor.getHouseNumber(),
                contributor.getArea(),
                contributor.getAddress(),
                contributor.getPhone(),
                contributor.getNotes(),
                contributor.getCreatedAt(),
                contributor.getUpdatedAt()
        );
    }

    public ContributorResponse updateContributor(
            Long id,
            ContributorRequest request
    ) {
        Contributor contributor = contributorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Contributor not found with id: " + id
                        )
                );

        contributor.setName(request.name());
        contributor.setHouseNumber(request.houseNumber());
        contributor.setArea(request.area());
        contributor.setPhone(request.phone());
        contributor.setNotes(request.notes());

        return mapToResponse(
                contributorRepository.save(contributor)
        );
    }

    public void deleteContributor(Long id) {

        Contributor contributor =
                contributorRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contributor not found with id: "
                                                + id
                                )
                        );

        boolean hasContributions =
                contributionRepository
                        .existsByContributorId(id);

        if (hasContributions) {
            throw new IllegalArgumentException(
                    "Cannot delete a contributor who has contribution records."
            );
        }

        contributorRepository.delete(contributor);
    }

    public List<ContributorResponse> getContributorsByArea(Area area) {
        return contributorRepository.findByArea(area)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ContributorResponse> searchContributorsByName(String name) {
        return contributorRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ContributorResponse> getContributorsByHouseNumber(
            String houseNumber
    ) {
        return contributorRepository.findByHouseNumber(houseNumber)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}