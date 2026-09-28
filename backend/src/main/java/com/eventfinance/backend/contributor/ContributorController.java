package com.eventfinance.backend.contributor;

import com.eventfinance.backend.contributor.dto.ContributorRequest;
import com.eventfinance.backend.contributor.dto.ContributorResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contributors")
public class ContributorController {

    private final ContributorService contributorService;


    public ContributorController(
            ContributorService contributorService
    ) {
        this.contributorService =
                contributorService;
    }


    @PostMapping
    public ResponseEntity<ContributorResponse> createContributor(
            @Valid @RequestBody ContributorRequest request
    ) {

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        contributorService
                                .createContributor(
                                        request
                                )
                );
    }


    @GetMapping
    public ResponseEntity<List<ContributorResponse>>
    getAllContributors() {

        return ResponseEntity.ok(
                contributorService
                        .getAllContributors()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<ContributorResponse>
    getContributorById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                contributorService
                        .getContributorById(
                                id
                        )
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<ContributorResponse> updateContributor(
            @PathVariable Long id,
            @Valid @RequestBody ContributorRequest request
    ) {

        return ResponseEntity.ok(
                contributorService
                        .updateContributor(
                                id,
                                request
                        )
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContributor(
            @PathVariable Long id
    ) {

        contributorService
                .deleteContributor(
                        id
                );


        return ResponseEntity
                .noContent()
                .build();
    }


    @GetMapping("/area/{area}")
    public ResponseEntity<List<ContributorResponse>>
    getByArea(
            @PathVariable String area
    ) {

        return ResponseEntity.ok(
                contributorService
                        .getContributorsByArea(
                                area
                        )
        );
    }


    @GetMapping("/search")
    public ResponseEntity<List<ContributorResponse>>
    searchByName(
            @RequestParam String name
    ) {

        return ResponseEntity.ok(
                contributorService
                        .searchContributorsByName(
                                name
                        )
        );
    }


    @GetMapping("/house/{houseNumber}")
    public ResponseEntity<List<ContributorResponse>>
    getByHouseNumber(
            @PathVariable String houseNumber
    ) {

        return ResponseEntity.ok(
                contributorService
                        .getContributorsByHouseNumber(
                                houseNumber
                        )
        );
    }
}