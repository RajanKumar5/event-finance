package com.eventfinance.backend.masterdata;

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


    public MasterDataSeeder(
            ExpenseCategoryMasterRepository expenseCategoryRepository
    ) {

        this.expenseCategoryRepository =
                expenseCategoryRepository;
    }


    @Override
    @Transactional
    public void run(
            String... args
    ) {

        seedExpenseCategories();
    }


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


    private record CategorySeed(

            String code,

            String name,

            Integer sortOrder

    ) {
    }
}