package com.eventfinance.backend.masterdata;

import com.eventfinance.backend.masterdata.area.AreaMaster;
import com.eventfinance.backend.masterdata.area.AreaMasterRepository;
import com.eventfinance.backend.masterdata.expensecategory.ExpenseCategoryMaster;
import com.eventfinance.backend.masterdata.expensecategory.ExpenseCategoryMasterRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Component
public class MasterDataSeeder
        implements CommandLineRunner {

    private final ExpenseCategoryMasterRepository
            expenseCategoryRepository;

    private final AreaMasterRepository
            areaMasterRepository;


    public MasterDataSeeder(
            ExpenseCategoryMasterRepository expenseCategoryRepository,
            AreaMasterRepository areaMasterRepository
    ) {

        this.expenseCategoryRepository =
                expenseCategoryRepository;

        this.areaMasterRepository =
                areaMasterRepository;
    }


    @Override
    @Transactional
    public void run(
            String... args
    ) {

        seedExpenseCategories();

        seedAreas();
    }


    /*
     * =========================
     * Expense Categories
     * =========================
     */

    private void seedExpenseCategories() {

        List<CategorySeed>
                categories =
                List.of(

                        new CategorySeed(
                                "DECORATION",
                                "Decoration",
                                10
                        ),

                        new CategorySeed(
                                "SOUND",
                                "Sound",
                                20
                        ),

                        new CategorySeed(
                                "LIGHTING",
                                "Lighting",
                                30
                        ),

                        new CategorySeed(
                                "PRASAD",
                                "Prasad",
                                40
                        ),

                        new CategorySeed(
                                "PUJA",
                                "Puja",
                                50
                        ),

                        new CategorySeed(
                                "TRANSPORTATION",
                                "Transportation",
                                60
                        ),

                        new CategorySeed(
                                "PRINTING",
                                "Printing",
                                70
                        ),

                        new CategorySeed(
                                "CLEANING",
                                "Cleaning",
                                80
                        ),

                        new CategorySeed(
                                "FOOD",
                                "Food",
                                90
                        ),

                        new CategorySeed(
                                "SECURITY",
                                "Security",
                                100
                        ),

                        new CategorySeed(
                                "MISCELLANEOUS",
                                "Miscellaneous",
                                110
                        )
                );


        for (
                CategorySeed seed :
                categories
        ) {

            if (
                    expenseCategoryRepository
                            .existsByCodeIgnoreCase(
                                    seed.code()
                            )
            ) {

                continue;
            }


            ExpenseCategoryMaster category =
                    new ExpenseCategoryMaster();


            category.setCode(
                    seed.code()
            );

            category.setName(
                    seed.name()
            );

            category.setActive(
                    true
            );

            category.setSortOrder(
                    seed.sortOrder()
            );


            expenseCategoryRepository.save(
                    category
            );
        }
    }


    /*
     * =========================
     * Areas
     * =========================
     */

    private void seedAreas() {

        List<AreaSeed>
                areas =
                List.of(

                        new AreaSeed(
                                "ITA",
                                "ITA"
                        ),

                        new AreaSeed(
                                "ITB",
                                "ITB"
                        ),

                        new AreaSeed(
                                "ITC",
                                "ITC"
                        ),

                        new AreaSeed(
                                "MEA",
                                "MEA"
                        ),

                        new AreaSeed(
                                "MEB",
                                "MEB"
                        ),

                        new AreaSeed(
                                "MEC",
                                "MEC"
                        ),

                        new AreaSeed(
                                "MED",
                                "MED"
                        ),

                        new AreaSeed(
                                "MEE",
                                "MEE"
                        ),

                        new AreaSeed(
                                "MEF",
                                "MEF"
                        ),

                        new AreaSeed(
                                "MEG",
                                "MEG"
                        ),

                        new AreaSeed(
                                "MEH",
                                "MEH"
                        ),

                        new AreaSeed(
                                "MEI",
                                "MEI"
                        ),

                        new AreaSeed(
                                "CVA",
                                "CVA"
                        ),

                        new AreaSeed(
                                "CVB",
                                "CVB"
                        ),

                        new AreaSeed(
                                "PPA",
                                "PPA"
                        ),

                        new AreaSeed(
                                "PPB",
                                "PPB"
                        ),

                        new AreaSeed(
                                "PPC",
                                "PPC"
                        ),

                        new AreaSeed(
                                "PPD",
                                "PPD"
                        ),

                        new AreaSeed(
                                "PPE",
                                "PPE"
                        )
                );


        for (
                AreaSeed seed :
                areas
        ) {

            if (
                    areaMasterRepository
                            .existsByCodeIgnoreCase(
                                    seed.code()
                            )
            ) {

                continue;
            }


            AreaMaster area =
                    new AreaMaster();


            area.setCode(
                    seed.code()
            );

            area.setName(
                    seed.name()
            );

            area.setActive(
                    true
            );


            areaMasterRepository.save(
                    area
            );
        }
    }


    /*
     * =========================
     * Seed Records
     * =========================
     */

    private record CategorySeed(

            String code,

            String name,

            Integer sortOrder

    ) {
    }


    private record AreaSeed(

            String code,

            String name

    ) {
    }
}