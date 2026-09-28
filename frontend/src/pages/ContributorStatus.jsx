import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getAllContributors,
} from "../api/contributorApi";

import {
    getContributionsByEvent,
} from "../api/contributionApi";

import Pagination from "../components/Pagination";

import { useEvent } from "../context/EventContext";

import "./ContributorStatus.css";


const formatCurrency = (value) =>
    `₹${Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;


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


const ContributorStatus = () => {
    const {
        selectedEventId,
        selectedEvent,
    } = useEvent();


    const [
        contributors,
        setContributors,
    ] = useState([]);


    const [
        contributions,
        setContributions,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");


    /*
     * Pagination
     */
    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);


    const [
        pageSize,
        setPageSize,
    ] = useState(10);


    useEffect(() => {
        setSearchTerm("");

        setStatusFilter(
            "ALL"
        );

        setCurrentPage(1);


        if (
            !selectedEventId
        ) {
            setContributors(
                []
            );

            setContributions(
                []
            );

            return;
        }


        const loadData =
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError("");


                    const [
                        contributorData,
                        contributionData,
                    ] =
                        await Promise.all(
                            [
                                getAllContributors(),

                                getContributionsByEvent(
                                    selectedEventId
                                ),
                            ]
                        );


                    setContributors(
                        contributorData
                    );


                    setContributions(
                        contributionData
                    );

                } catch (err) {
                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load contributor status"
                    );

                } finally {
                    setLoading(
                        false
                    );
                }
            };


        loadData();

    }, [
        selectedEventId,
    ]);


    useEffect(() => {
        setCurrentPage(1);

    }, [
        searchTerm,
        statusFilter,
    ]);


    const contributorStatusData =
        useMemo(() => {
            const contributionMap =
                new Map();


            contributions.forEach(
                (
                    contribution
                ) => {
                    const contributorId =
                        String(
                            contribution
                                .contributorId
                        );


                    const existing =
                        contributionMap.get(
                            contributorId
                        ) || {
                            contributionCount:
                                0,

                            totalPaid:
                                0,
                        };


                    existing.contributionCount +=
                        1;


                    existing.totalPaid +=
                        Number(
                            contribution
                                .amountPaid ||
                            0
                        );


                    contributionMap.set(
                        contributorId,
                        existing
                    );
                }
            );


            return contributors.map(
                (
                    contributor
                ) => {
                    const summary =
                        contributionMap.get(
                            String(
                                contributor.id
                            )
                        ) || {
                            contributionCount:
                                0,

                            totalPaid:
                                0,
                        };


                    return {
                        id:
                            contributor.id,

                        name:
                            contributor.name,

                        address:
                            contributor.address,

                        area:
                            contributor.area,

                        houseNumber:
                            contributor.houseNumber,

                        phone:
                            contributor.phone,

                        contributionCount:
                            summary
                                .contributionCount,

                        totalPaid:
                            summary
                                .totalPaid,

                        status:
                            summary
                                .contributionCount >
                                0
                                ? "PAID"
                                : "NOT_PAID",
                    };
                }
            );

        }, [
            contributors,
            contributions,
        ]);


    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();


    const filteredData =
        useMemo(() => {
            return contributorStatusData.filter(
                (
                    contributor
                ) => {
                    const name =
                        contributor.name
                            ?.toLowerCase() ||
                        "";


                    const address =
                        contributor.address
                            ?.toLowerCase() ||
                        "";


                    const phone =
                        contributor.phone
                            ?.toLowerCase() ||
                        "";


                    const area =
                        contributor.area
                            ?.toLowerCase() ||
                        "";


                    const houseNumber =
                        contributor
                            .houseNumber
                            ?.toLowerCase() ||
                        "";


                    const matchesSearch =
                        !normalizedSearch ||
                        name.includes(
                            normalizedSearch
                        ) ||
                        address.includes(
                            normalizedSearch
                        ) ||
                        phone.includes(
                            normalizedSearch
                        ) ||
                        area.includes(
                            normalizedSearch
                        ) ||
                        houseNumber.includes(
                            normalizedSearch
                        );


                    const matchesStatus =
                        statusFilter ===
                        "ALL" ||
                        contributor.status ===
                        statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            contributorStatusData,
            normalizedSearch,
            statusFilter,
        ]);


    /*
     * Keep contributor status ordered
     * alphabetically.
     */
    const sortedData =
        useMemo(() => {
            return [
                ...filteredData,
            ].sort(
                (
                    first,
                    second
                ) =>
                    (
                        first.name ||
                        ""
                    ).localeCompare(
                        second.name ||
                        "",
                        undefined,
                        {
                            numeric:
                                true,

                            sensitivity:
                                "base",
                        }
                    )
            );

        }, [
            filteredData,
        ]);


    const paidCount =
        contributorStatusData.filter(
            (
                contributor
            ) =>
                contributor.status ===
                "PAID"
        ).length;


    const unpaidCount =
        contributorStatusData.length -
        paidCount;


    const totalCollected =
        contributorStatusData.reduce(
            (
                total,
                contributor
            ) =>
                total +
                Number(
                    contributor.totalPaid ||
                    0
                ),
            0
        );


    const filteredCollected =
        filteredData.reduce(
            (
                total,
                contributor
            ) =>
                total +
                Number(
                    contributor.totalPaid ||
                    0
                ),
            0
        );


    /*
     * Pagination
     */
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                sortedData.length /
                pageSize
            )
        );


    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );


    const startIndex =
        (safeCurrentPage - 1) *
        pageSize;


    const paginatedData =
        sortedData.slice(
            startIndex,
            startIndex +
            pageSize
        );


    const handlePageSizeChange =
        (newPageSize) => {
            setPageSize(
                newPageSize
            );

            setCurrentPage(1);
        };


    const clearFilters = () => {
        setSearchTerm("");

        setStatusFilter(
            "ALL"
        );

        setCurrentPage(1);
    };


    const handleExportCsv = () => {
        if (
            filteredData.length ===
            0
        ) {
            return;
        }


        /*
         * Export filteredData,
         * NOT paginatedData.
         *
         * This means CSV contains all
         * matching contributors.
         */
        const rows =
            sortedData.map(
                (
                    contributor
                ) => [
                        contributor.name,

                        contributor.area ||
                        "",

                        contributor.houseNumber ||
                        "",

                        contributor.address ||
                        "",

                        contributor.phone ||
                        "",

                        contributor
                            .contributionCount,

                        contributor
                            .totalPaid,

                        contributor.status ===
                            "PAID"
                            ? "Contributed"
                            : "Not Contributed",
                    ]
            );


        downloadCsv(
            `${sanitizeFilename(
                selectedEvent?.name
            )}-contributor-status.csv`,

            [
                "Contributor",
                "Area",
                "House Number",
                "Address",
                "Phone",
                "Contribution Count",
                "Total Paid",
                "Status",
            ],

            rows
        );
    };


    return (
        <div className="page-container">

            <div className="page-header">
                <div>

                    <h1>
                        Contributor Status
                    </h1>

                    <p>
                        {selectedEvent
                            ? `Track contributor participation for ${selectedEvent.name}`
                            : "Select an event to view contributor status"}
                    </p>

                </div>
            </div>


            {!selectedEventId && (
                <div className="info-message">
                    Select an event to view
                    contributor collection
                    status.
                </div>
            )}


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {loading && (
                <p>
                    Loading contributor
                    status...
                </p>
            )}


            {selectedEventId &&
                !loading && (
                    <>

                        <div className="contributor-status-summary">

                            <div className="contributor-status-card">

                                <span>
                                    Total Contributors
                                </span>

                                <strong>
                                    {
                                        contributorStatusData.length
                                    }
                                </strong>

                            </div>


                            <div className="contributor-status-card status-paid-card">

                                <span>
                                    Contributed
                                </span>

                                <strong>
                                    {
                                        paidCount
                                    }
                                </strong>

                            </div>


                            <div className="contributor-status-card status-unpaid-card">

                                <span>
                                    Not Contributed
                                </span>

                                <strong>
                                    {
                                        unpaidCount
                                    }
                                </strong>

                            </div>


                            <div className="contributor-status-card">

                                <span>
                                    Total Collected
                                </span>

                                <strong>
                                    {formatCurrency(
                                        totalCollected
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div className="table-card">

                            <div className="contributor-status-toolbar">

                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search name, address, area, house number or phone"
                                    value={
                                        searchTerm
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearchTerm(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />


                                <select
                                    className="filter-select"
                                    value={
                                        statusFilter
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setStatusFilter(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >

                                    <option value="ALL">
                                        All Status
                                    </option>

                                    <option value="PAID">
                                        Contributed
                                    </option>

                                    <option value="NOT_PAID">
                                        Not Contributed
                                    </option>

                                </select>


                                {(searchTerm ||
                                    statusFilter !==
                                    "ALL") && (
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            Clear
                                        </button>
                                    )}


                                <button
                                    type="button"
                                    className="primary-button contributor-export-button"
                                    onClick={
                                        handleExportCsv
                                    }
                                    disabled={
                                        filteredData.length ===
                                        0
                                    }
                                >
                                    Export CSV
                                </button>

                            </div>


                            <div className="contributor-status-result-count">

                                Showing{" "}

                                <strong>
                                    {
                                        filteredData.length
                                    }
                                </strong>

                                {" "}of{" "}

                                <strong>
                                    {
                                        contributorStatusData.length
                                    }
                                </strong>

                                {" "}contributors

                                {" • "}

                                Filtered collection:{" "}

                                <strong>
                                    {formatCurrency(
                                        filteredCollected
                                    )}
                                </strong>

                            </div>


                            {filteredData.length ===
                                0 ? (
                                <p>
                                    No contributors
                                    match the selected
                                    filters.
                                </p>

                            ) : (
                                <>

                                    <div className="table-wrapper">

                                        <table>

                                            <thead>
                                                <tr>

                                                    <th>
                                                        Contributor
                                                    </th>

                                                    <th>
                                                        Address
                                                    </th>

                                                    <th>
                                                        Phone
                                                    </th>

                                                    <th>
                                                        Contributions
                                                    </th>

                                                    <th>
                                                        Total Paid
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                </tr>
                                            </thead>


                                            <tbody>

                                                {paginatedData.map(
                                                    (
                                                        contributor
                                                    ) => (
                                                        <tr
                                                            key={
                                                                contributor.id
                                                            }
                                                        >

                                                            <td>
                                                                {
                                                                    contributor.name
                                                                }
                                                            </td>


                                                            <td>
                                                                {
                                                                    contributor.address
                                                                }
                                                            </td>


                                                            <td>
                                                                {contributor.phone ||
                                                                    "-"}
                                                            </td>


                                                            <td>
                                                                {
                                                                    contributor.contributionCount
                                                                }
                                                            </td>


                                                            <td>
                                                                {formatCurrency(
                                                                    contributor.totalPaid
                                                                )}
                                                            </td>


                                                            <td>

                                                                <span
                                                                    className={
                                                                        contributor.status ===
                                                                            "PAID"
                                                                            ? "contribution-status-badge contribution-status-paid"
                                                                            : "contribution-status-badge contribution-status-unpaid"
                                                                    }
                                                                >
                                                                    {contributor.status ===
                                                                        "PAID"
                                                                        ? "Contributed"
                                                                        : "Not Contributed"}
                                                                </span>

                                                            </td>

                                                        </tr>
                                                    )
                                                )}

                                            </tbody>

                                        </table>

                                    </div>


                                    <Pagination
                                        currentPage={
                                            safeCurrentPage
                                        }
                                        totalItems={
                                            sortedData.length
                                        }
                                        pageSize={
                                            pageSize
                                        }
                                        onPageChange={
                                            setCurrentPage
                                        }
                                        onPageSizeChange={
                                            handlePageSizeChange
                                        }
                                    />

                                </>
                            )}

                        </div>

                    </>
                )}

        </div>
    );
};


export default ContributorStatus;