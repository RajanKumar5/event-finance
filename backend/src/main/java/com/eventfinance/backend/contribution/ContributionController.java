package com.eventfinance.backend.contribution;

import com.eventfinance.backend.contribution.dto.ContributionRequest;
import com.eventfinance.backend.contribution.dto.ContributionResponse;
import com.eventfinance.backend.contribution.dto.EventCollectionSummary;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contributions")
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(
            ContributionService contributionService
    ) {
        this.contributionService = contributionService;
    }

    @PostMapping
    public ResponseEntity<ContributionResponse> createContribution(
            @Valid @RequestBody ContributionRequest request
    ) {

        ContributionResponse response =
                contributionService.createContribution(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ContributionResponse>>
    getAllContributions() {

        return ResponseEntity.ok(
                contributionService.getAllContributions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContributionResponse>
    getContributionById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                contributionService.getContributionById(id)
        );
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<ContributionResponse>>
    getByEvent(
            @PathVariable Long eventId
    ) {

        return ResponseEntity.ok(
                contributionService.getContributionsByEvent(eventId)
        );
    }

    @GetMapping("/event/{eventId}/summary")
    public ResponseEntity<EventCollectionSummary>
    getEventCollectionSummary(
            @PathVariable Long eventId
    ) {

        return ResponseEntity.ok(
                contributionService
                        .getEventCollectionSummary(eventId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContributionResponse>
    updateContribution(
            @PathVariable Long id,
            @Valid @RequestBody ContributionRequest request
    ) {

        return ResponseEntity.ok(
                contributionService.updateContribution(
                        id,
                        request
                )
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContribution(
            @PathVariable Long id
    ) {
        contributionService.deleteContribution(id);
    }
}