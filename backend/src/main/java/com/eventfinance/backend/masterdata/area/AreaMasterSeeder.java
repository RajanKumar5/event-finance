package com.eventfinance.backend.masterdata.area;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class AreaMasterSeeder
        implements CommandLineRunner {

    private final AreaMasterRepository repository;


    public AreaMasterSeeder(
            AreaMasterRepository repository
    ) {
        this.repository = repository;
    }


    @Override
    @Transactional
    public void run(
            String... args
    ) {

        seedArea("ITA");
        seedArea("ITB");
        seedArea("ITC");

        seedArea("MEA");
        seedArea("MEB");
        seedArea("MEC");
        seedArea("MED");
        seedArea("MEE");
        seedArea("MEF");
        seedArea("MEG");
        seedArea("MEH");
        seedArea("MEI");

        seedArea("CVA");
        seedArea("CVB");

        seedArea("PPA");
        seedArea("PPB");
        seedArea("PPC");
        seedArea("PPD");
        seedArea("PPE");
    }


    private void seedArea(
            String code
    ) {

        if (
                repository.existsByCodeIgnoreCase(
                        code
                )
        ) {
            return;
        }


        AreaMaster area =
                new AreaMaster();

        area.setCode(
                code
        );

        area.setName(
                code
        );

        area.setActive(
                true
        );


        repository.save(
                area
        );
    }
}