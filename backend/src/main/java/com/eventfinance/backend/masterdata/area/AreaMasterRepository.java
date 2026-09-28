package com.eventfinance.backend.masterdata.area;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AreaMasterRepository
        extends JpaRepository<AreaMaster, Long> {

    boolean existsByCodeIgnoreCase(
            String code
    );

    Optional<AreaMaster>
    findByCodeIgnoreCase(
            String code
    );

    List<AreaMaster>
    findAllByOrderByNameAsc();

    List<AreaMaster>
    findByActiveTrueOrderByNameAsc();
}