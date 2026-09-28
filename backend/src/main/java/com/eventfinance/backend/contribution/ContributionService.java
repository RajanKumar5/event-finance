package com.eventfinance.backend.contribution;

import com.eventfinance.backend.audit.AuditLogService;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
public class ContributionService {

    private static final String AUDIT_ENTITY_TYPE =
            "CONTRIBUTION";


    private final ContributionRepository
            contributionRepository;

    private final EventRepository
            eventRepository;

    private final ContributorRepository
            contributorRepository;

    private final AuditLogService
            auditLogService;


    public ContributionService(
            ContributionRepository contributionRepository,
            EventRepository eventRepository,
            ContributorRepository contributorRepository,
            AuditLogService auditLogService
    ) {

        this.contributionRepository =
                contributionRepository;

        this.eventRepository =
                eventRepository;

        this.contributorRepository =
                contributorRepository;

        this.auditLogService =
                auditLogService;
    }


    @Transactional
    public ContributionResponse createContribution(
            ContributionRequest request
    ) {

        Event event =
                eventRepository
                        .findById(
                                request.eventId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Event not found with id: "
                                                        + request.eventId()
                                        )
                        );


        validateEventIsWritable(
                event
        );


        Contributor contributor =
                contributorRepository
                        .findById(
                                request.contributorId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Contributor not found with id: "
                                                        + request.contributorId()
                                        )
                        );


        if (
                contributionRepository
                        .existsByEventIdAndReceiptNumber(
                                request.eventId(),
                                request.receiptNumber()
                        )
        ) {

            throw new IllegalArgumentException(
                    "Receipt number already exists for this event: "
                            + request.receiptNumber()
            );
        }


        validatePaymentDetails(
                request
        );


        Contribution contribution =
                new Contribution();


        contribution.setEvent(
                event
        );

        contribution.setContributor(
                contributor
        );

        contribution.setReceiptNumber(
                request.receiptNumber()
        );

        contribution.setPaymentDate(
                request.paymentDate()
        );

        contribution.setPaymentMode(
                request.paymentMode()
        );

        contribution.setAmountPaid(
                request.amountPaid()
        );

        contribution.setPaymentReference(
                request.paymentReference()
        );

        contribution.setNotes(
                request.notes()
        );


        if (
                request.paymentMode() ==
                        PaymentMode.UPI
        ) {

            contribution.setUpiPaidTo(
                    request.upiPaidTo()
            );

        } else {

            contribution.setUpiPaidTo(
                    null
            );
        }


        Contribution savedContribution =
                contributionRepository.save(
                        contribution
                );


        auditLogService.logCreate(
                AUDIT_ENTITY_TYPE,
                savedContribution.getId(),
                snapshot(
                        savedContribution
                )
        );


        return mapToResponse(
                savedContribution
        );
    }


    @Transactional(readOnly = true)
    public List<ContributionResponse> getAllContributions() {

        return contributionRepository
                .findAll()
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public ContributionResponse getContributionById(
            Long id
    ) {

        Contribution contribution =
                getContributionEntity(
                        id
                );


        return mapToResponse(
                contribution
        );
    }


    @Transactional(readOnly = true)
    public List<ContributionResponse> getContributionsByEvent(
            Long eventId
    ) {

        if (
                !eventRepository
                        .existsById(
                                eventId
                        )
        ) {

            throw new ResourceNotFoundException(
                    "Event not found with id: "
                            + eventId
            );
        }


        return contributionRepository
                .findByEventId(
                        eventId
                )
                .stream()
                .map(
                        this::mapToResponse
                )
                .toList();
    }


    @Transactional(readOnly = true)
    public EventCollectionSummary getEventCollectionSummary(
            Long eventId
    ) {

        Event event =
                eventRepository
                        .findById(
                                eventId
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Event not found with id: "
                                                        + eventId
                                        )
                        );


        List<Contribution> contributions =
                contributionRepository
                        .findByEventId(
                                eventId
                        );


        BigDecimal totalCollected =
                BigDecimal.ZERO;

        BigDecimal cashCollected =
                BigDecimal.ZERO;

        BigDecimal upiCollected =
                BigDecimal.ZERO;

        BigDecimal bankCollected =
                BigDecimal.ZERO;


        for (
                Contribution contribution :
                contributions
        ) {

            BigDecimal amount =
                    contribution.getAmountPaid();


            totalCollected =
                    totalCollected.add(
                            amount
                    );


            switch (
                    contribution.getPaymentMode()
            ) {

                case CASH ->
                        cashCollected =
                                cashCollected.add(
                                        amount
                                );

                case UPI ->
                        upiCollected =
                                upiCollected.add(
                                        amount
                                );

                case BANK ->
                        bankCollected =
                                bankCollected.add(
                                        amount
                                );
            }
        }


        long uniqueContributorCount =
                contributions
                        .stream()
                        .map(
                                contribution ->
                                        contribution
                                                .getContributor()
                                                .getId()
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


    @Transactional
    public ContributionResponse updateContribution(
            Long id,
            ContributionRequest request
    ) {

        Contribution contribution =
                getContributionEntity(
                        id
                );


        Map<String, Object> oldValues =
                snapshot(
                        contribution
                );


        Event event =
                eventRepository
                        .findById(
                                request.eventId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Event not found with id: "
                                                        + request.eventId()
                                        )
                        );


        validateEventIsWritable(
                event
        );


        Contributor contributor =
                contributorRepository
                        .findById(
                                request.contributorId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Contributor not found with id: "
                                                        + request.contributorId()
                                        )
                        );


        boolean eventChanged =
                !contribution
                        .getEvent()
                        .getId()
                        .equals(
                                request.eventId()
                        );


        boolean receiptChanged =
                !contribution
                        .getReceiptNumber()
                        .equalsIgnoreCase(
                                request.receiptNumber()
                        );


        if (
                (
                        eventChanged ||
                                receiptChanged
                ) &&
                        contributionRepository
                                .existsByEventIdAndReceiptNumber(
                                        request.eventId(),
                                        request.receiptNumber()
                                )
        ) {

            throw new IllegalArgumentException(
                    "Receipt number already exists for this event: "
                            + request.receiptNumber()
            );
        }


        validatePaymentDetails(
                request
        );


        contribution.setEvent(
                event
        );

        contribution.setContributor(
                contributor
        );

        contribution.setReceiptNumber(
                request.receiptNumber()
        );

        contribution.setPaymentDate(
                request.paymentDate()
        );

        contribution.setPaymentMode(
                request.paymentMode()
        );

        contribution.setAmountPaid(
                request.amountPaid()
        );


        if (
                request.paymentMode() ==
                        PaymentMode.UPI
        ) {

            contribution.setUpiPaidTo(
                    request.upiPaidTo()
            );

        } else {

            contribution.setUpiPaidTo(
                    null
            );
        }


        contribution.setPaymentReference(
                request.paymentReference()
        );


        contribution.setNotes(
                request.notes()
        );


        Contribution updatedContribution =
                contributionRepository.save(
                        contribution
                );


        auditLogService.logUpdate(
                AUDIT_ENTITY_TYPE,
                updatedContribution.getId(),
                oldValues,
                snapshot(
                        updatedContribution
                )
        );


        return mapToResponse(
                updatedContribution
        );
    }


    @Transactional
    public void deleteContribution(
            Long id
    ) {

        Contribution contribution =
                getContributionEntity(
                        id
                );


        validateEventIsWritable(
                contribution.getEvent()
        );


        Map<String, Object> oldValues =
                snapshot(
                        contribution
                );


        auditLogService.logDelete(
                AUDIT_ENTITY_TYPE,
                contribution.getId(),
                oldValues
        );


        contributionRepository.delete(
                contribution
        );
    }


    private Contribution getContributionEntity(
            Long id
    ) {

        return contributionRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Contribution not found with id: "
                                                + id
                                )
                );
    }


    private void validatePaymentDetails(
            ContributionRequest request
    ) {

        if (
                request.paymentMode() ==
                        PaymentMode.UPI &&
                        (
                                request.upiPaidTo() ==
                                        null ||
                                        request.upiPaidTo()
                                                .isBlank()
                        )
        ) {

            throw new IllegalArgumentException(
                    "UPI Paid To is required when payment mode is UPI"
            );
        }
    }


    private Map<String, Object> snapshot(
            Contribution contribution
    ) {

        Map<String, Object> values =
                new LinkedHashMap<>();


        Event event =
                contribution.getEvent();


        Contributor contributor =
                contribution.getContributor();


        values.put(
                "id",
                contribution.getId()
        );

        values.put(
                "eventId",
                event != null
                        ? event.getId()
                        : null
        );

        values.put(
                "eventName",
                event != null
                        ? event.getName()
                        : null
        );

        values.put(
                "contributorId",
                contributor != null
                        ? contributor.getId()
                        : null
        );

        values.put(
                "contributorName",
                contributor != null
                        ? contributor.getName()
                        : null
        );

        values.put(
                "receiptNumber",
                contribution.getReceiptNumber()
        );

        values.put(
                "paymentDate",
                contribution.getPaymentDate()
        );

        values.put(
                "paymentMode",
                contribution.getPaymentMode()
        );

        values.put(
                "amountPaid",
                contribution.getAmountPaid()
        );

        values.put(
                "upiPaidTo",
                contribution.getUpiPaidTo()
        );

        values.put(
                "paymentReference",
                contribution.getPaymentReference()
        );

        values.put(
                "notes",
                contribution.getNotes()
        );


        return values;
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


    private void validateEventIsWritable(
            Event event
    ) {

        if (
                event.getStatus() ==
                        EventStatus.COMPLETED ||
                        event.getStatus() ==
                                EventStatus.ARCHIVED
        ) {

            throw new IllegalArgumentException(
                    "Cannot modify financial records for a completed or archived event"
            );
        }
    }
}