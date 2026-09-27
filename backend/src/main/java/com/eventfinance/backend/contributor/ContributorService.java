package com.eventfinance.backend.contributor;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.contributor.dto.ContributorRequest;
import com.eventfinance.backend.contributor.dto.ContributorResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContributorService {

    private final ContributorRepository contributorRepository;

    public ContributorService(
            ContributorRepository contributorRepository
    ) {
        this.contributorRepository = contributorRepository;
    }

    public ContributorResponse createContributor(
            ContributorRequest request
    ) {

        if (contributorRepository.existsByReceiptNumber(
                request.receiptNumber()
        )) {
            throw new IllegalArgumentException(
                    "Receipt number already exists: "
                            + request.receiptNumber()
            );
        }

        if (request.paymentMode() == PaymentMode.UPI
                && (request.upiPaidTo() == null
                || request.upiPaidTo().isBlank())) {

            throw new IllegalArgumentException(
                    "UPI Paid To is required when payment mode is UPI"
            );
        }

        Contributor contributor = new Contributor();

        contributor.setReceiptNumber(request.receiptNumber());
        contributor.setDate(request.date());
        contributor.setPaymentMode(request.paymentMode());
        contributor.setName(request.name());
        contributor.setHouseNumber(request.houseNumber());
        contributor.setArea(request.area());
        contributor.setAmountPaid(request.amountPaid());
        contributor.setPaymentReference(request.paymentReference());
        contributor.setPhone(request.phone());
        contributor.setNotes(request.notes());

        if (request.paymentMode() == PaymentMode.UPI) {
            contributor.setUpiPaidTo(request.upiPaidTo());
        }

        Contributor savedContributor =
                contributorRepository.save(contributor);

        return mapToResponse(savedContributor);
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
                contributor.getReceiptNumber(),
                contributor.getDate(),
                contributor.getPaymentMode(),
                contributor.getName(),
                contributor.getHouseNumber(),
                contributor.getArea(),
                contributor.getAddress(),
                contributor.getAmountPaid(),
                contributor.getUpiPaidTo(),
                contributor.getPaymentReference(),
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

        if (!contributor.getReceiptNumber().equals(request.receiptNumber())
                && contributorRepository.existsByReceiptNumber(request.receiptNumber())) {
            throw new IllegalArgumentException(
                    "Receipt number already exists: " + request.receiptNumber()
            );
        }

        if (request.paymentMode() == PaymentMode.UPI
                && (request.upiPaidTo() == null
                || request.upiPaidTo().isBlank())) {
            throw new IllegalArgumentException(
                    "UPI Paid To is required when payment mode is UPI"
            );
        }

        contributor.setReceiptNumber(request.receiptNumber());
        contributor.setDate(request.date());
        contributor.setPaymentMode(request.paymentMode());
        contributor.setName(request.name());
        contributor.setHouseNumber(request.houseNumber());
        contributor.setArea(request.area());
        contributor.setAmountPaid(request.amountPaid());
        contributor.setPaymentReference(request.paymentReference());
        contributor.setPhone(request.phone());
        contributor.setNotes(request.notes());

        if (request.paymentMode() == PaymentMode.UPI) {
            contributor.setUpiPaidTo(request.upiPaidTo());
        } else {
            contributor.setUpiPaidTo(null);
        }

        return mapToResponse(
                contributorRepository.save(contributor)
        );
    }

    public void deleteContributor(Long id) {
        if (!contributorRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Contributor not found with id: " + id
            );
        }

        contributorRepository.deleteById(id);
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