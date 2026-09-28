package com.eventfinance.backend.contributor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ContributorRepository
        extends JpaRepository<Contributor, Long> {

    List<Contributor>
    findAllByOrderByNameAsc();


    /*
     * Used before deleting an Area master.
     *
     * If any contributor references the area,
     * the Area cannot be deleted.
     */
    boolean existsByAreaMasterId(
            Long areaId
    );
}