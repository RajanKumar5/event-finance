import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    jsPDF,
} from "jspdf";

import {
    autoTable,
} from "jspdf-autotable";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    getContributionsByEvent,
} from "../api/contributionApi";

import {
    getExpensesByEvent,
} from "../api/expenseApi";

import {
    getExpenseCategories,
} from "../api/masterDataApi";

import Pagination from "../components/Pagination";

import {
    useEvent,
} from "../context/EventContext";

import "./Reports.css";


const formatCurrency = (
    value
) =>
    `₹${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:
                2,
        }
    )}`;


const formatCompactCurrency = (
    value
) =>
    `₹${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            notation:
                "compact",

            maximumFractionDigits:
                1,
        }
    )}`;


const formatPdfAmount = (
    value
) =>
    `Rs. ${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:
                2,
        }
    )}`;


const formatCategory = (
    value
) =>
    value?.replaceAll(
        "_",
        " "
    ) || "";


const formatDate = (
    date
) => {
    if (!date) {
        return "-";
    }

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


const escapeCsvValue = (
    value
) => {
    const normalized =
        value == null
            ? ""
            : String(value);

    return `"${normalized.replaceAll(
        '"',
        '""'
    )}"`;
};


const downloadCsv = (
    filename,
    headers,
    rows
) => {
    const csvContent = [
        headers
            .map(
                escapeCsvValue
            )
            .join(","),

        ...rows.map(
            (row) =>
                row
                    .map(
                        escapeCsvValue
                    )
                    .join(",")
        ),
    ].join("\n");


    const blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;",
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );
};


const sanitizeFilename = (
    value
) =>
    (value || "event")
        .trim()
        .toLowerCase()
        .replaceAll(
            " ",
            "-"
        )
        .replace(
            /[^a-z0-9-_]/g,
            ""
        );


const Reports = () => {
    const {
        selectedEventId,
        selectedEvent,
    } = useEvent();


    const [
        contributions,
        setContributions,
    ] = useState([]);


    const [
        expenses,
        setExpenses,
    ] = useState([]);


    const [
        expenseCategories,
        setExpenseCategories,
    ] = useState([]);


    const [
        loadingCategories,
        setLoadingCategories,
    ] = useState(false);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    /*
     * Report filters
     */
    const [
        fromDate,
        setFromDate,
    ] = useState("");


    const [
        toDate,
        setToDate,
    ] = useState("");


    const [
        paymentModeFilter,
        setPaymentModeFilter,
    ] = useState("ALL");


    const [
        expenseCategoryFilter,
        setExpenseCategoryFilter,
    ] = useState("ALL");


    /*
     * Contribution pagination
     */
    const [
        contributionPage,
        setContributionPage,
    ] = useState(1);


    const [
        contributionPageSize,
        setContributionPageSize,
    ] = useState(10);


    /*
     * Expense pagination
     */
    const [
        expensePage,
        setExpensePage,
    ] = useState(1);


    const [
        expensePageSize,
        setExpensePageSize,
    ] = useState(10);


    useEffect(() => {
        const loadExpenseCategories =
            async () => {
                try {
                    setLoadingCategories(
                        true
                    );

                    const data =
                        await getExpenseCategories(
                            false
                        );

                    setExpenseCategories(
                        data
                    );

                } catch (err) {
                    console.error(
                        err
                    );

                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load expense categories"
                    );

                } finally {
                    setLoadingCategories(
                        false
                    );
                }
            };

        loadExpenseCategories();

    }, []);


    useEffect(() => {
        setFromDate("");

        setToDate("");

        setPaymentModeFilter(
            "ALL"
        );

        setExpenseCategoryFilter(
            "ALL"
        );

        setContributionPage(
            1
        );

        setExpensePage(
            1
        );


        if (
            !selectedEventId
        ) {
            setContributions(
                []
            );

            setExpenses(
                []
            );

            return;
        }


        const loadReportData =
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError("");


                    const [
                        contributionData,
                        expenseData,
                    ] =
                        await Promise.all(
                            [
                                getContributionsByEvent(
                                    selectedEventId
                                ),

                                getExpensesByEvent(
                                    selectedEventId
                                ),
                            ]
                        );


                    setContributions(
                        contributionData
                    );

                    setExpenses(
                        expenseData
                    );

                } catch (err) {
                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load report data"
                    );

                } finally {
                    setLoading(
                        false
                    );
                }
            };


        loadReportData();

    }, [
        selectedEventId,
    ]);


    /*
     * Reset pagination whenever
     * report filters change.
     */
    useEffect(() => {
        setContributionPage(
            1
        );

        setExpensePage(
            1
        );

    }, [
        fromDate,
        toDate,
        paymentModeFilter,
        expenseCategoryFilter,
    ]);


    const filteredContributions =
        useMemo(() => {
            return contributions.filter(
                (
                    contribution
                ) => {
                    const date =
                        contribution
                            .paymentDate;


                    const matchesFrom =
                        !fromDate ||
                        date >=
                        fromDate;


                    const matchesTo =
                        !toDate ||
                        date <=
                        toDate;


                    const matchesMode =
                        paymentModeFilter ===
                        "ALL" ||
                        contribution
                            .paymentMode ===
                        paymentModeFilter;


                    return (
                        matchesFrom &&
                        matchesTo &&
                        matchesMode
                    );
                }
            );

        }, [
            contributions,
            fromDate,
            toDate,
            paymentModeFilter,
        ]);


    const filteredExpenses =
        useMemo(() => {
            return expenses.filter(
                (
                    expense
                ) => {
                    const date =
                        expense
                            .expenseDate;


                    const matchesFrom =
                        !fromDate ||
                        date >=
                        fromDate;


                    const matchesTo =
                        !toDate ||
                        date <=
                        toDate;


                    const matchesMode =
                        paymentModeFilter ===
                        "ALL" ||
                        expense
                            .paymentMode ===
                        paymentModeFilter;


                    const matchesCategory =
                        expenseCategoryFilter ===
                        "ALL" ||
                        expense
                            .category ===
                        expenseCategoryFilter;


                    return (
                        matchesFrom &&
                        matchesTo &&
                        matchesMode &&
                        matchesCategory
                    );
                }
            );

        }, [
            expenses,
            fromDate,
            toDate,
            paymentModeFilter,
            expenseCategoryFilter,
        ]);


    const categoryNameByCode =
        useMemo(() => {
            const categoryMap =
                new Map();

            expenseCategories.forEach(
                (category) => {
                    categoryMap.set(
                        category.code,
                        category.name
                    );
                }
            );

            expenses.forEach(
                (expense) => {
                    if (
                        !expense.category
                    ) {
                        return;
                    }

                    if (
                        !categoryMap.has(
                            expense.category
                        )
                    ) {
                        categoryMap.set(
                            expense.category,
                            expense.categoryName ||
                            formatCategory(
                                expense.category
                            )
                        );
                    }
                }
            );

            return categoryMap;

        }, [
            expenseCategories,
            expenses,
        ]);


    const getCategoryName =
        (categoryCode) => {
            if (
                !categoryCode
            ) {
                return "-";
            }

            return (
                categoryNameByCode.get(
                    categoryCode
                ) ||
                formatCategory(
                    categoryCode
                )
            );
        };


    const reportCategoryOptions =
        useMemo(() => {
            const options =
                new Map();

            expenseCategories.forEach(
                (category) => {
                    options.set(
                        category.code,
                        {
                            code: category.code,
                            name: category.name,
                            active: category.active,
                        }
                    );
                }
            );

            expenses.forEach(
                (expense) => {
                    if (
                        !expense.category
                    ) {
                        return;
                    }

                    if (
                        !options.has(
                            expense.category
                        )
                    ) {
                        options.set(
                            expense.category,
                            {
                                code: expense.category,
                                name:
                                    expense.categoryName ||
                                    getCategoryName(
                                        expense.category
                                    ),
                                active: false,
                            }
                        );
                    }
                }
            );

            return Array.from(
                options.values()
            ).sort(
                (first, second) =>
                    first.name.localeCompare(
                        second.name
                    )
            );

        }, [
            expenseCategories,
            expenses,
        ]);


    /*
     * Sort report tables by latest
     * transaction first.
     */
    const sortedContributions =
        useMemo(() => {
            return [
                ...filteredContributions,
            ].sort(
                (
                    first,
                    second
                ) =>
                    (
                        second.paymentDate ||
                        ""
                    ).localeCompare(
                        first.paymentDate ||
                        ""
                    )
            );

        }, [
            filteredContributions,
        ]);


    const sortedExpenses =
        useMemo(() => {
            return [
                ...filteredExpenses,
            ].sort(
                (
                    first,
                    second
                ) =>
                    (
                        second.expenseDate ||
                        ""
                    ).localeCompare(
                        first.expenseDate ||
                        ""
                    )
            );

        }, [
            filteredExpenses,
        ]);


    /*
     * Contribution pagination
     */
    const contributionTotalPages =
        Math.max(
            1,
            Math.ceil(
                sortedContributions.length /
                contributionPageSize
            )
        );


    const safeContributionPage =
        Math.min(
            contributionPage,
            contributionTotalPages
        );


    const contributionStartIndex =
        (
            safeContributionPage -
            1
        ) *
        contributionPageSize;


    const paginatedContributions =
        sortedContributions.slice(
            contributionStartIndex,

            contributionStartIndex +
            contributionPageSize
        );


    /*
     * Expense pagination
     */
    const expenseTotalPages =
        Math.max(
            1,
            Math.ceil(
                sortedExpenses.length /
                expensePageSize
            )
        );


    const safeExpensePage =
        Math.min(
            expensePage,
            expenseTotalPages
        );


    const expenseStartIndex =
        (
            safeExpensePage -
            1
        ) *
        expensePageSize;


    const paginatedExpenses =
        sortedExpenses.slice(
            expenseStartIndex,

            expenseStartIndex +
            expensePageSize
        );


    const handleContributionPageSizeChange =
        (
            newPageSize
        ) => {
            setContributionPageSize(
                newPageSize
            );

            setContributionPage(
                1
            );
        };


    const handleExpensePageSizeChange =
        (
            newPageSize
        ) => {
            setExpensePageSize(
                newPageSize
            );

            setExpensePage(
                1
            );
        };


    const totalCollected =
        filteredContributions.reduce(
            (
                total,
                contribution
            ) =>
                total +
                Number(
                    contribution
                        .amountPaid ||
                    0
                ),
            0
        );


    const totalExpenses =
        filteredExpenses.reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(
                    expense.amount ||
                    0
                ),
            0
        );


    const balance =
        totalCollected -
        totalExpenses;


    /*
     * Expense category reporting
     */
    const expenseCategorySummary =
        useMemo(() => {
            const categoryMap =
                new Map();


            filteredExpenses.forEach(
                (
                    expense
                ) => {
                    const category =
                        expense.category ||
                        "MISCELLANEOUS";


                    const current =
                        categoryMap.get(
                            category
                        ) || {
                            category,

                            categoryName:
                                expense.categoryName ||
                                getCategoryName(
                                    category
                                ),

                            expenseCount:
                                0,

                            totalExpense:
                                0,
                        };


                    current.expenseCount +=
                        1;


                    current.totalExpense +=
                        Number(
                            expense.amount ||
                            0
                        );


                    categoryMap.set(
                        category,
                        current
                    );
                }
            );


            return Array.from(
                categoryMap.values()
            ).sort(
                (
                    first,
                    second
                ) =>
                    second.totalExpense -
                    first.totalExpense
            );

        }, [
            filteredExpenses,
            categoryNameByCode,
        ]);


    const expenseCategoryReport =
        useMemo(() => {
            return expenseCategorySummary.map(
                (
                    item
                ) => ({
                    ...item,

                    percentage:
                        totalExpenses >
                            0
                            ? (
                                item.totalExpense /
                                totalExpenses
                            ) *
                            100
                            : 0,
                })
            );

        }, [
            expenseCategorySummary,
            totalExpenses,
        ]);


    const filtersActive =
        fromDate !== "" ||
        toDate !== "" ||
        paymentModeFilter !==
        "ALL" ||
        expenseCategoryFilter !==
        "ALL";


    const clearFilters =
        () => {
            setFromDate("");

            setToDate("");

            setPaymentModeFilter(
                "ALL"
            );

            setExpenseCategoryFilter(
                "ALL"
            );

            setContributionPage(
                1
            );

            setExpensePage(
                1
            );
        };


    const getReportRangeText =
        () => {
            if (
                !fromDate &&
                !toDate
            ) {
                return "All Dates";
            }


            if (
                fromDate &&
                toDate
            ) {
                return `${formatDate(
                    fromDate
                )} - ${formatDate(
                    toDate
                )}`;
            }


            if (
                fromDate
            ) {
                return `From ${formatDate(
                    fromDate
                )}`;
            }


            return `Up to ${formatDate(
                toDate
            )}`;
        };


    const getPdfFilenamePrefix =
        () =>
            sanitizeFilename(
                selectedEvent
                    ?.name
            );


    const addPdfHeader = (
        doc,
        reportTitle
    ) => {
        const eventName =
            selectedEvent
                ?.name ||
            "Event";


        doc.setFontSize(
            18
        );

        doc.setFont(
            "helvetica",
            "bold"
        );


        doc.text(
            "Event Finance",
            14,
            18
        );


        doc.setFontSize(
            13
        );


        doc.text(
            reportTitle,
            14,
            27
        );


        doc.setFontSize(
            10
        );

        doc.setFont(
            "helvetica",
            "normal"
        );


        doc.text(
            `Event: ${eventName}`,
            14,
            35
        );


        doc.text(
            `Date Range: ${getReportRangeText()}`,
            14,
            41
        );


        doc.text(
            `Payment Mode: ${paymentModeFilter ===
                "ALL"
                ? "All"
                : paymentModeFilter
            }`,
            14,
            47
        );
    };


    const addPageNumbers =
        (doc) => {
            const pageCount =
                doc.getNumberOfPages();


            for (
                let page =
                    1;
                page <=
                pageCount;
                page++
            ) {
                doc.setPage(
                    page
                );


                doc.setFontSize(
                    9
                );


                doc.text(
                    `Page ${page} of ${pageCount}`,
                    196,
                    290,
                    {
                        align:
                            "right",
                    }
                );
            }
        };


    /*
     * CSV exports always use the
     * full filtered dataset.
     */
    const handleContributionCsvExport =
        () => {
            if (
                sortedContributions.length ===
                0
            ) {
                return;
            }


            const rows =
                sortedContributions.map(
                    (
                        contribution
                    ) => [
                            contribution
                                .receiptNumber,

                            contribution
                                .paymentDate,

                            contribution
                                .contributorName,

                            contribution
                                .contributorAddress,

                            contribution
                                .paymentMode,

                            contribution
                                .amountPaid,

                            contribution
                                .upiPaidTo ||
                            "",

                            contribution
                                .paymentReference ||
                            "",

                            contribution
                                .notes ||
                            "",
                        ]
                );


            downloadCsv(
                `${getPdfFilenamePrefix()}-contributions.csv`,

                [
                    "Receipt Number",
                    "Date",
                    "Contributor",
                    "Address",
                    "Payment Mode",
                    "Amount",
                    "UPI Paid To",
                    "Payment Reference",
                    "Notes",
                ],

                rows
            );
        };


    const handleExpenseCsvExport =
        () => {
            if (
                sortedExpenses.length ===
                0
            ) {
                return;
            }


            const rows =
                sortedExpenses.map(
                    (
                        expense
                    ) => [
                            expense.expenseDate,

                            expense.categoryName ||
                            getCategoryName(
                                expense.category
                            ),

                            expense.description,

                            expense.vendorName ||
                            "",

                            expense.paymentMode,

                            expense.amount,

                            expense.paidBy ||
                            "",

                            expense
                                .paymentReference ||
                            "",

                            expense.notes ||
                            "",
                        ]
                );


            downloadCsv(
                `${getPdfFilenamePrefix()}-expenses.csv`,

                [
                    "Date",
                    "Category",
                    "Description",
                    "Vendor",
                    "Payment Mode",
                    "Amount",
                    "Paid By",
                    "Payment Reference",
                    "Notes",
                ],

                rows
            );
        };


    const handleExpenseCategoryCsvExport =
        () => {
            if (
                expenseCategoryReport.length ===
                0
            ) {
                return;
            }


            const rows =
                expenseCategoryReport.map(
                    (
                        item
                    ) => [
                            item.categoryName ||
                            getCategoryName(
                                item.category
                            ),

                            item.expenseCount,

                            item.totalExpense,

                            `${item.percentage.toFixed(
                                2
                            )}%`,
                        ]
                );


            downloadCsv(
                `${getPdfFilenamePrefix()}-expense-category-summary.csv`,

                [
                    "Expense Category",
                    "Transactions",
                    "Total Expense",
                    "Percentage of Total",
                ],

                rows
            );
        };


    const handleContributionPdfExport =
        () => {
            if (
                sortedContributions.length ===
                0
            ) {
                return;
            }


            const doc =
                new jsPDF({
                    orientation:
                        "landscape",
                });


            addPdfHeader(
                doc,
                "Contribution Report"
            );


            doc.text(
                `Total Collected: ${formatPdfAmount(
                    totalCollected
                )}`,
                14,
                55
            );


            doc.text(
                `Contribution Count: ${sortedContributions.length}`,
                14,
                61
            );


            autoTable(
                doc,
                {
                    startY:
                        68,

                    head: [
                        [
                            "Receipt",
                            "Date",
                            "Contributor",
                            "Address",
                            "Mode",
                            "Amount",
                            "Reference",
                        ],
                    ],

                    body:
                        sortedContributions.map(
                            (
                                contribution
                            ) => [
                                    contribution
                                        .receiptNumber ||
                                    "-",

                                    formatDate(
                                        contribution
                                            .paymentDate
                                    ),

                                    contribution
                                        .contributorName ||
                                    "-",

                                    contribution
                                        .contributorAddress ||
                                    "-",

                                    contribution
                                        .paymentMode ||
                                    "-",

                                    formatPdfAmount(
                                        contribution
                                            .amountPaid
                                    ),

                                    contribution
                                        .paymentReference ||
                                    "-",
                                ]
                        ),

                    styles: {
                        fontSize:
                            8,

                        cellPadding:
                            2.5,
                    },

                    headStyles: {
                        fillColor:
                            [
                                79,
                                70,
                                229,
                            ],
                    },
                }
            );


            addPageNumbers(
                doc
            );


            doc.save(
                `${getPdfFilenamePrefix()}-contributions.pdf`
            );
        };


    const handleExpensePdfExport =
        () => {
            if (
                sortedExpenses.length ===
                0
            ) {
                return;
            }


            const doc =
                new jsPDF({
                    orientation:
                        "landscape",
                });


            addPdfHeader(
                doc,
                "Expense Report"
            );


            doc.text(
                `Category: ${expenseCategoryFilter ===
                    "ALL"
                    ? "All"
                    : getCategoryName(
                        expenseCategoryFilter
                    )
                }`,
                14,
                53
            );


            doc.text(
                `Total Expenses: ${formatPdfAmount(
                    totalExpenses
                )}`,
                14,
                59
            );


            doc.text(
                `Expense Count: ${sortedExpenses.length}`,
                14,
                65
            );


            autoTable(
                doc,
                {
                    startY:
                        72,

                    head: [
                        [
                            "Date",
                            "Category",
                            "Description",
                            "Vendor",
                            "Mode",
                            "Amount",
                            "Paid By",
                            "Reference",
                        ],
                    ],

                    body:
                        sortedExpenses.map(
                            (
                                expense
                            ) => [
                                    formatDate(
                                        expense.expenseDate
                                    ),

                                    expense.categoryName ||
                                    getCategoryName(
                                        expense.category
                                    ),

                                    expense.description ||
                                    "-",

                                    expense.vendorName ||
                                    "-",

                                    expense.paymentMode ||
                                    "-",

                                    formatPdfAmount(
                                        expense.amount
                                    ),

                                    expense.paidBy ||
                                    "-",

                                    expense
                                        .paymentReference ||
                                    "-",
                                ]
                        ),

                    styles: {
                        fontSize:
                            8,

                        cellPadding:
                            2.5,
                    },

                    headStyles: {
                        fillColor:
                            [
                                234,
                                88,
                                12,
                            ],
                    },
                }
            );


            addPageNumbers(
                doc
            );


            doc.save(
                `${getPdfFilenamePrefix()}-expenses.pdf`
            );
        };


    const handleFullPdfExport =
        () => {
            const doc =
                new jsPDF({
                    orientation:
                        "landscape",
                });


            addPdfHeader(
                doc,
                "Financial Summary Report"
            );


            doc.setFontSize(
                11
            );

            doc.setFont(
                "helvetica",
                "bold"
            );


            doc.text(
                "Financial Summary",
                14,
                57
            );


            autoTable(
                doc,
                {
                    startY:
                        63,

                    head: [
                        [
                            "Metric",
                            "Value",
                        ],
                    ],

                    body: [
                        [
                            "Total Collected",
                            formatPdfAmount(
                                totalCollected
                            ),
                        ],

                        [
                            "Total Expenses",
                            formatPdfAmount(
                                totalExpenses
                            ),
                        ],

                        [
                            "Net Balance",
                            formatPdfAmount(
                                balance
                            ),
                        ],

                        [
                            "Contribution Count",
                            String(
                                sortedContributions.length
                            ),
                        ],

                        [
                            "Expense Count",
                            String(
                                sortedExpenses.length
                            ),
                        ],
                    ],

                    theme:
                        "grid",

                    styles: {
                        fontSize:
                            9,
                    },

                    headStyles: {
                        fillColor:
                            [
                                79,
                                70,
                                229,
                            ],
                    },
                }
            );


            let nextY =
                (
                    doc
                        .lastAutoTable
                        ?.finalY ||
                    63
                ) + 12;


            if (
                expenseCategoryReport.length >
                0
            ) {
                doc.setFontSize(
                    11
                );

                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.text(
                    "Expense by Category",
                    14,
                    nextY
                );


                autoTable(
                    doc,
                    {
                        startY:
                            nextY +
                            5,

                        head: [
                            [
                                "Category",
                                "Entries",
                                "Total Expense",
                                "Share",
                            ],
                        ],

                        body:
                            expenseCategoryReport.map(
                                (
                                    item
                                ) => [
                                        item.categoryName ||
                                        getCategoryName(
                                            item.category
                                        ),

                                        String(
                                            item.expenseCount
                                        ),

                                        formatPdfAmount(
                                            item.totalExpense
                                        ),

                                        `${item.percentage.toFixed(
                                            1
                                        )}%`,
                                    ]
                            ),

                        styles: {
                            fontSize:
                                8,
                        },

                        headStyles: {
                            fillColor:
                                [
                                    234,
                                    88,
                                    12,
                                ],
                        },
                    }
                );
            }


            nextY =
                (
                    doc
                        .lastAutoTable
                        ?.finalY ||
                    nextY
                ) + 12;


            if (
                sortedContributions.length >
                0
            ) {
                if (
                    nextY >
                    175
                ) {
                    doc.addPage();

                    nextY =
                        20;
                }


                doc.setFontSize(
                    11
                );

                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.text(
                    "Contributions",
                    14,
                    nextY
                );


                autoTable(
                    doc,
                    {
                        startY:
                            nextY +
                            5,

                        head: [
                            [
                                "Receipt",
                                "Date",
                                "Contributor",
                                "Address",
                                "Mode",
                                "Amount",
                            ],
                        ],

                        body:
                            sortedContributions.map(
                                (
                                    contribution
                                ) => [
                                        contribution
                                            .receiptNumber ||
                                        "-",

                                        formatDate(
                                            contribution
                                                .paymentDate
                                        ),

                                        contribution
                                            .contributorName ||
                                        "-",

                                        contribution
                                            .contributorAddress ||
                                        "-",

                                        contribution
                                            .paymentMode ||
                                        "-",

                                        formatPdfAmount(
                                            contribution
                                                .amountPaid
                                        ),
                                    ]
                            ),

                        styles: {
                            fontSize:
                                8,
                        },

                        headStyles: {
                            fillColor:
                                [
                                    22,
                                    163,
                                    74,
                                ],
                        },
                    }
                );
            }


            nextY =
                (
                    doc
                        .lastAutoTable
                        ?.finalY ||
                    nextY
                ) + 12;


            if (
                sortedExpenses.length >
                0
            ) {
                if (
                    nextY >
                    175
                ) {
                    doc.addPage();

                    nextY =
                        20;
                }


                doc.setFontSize(
                    11
                );

                doc.setFont(
                    "helvetica",
                    "bold"
                );


                doc.text(
                    "Expenses",
                    14,
                    nextY
                );


                autoTable(
                    doc,
                    {
                        startY:
                            nextY +
                            5,

                        head: [
                            [
                                "Date",
                                "Category",
                                "Description",
                                "Vendor",
                                "Mode",
                                "Amount",
                            ],
                        ],

                        body:
                            sortedExpenses.map(
                                (
                                    expense
                                ) => [
                                        formatDate(
                                            expense.expenseDate
                                        ),

                                        expense.categoryName ||
                                        getCategoryName(
                                            expense.category
                                        ),

                                        expense.description ||
                                        "-",

                                        expense.vendorName ||
                                        "-",

                                        expense.paymentMode ||
                                        "-",

                                        formatPdfAmount(
                                            expense.amount
                                        ),
                                    ]
                            ),

                        styles: {
                            fontSize:
                                8,
                        },

                        headStyles: {
                            fillColor:
                                [
                                    234,
                                    88,
                                    12,
                                ],
                        },
                    }
                );
            }


            addPageNumbers(
                doc
            );


            doc.save(
                `${getPdfFilenamePrefix()}-financial-report.pdf`
            );
        };


    return (
        <div className="page-container">

            <div className="page-header report-page-header">

                <div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        {selectedEvent
                            ? `Financial reports for ${selectedEvent.name}`
                            : "Select an event to view reports"}
                    </p>

                </div>


                {selectedEventId &&
                    !loading && (
                        <button
                            type="button"
                            className="primary-button report-main-export-button"
                            onClick={
                                handleFullPdfExport
                            }
                            disabled={
                                sortedContributions.length ===
                                0 &&
                                sortedExpenses.length ===
                                0
                            }
                        >
                            Export Full PDF
                        </button>
                    )}

            </div>


            {!selectedEventId && (
                <div className="info-message">
                    Select an event to
                    generate reports.
                </div>
            )}


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {selectedEventId && (
                <>

                    <div className="report-filter-card">

                        <div className="report-filter-header">

                            <div>

                                <h2>
                                    Report Filters
                                </h2>

                                <p>
                                    Filters apply to totals,
                                    tables, charts and exports.
                                </p>

                            </div>

                        </div>


                        <div className="report-filter-grid">

                            <div className="report-filter-field">

                                <label>
                                    From Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        fromDate
                                    }
                                    max={
                                        toDate ||
                                        undefined
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setFromDate(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                            </div>


                            <div className="report-filter-field">

                                <label>
                                    To Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        toDate
                                    }
                                    min={
                                        fromDate ||
                                        undefined
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setToDate(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                            </div>


                            <div className="report-filter-field">

                                <label>
                                    Payment Mode
                                </label>

                                <select
                                    value={
                                        paymentModeFilter
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPaymentModeFilter(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    <option value="ALL">
                                        All Payment Modes
                                    </option>

                                    <option value="CASH">
                                        Cash
                                    </option>

                                    <option value="UPI">
                                        UPI
                                    </option>

                                    <option value="BANK">
                                        Bank
                                    </option>

                                </select>

                            </div>


                            <div className="report-filter-field">

                                <label>
                                    Expense Category
                                </label>

                                <select
                                    value={
                                        expenseCategoryFilter
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setExpenseCategoryFilter(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        loadingCategories
                                    }
                                >

                                    <option value="ALL">
                                        All Categories
                                    </option>


                                    {reportCategoryOptions.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category.code
                                                }
                                                value={
                                                    category.code
                                                }
                                            >
                                                {category.name}
                                                {category.active ===
                                                    false
                                                    ? " (Inactive)"
                                                    : ""}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>


                        {filtersActive && (
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>


                    {loading ? (
                        <p>
                            Loading report data...
                        </p>

                    ) : (
                        <>

                            <div className="report-summary-grid">

                                <div className="report-summary-card report-summary-success">

                                    <span>
                                        Total Collected
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            totalCollected
                                        )}
                                    </strong>

                                </div>


                                <div className="report-summary-card report-summary-expense">

                                    <span>
                                        Total Expenses
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            totalExpenses
                                        )}
                                    </strong>

                                </div>


                                <div className="report-summary-card report-summary-balance">

                                    <span>
                                        Net Balance
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            balance
                                        )}
                                    </strong>

                                </div>


                                <div className="report-summary-card">

                                    <span>
                                        Contributions
                                    </span>

                                    <strong>
                                        {
                                            sortedContributions.length
                                        }
                                    </strong>

                                </div>


                                <div className="report-summary-card">

                                    <span>
                                        Expenses
                                    </span>

                                    <strong>
                                        {
                                            sortedExpenses.length
                                        }
                                    </strong>

                                </div>

                            </div>


                            <h2 className="dashboard-section-title">
                                Expense Analysis
                            </h2>


                            <div className="report-category-grid">

                                <div className="report-section-card">

                                    <div className="report-section-header">

                                        <div>

                                            <h2>
                                                Expense by Category
                                            </h2>

                                            <p>
                                                Total spending grouped by expense category
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                handleExpenseCategoryCsvExport
                                            }
                                            disabled={
                                                expenseCategoryReport.length ===
                                                0
                                            }
                                        >
                                            Export CSV
                                        </button>

                                    </div>


                                    {expenseCategoryReport.length ===
                                        0 ? (
                                        <div className="chart-empty-state">
                                            No expense data matches
                                            the selected filters.
                                        </div>

                                    ) : (
                                        <div className="report-category-chart">

                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        expenseCategoryReport
                                                    }
                                                    layout="vertical"
                                                    margin={{
                                                        top: 5,
                                                        right: 25,
                                                        bottom: 5,
                                                        left: 20,
                                                    }}
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        horizontal={
                                                            false
                                                        }
                                                    />

                                                    <XAxis
                                                        type="number"
                                                        tickFormatter={
                                                            formatCompactCurrency
                                                        }
                                                        tickLine={
                                                            false
                                                        }
                                                        axisLine={
                                                            false
                                                        }
                                                    />

                                                    <YAxis
                                                        type="category"
                                                        dataKey="categoryName"
                                                        width={
                                                            115
                                                        }
                                                        tickLine={
                                                            false
                                                        }
                                                        axisLine={
                                                            false
                                                        }
                                                    />

                                                    <Tooltip
                                                        formatter={(
                                                            value
                                                        ) => [
                                                                formatCurrency(
                                                                    value
                                                                ),
                                                                "Expense",
                                                            ]}
                                                        labelFormatter={(
                                                            category
                                                        ) =>
                                                            category
                                                        }
                                                    />

                                                    <Bar
                                                        dataKey="totalExpense"
                                                        name="Expense"
                                                        fill="#ea580c"
                                                        radius={[
                                                            0,
                                                            6,
                                                            6,
                                                            0,
                                                        ]}
                                                    />

                                                </BarChart>
                                            </ResponsiveContainer>

                                        </div>
                                    )}

                                </div>


                                <div className="report-section-card">

                                    <div className="report-section-header">

                                        <div>

                                            <h2>
                                                Category Summary
                                            </h2>

                                            <p>
                                                Share of total event expenses
                                            </p>

                                        </div>

                                    </div>


                                    {expenseCategoryReport.length ===
                                        0 ? (
                                        <p>
                                            No expense category
                                            data available.
                                        </p>

                                    ) : (
                                        <div className="table-wrapper">

                                            <table className="category-report-table">

                                                <thead>
                                                    <tr>

                                                        <th>
                                                            Category
                                                        </th>

                                                        <th>
                                                            Entries
                                                        </th>

                                                        <th>
                                                            Total
                                                        </th>

                                                        <th>
                                                            Share
                                                        </th>

                                                    </tr>
                                                </thead>


                                                <tbody>

                                                    {expenseCategoryReport.map(
                                                        (
                                                            item
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    item.category
                                                                }
                                                            >

                                                                <td>
                                                                    <strong>
                                                                        {item.categoryName ||
                                                                            getCategoryName(
                                                                                item.category
                                                                            )}
                                                                    </strong>
                                                                </td>

                                                                <td>
                                                                    {
                                                                        item.expenseCount
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {formatCurrency(
                                                                        item.totalExpense
                                                                    )}
                                                                </td>

                                                                <td>

                                                                    <div className="category-percentage">

                                                                        <strong>
                                                                            {item.percentage.toFixed(
                                                                                1
                                                                            )}
                                                                            %
                                                                        </strong>


                                                                        <div className="category-percentage-track">

                                                                            <div
                                                                                className="category-percentage-fill"
                                                                                style={{
                                                                                    width: `${item.percentage}%`,
                                                                                }}
                                                                            />

                                                                        </div>

                                                                    </div>

                                                                </td>

                                                            </tr>
                                                        )
                                                    )}

                                                </tbody>


                                                <tfoot>
                                                    <tr>

                                                        <td>
                                                            <strong>
                                                                Total
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    sortedExpenses.length
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {formatCurrency(
                                                                    totalExpenses
                                                                )}
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {totalExpenses >
                                                                    0
                                                                    ? "100%"
                                                                    : "0%"}
                                                            </strong>
                                                        </td>

                                                    </tr>
                                                </tfoot>

                                            </table>

                                        </div>
                                    )}

                                </div>

                            </div>


                            {/* Contribution Report */}
                            <div className="report-section-card">

                                <div className="report-section-header">

                                    <div>

                                        <h2>
                                            Contribution Report
                                        </h2>

                                        <p>
                                            {
                                                sortedContributions.length
                                            }{" "}
                                            matching records
                                        </p>

                                    </div>


                                    <div className="report-export-actions">

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                handleContributionCsvExport
                                            }
                                            disabled={
                                                sortedContributions.length ===
                                                0
                                            }
                                        >
                                            CSV
                                        </button>


                                        <button
                                            type="button"
                                            className="primary-button report-export-button"
                                            onClick={
                                                handleContributionPdfExport
                                            }
                                            disabled={
                                                sortedContributions.length ===
                                                0
                                            }
                                        >
                                            PDF
                                        </button>

                                    </div>

                                </div>


                                {sortedContributions.length ===
                                    0 ? (
                                    <p>
                                        No contributions match
                                        the selected filters.
                                    </p>

                                ) : (
                                    <>

                                        <div className="table-wrapper">

                                            <table>

                                                <thead>
                                                    <tr>

                                                        <th>
                                                            Receipt
                                                        </th>

                                                        <th>
                                                            Date
                                                        </th>

                                                        <th>
                                                            Contributor
                                                        </th>

                                                        <th>
                                                            Address
                                                        </th>

                                                        <th>
                                                            Mode
                                                        </th>

                                                        <th>
                                                            Amount
                                                        </th>

                                                    </tr>
                                                </thead>


                                                <tbody>

                                                    {paginatedContributions.map(
                                                        (
                                                            contribution
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    contribution.id
                                                                }
                                                            >

                                                                <td>
                                                                    {
                                                                        contribution.receiptNumber
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {formatDate(
                                                                        contribution.paymentDate
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {
                                                                        contribution.contributorName
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        contribution.contributorAddress
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {
                                                                        contribution.paymentMode
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {formatCurrency(
                                                                        contribution.amountPaid
                                                                    )}
                                                                </td>

                                                            </tr>
                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>


                                        <Pagination
                                            currentPage={
                                                safeContributionPage
                                            }
                                            totalItems={
                                                sortedContributions.length
                                            }
                                            pageSize={
                                                contributionPageSize
                                            }
                                            onPageChange={
                                                setContributionPage
                                            }
                                            onPageSizeChange={
                                                handleContributionPageSizeChange
                                            }
                                        />

                                    </>
                                )}

                            </div>


                            {/* Expense Report */}
                            <div className="report-section-card">

                                <div className="report-section-header">

                                    <div>

                                        <h2>
                                            Expense Report
                                        </h2>

                                        <p>
                                            {
                                                sortedExpenses.length
                                            }{" "}
                                            matching records
                                        </p>

                                    </div>


                                    <div className="report-export-actions">

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                handleExpenseCsvExport
                                            }
                                            disabled={
                                                sortedExpenses.length ===
                                                0
                                            }
                                        >
                                            CSV
                                        </button>


                                        <button
                                            type="button"
                                            className="primary-button report-export-button"
                                            onClick={
                                                handleExpensePdfExport
                                            }
                                            disabled={
                                                sortedExpenses.length ===
                                                0
                                            }
                                        >
                                            PDF
                                        </button>

                                    </div>

                                </div>


                                {sortedExpenses.length ===
                                    0 ? (
                                    <p>
                                        No expenses match
                                        the selected filters.
                                    </p>

                                ) : (
                                    <>

                                        <div className="table-wrapper">

                                            <table>

                                                <thead>
                                                    <tr>

                                                        <th>
                                                            Date
                                                        </th>

                                                        <th>
                                                            Category
                                                        </th>

                                                        <th>
                                                            Description
                                                        </th>

                                                        <th>
                                                            Vendor
                                                        </th>

                                                        <th>
                                                            Mode
                                                        </th>

                                                        <th>
                                                            Amount
                                                        </th>

                                                    </tr>
                                                </thead>


                                                <tbody>

                                                    {paginatedExpenses.map(
                                                        (
                                                            expense
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    expense.id
                                                                }
                                                            >

                                                                <td>
                                                                    {formatDate(
                                                                        expense.expenseDate
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {expense.categoryName ||
                                                                        getCategoryName(
                                                                            expense.category
                                                                        )}
                                                                </td>

                                                                <td>
                                                                    {
                                                                        expense.description
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {expense.vendorName ||
                                                                        "-"}
                                                                </td>

                                                                <td>
                                                                    {
                                                                        expense.paymentMode
                                                                    }
                                                                </td>

                                                                <td>
                                                                    {formatCurrency(
                                                                        expense.amount
                                                                    )}
                                                                </td>

                                                            </tr>
                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>


                                        <Pagination
                                            currentPage={
                                                safeExpensePage
                                            }
                                            totalItems={
                                                sortedExpenses.length
                                            }
                                            pageSize={
                                                expensePageSize
                                            }
                                            onPageChange={
                                                setExpensePage
                                            }
                                            onPageSizeChange={
                                                handleExpensePageSizeChange
                                            }
                                        />

                                    </>
                                )}

                            </div>

                        </>
                    )}

                </>
            )}

        </div>
    );
};


export default Reports;