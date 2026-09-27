package com.eventfinance.backend.contribution;

import com.eventfinance.backend.common.exception.ResourceNotFoundException;
import com.eventfinance.backend.common.payment.PaymentMode;
import com.eventfinance.backend.contribution.dto.ContributionRequest;
import com.eventfinance.backend.contribution.dto.ContributionResponse;
import com.eventfinance.backend.contribution.dto.EventCollectionSummary;
import com.eventfinance.backend.contributor.Contributor;
import com.eventfinance.backend.contributor.ContributorRepository;
import com.eventfinance.backend.event.Event;
import com.eventfinance.backend.event.EventRepository;
import com.eventfinance.backend.event.EventStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final EventRepository eventRepository;
    private final ContributorRepository contributorRepository;

    public ContributionService(
            ContributionRepository contributionRepository,
            EventRepository eventRepository,
            ContributorRepository contributorRepository
    ) {
        this.contributionRepository = contributionRepository;
        this.eventRepository = eventRepository;
        this.contributorRepository = contributorRepository;
    }

    public ContributionResponse createContribution(
            ContributionRequest request
    ) {

        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with id: "
                                        + request.eventId()
                        )
                );


        validateEventIsWritable(event);

        Contributor contributor =
                contributorRepository.findById(request.contributorId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contributor not found with id: "
                                                + request.contributorId()
                                )
                        );

        if (contributionRepository
                .existsByEventIdAndReceiptNumber(
                        request.eventId(),
                        request.receiptNumber()
                )) {

            throw new IllegalArgumentException(
                    "Receipt number already exists for this event: "
                            + request.receiptNumber()
            );
        }

        validatePaymentDetails(request);

        Contribution contribution = new Contribution();

        contribution.setEvent(event);
        contribution.setContributor(contributor);
        contribution.setReceiptNumber(request.receiptNumber());
        contribution.setPaymentDate(request.paymentDate());
        contribution.setPaymentMode(request.paymentMode());
        contribution.setAmountPaid(request.amountPaid());
        contribution.setPaymentReference(request.paymentReference());
        contribution.setNotes(request.notes());

        if (request.paymentMode() == PaymentMode.UPI) {
            contribution.setUpiPaidTo(request.upiPaidTo());
        } else {
            contribution.setUpiPaidTo(null);
        }

        Contribution savedContribution =
                contributionRepository.save(contribution);

        return mapToResponse(savedContribution);
    }

    public List<ContributionResponse> getAllContributions() {

        return contributionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ContributionResponse getContributionById(Long id) {

        Contribution contribution =
                contributionRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contribution not found with id: " + id
                                )
                        );

        return mapToResponse(contribution);
    }

    public List<ContributionResponse> getContributionsByEvent(
            Long eventId
    ) {

        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException(
                    "Event not found with id: " + eventId
            );
        }

        return contributionRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EventCollectionSummary getEventCollectionSummary(
            Long eventId
    ) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Event not found with id: " + eventId
                        )
                );

        List<Contribution> contributions =
                contributionRepository.findByEventId(eventId);

        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal cashCollected = BigDecimal.ZERO;
        BigDecimal upiCollected = BigDecimal.ZERO;
        BigDecimal bankCollected = BigDecimal.ZERO;

        for (Contribution contribution : contributions) {

            BigDecimal amount = contribution.getAmountPaid();

            totalCollected = totalCollected.add(amount);

            switch (contribution.getPaymentMode()) {

                case CASH ->
                        cashCollected = cashCollected.add(amount);

                case UPI ->
                        upiCollected = upiCollected.add(amount);

                case BANK ->
                        bankCollected = bankCollected.add(amount);
            }
        }

        long uniqueContributorCount = contributions
                .stream()
                .map(contribution ->
                        contribution.getContributor().getId()
                )
                .distinct()
                .count();

        return new EventCollectionSummary(
                event.getId(),
                event.getName(),
                totalCollected,
                cashCollected,
                upiCollected,
                bankCollected,
                contributions.size(),
                uniqueContributorCount
        );
    }

    public ContributionResponse updateContribution(
            Long id,
            ContributionRequest request
    ) {

        Contribution contribution =
                contributionRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contribution not found with id: " + id
                                )
                        );

        Event event =
                eventRepository.findById(request.eventId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event not found with id: "
                                                + request.eventId()
                                )
                        );

        validateEventIsWritable(event);

        Contributor contributor =
                contributorRepository.findById(request.contributorId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contributor not found with id: "
                                                + request.contributorId()
                                )
                        );

        boolean eventChanged =
                !contribution.getEvent()
                        .getId()
                        .equals(request.eventId());

        boolean receiptChanged =
                !contribution.getReceiptNumber()
                        .equalsIgnoreCase(
                                request.receiptNumber()
                        );

        if ((eventChanged || receiptChanged)
                && contributionRepository
                .existsByEventIdAndReceiptNumber(
                        request.eventId(),
                        request.receiptNumber()
                )) {

            throw new IllegalArgumentException(
                    "Receipt number already exists for this event: "
                            + request.receiptNumber()
            );
        }

        validatePaymentDetails(request);

        contribution.setEvent(event);
        contribution.setContributor(contributor);
        contribution.setReceiptNumber(request.receiptNumber());
        contribution.setPaymentDate(request.paymentDate());
        contribution.setPaymentMode(request.paymentMode());
        contribution.setAmountPaid(request.amountPaid());

        if (request.paymentMode() == PaymentMode.UPI) {
            contribution.setUpiPaidTo(request.upiPaidTo());
        } else {
            contribution.setUpiPaidTo(null);
        }

        contribution.setPaymentReference(
                request.paymentReference()
        );

        contribution.setNotes(request.notes());

        Contribution updatedContribution =
                contributionRepository.save(contribution);

        return mapToResponse(updatedContribution);
    }

    public void deleteContribution(Long id) {

        Contribution contribution =
                contributionRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contribution not found with id: " + id
                                )
                        );

        validateEventIsWritable(
                contribution.getEvent()
        );

        contributionRepository.delete(contribution);
    }

    private void validatePaymentDetails(
            ContributionRequest request
    ) {

        if (request.paymentMode() == PaymentMode.UPI
                && (request.upiPaidTo() == null
                || request.upiPaidTo().isBlank())) {

            throw new IllegalArgumentException(
                    "UPI Paid To is required when payment mode is UPI"
            );
        }
    }

    private ContributionResponse mapToResponse(
            Contribution contribution
    ) {

        return new ContributionResponse(
                contribution.getId(),
                contribution.getEvent().getId(),
                contribution.getEvent().getName(),
                contribution.getContributor().getId(),
                contribution.getContributor().getName(),
                contribution.getContributor().getAddress(),
                contribution.getReceiptNumber(),
                contribution.getPaymentDate(),
                contribution.getPaymentMode(),
                contribution.getAmountPaid(),
                contribution.getUpiPaidTo(),
                contribution.getPaymentReference(),
                contribution.getNotes(),
                contribution.getCreatedAt(),
                contribution.getUpdatedAt()
        );
    }

    private void validateEventIsWritable(Event event) {
        if (event.getStatus() == EventStatus.COMPLETED
                || event.getStatus() == EventStatus.ARCHIVED) {

            throw new IllegalArgumentException(
                    "Cannot modify financial records for a completed or archived event"
            );
        }
    }
}