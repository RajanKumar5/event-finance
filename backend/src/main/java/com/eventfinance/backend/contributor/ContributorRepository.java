package com.eventfinance.backend.contributor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContributorRepository
        extends JpaRepository<Contributor, Long> {

    List<Contributor>
    findAllByOrderByNameAsc();
}