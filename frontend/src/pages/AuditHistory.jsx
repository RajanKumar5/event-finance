import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getAuditLogs,
} from "../api/auditLogApi";

import Pagination from "../components/Pagination";

import "./AuditHistory.css";


const PAGE_SIZE = 10;


const ENTITY_OPTIONS = [
    "EVENT",
    "CONTRIBUTOR",
    "CONTRIBUTION",
    "EXPENSE",
];


const ACTION_OPTIONS = [
    "CREATE",
    "UPDATE",
    "DELETE",
];


const FIELD_LABELS = {
    id: "ID",

    name: "Name",

    eventId: "Event ID",
    eventName: "Event",

    eventType: "Event Type",

    startDate: "Start Date",
    endDate: "End Date",

    budget: "Budget",

    status: "Status",

    contributorId: "Contributor ID",
    contributorName: "Contributor",

    houseNumber: "House Number",

    areaId: "Area ID",
    areaCode: "Area Code",
    areaName: "Area",

    phone: "Phone",
    notes: "Notes",

    receiptNumber: "Receipt Number",

    paymentDate: "Payment Date",
    paymentMode: "Payment Mode",

    amountPaid: "Amount Paid",

    upiPaidTo: "UPI Paid To",

    paymentReference:
        "Payment Reference",

    categoryId: "Category ID",
    categoryCode: "Category Code",
    categoryName: "Category",

    description: "Description",

    vendorName: "Vendor",

    amount: "Amount",

    expenseDate: "Expense Date",

    paidBy: "Paid By",
};


const HIDDEN_FIELDS = new Set([
    "id",
    "eventId",
    "contributorId",
    "categoryId",
    "areaId",
]);


const parseJson = (
    value
) => {

    if (
        !value
    ) {
        return {};
    }


    try {

        return JSON.parse(
            value
        );

    } catch (error) {

        console.error(
            "Failed to parse audit JSON",
            error
        );

        return {};
    }
};


const formatFieldName = (
    field
) => {

    if (
        FIELD_LABELS[field]
    ) {
        return FIELD_LABELS[field];
    }


    return field
        .replace(
            /([A-Z])/g,
            " $1"
        )
        .replace(
            /^./,
            (
                character
            ) =>
                character
                    .toUpperCase()
        );
};


const formatEnum = (
    value
) => {

    if (
        typeof value !==
        "string"
    ) {
        return value;
    }


    return value
        .replaceAll(
            "_",
            " "
        );
};


const isAmountField = (
    field
) => {

    return [
        "amount",
        "amountPaid",
        "budget",
    ].includes(
        field
    );
};


const formatValue = (
    field,
    value
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "—";
    }


    if (
        isAmountField(
            field
        )
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isNaN(
                number
            )
        ) {

            return `₹${number.toLocaleString(
                "en-IN",
                {
                    maximumFractionDigits:
                        2,
                }
            )}`;
        }
    }


    if (
        typeof value ===
        "boolean"
    ) {

        return value
            ? "Yes"
            : "No";
    }


    if (
        typeof value ===
        "object"
    ) {

        return JSON.stringify(
            value
        );
    }


    return formatEnum(
        String(
            value
        )
    );
};


const formatDateTime = (
    value
) => {

    if (
        !value
    ) {
        return "—";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


const getChangedFields = (
    audit
) => {

    const oldValues =
        parseJson(
            audit.oldValues
        );

    const newValues =
        parseJson(
            audit.newValues
        );


    if (
        audit.action ===
        "CREATE"
    ) {

        return Object.keys(
            newValues
        )
            .filter(
                (
                    field
                ) =>
                    !HIDDEN_FIELDS
                        .has(
                            field
                        )
            )
            .map(
                (
                    field
                ) => ({
                    field,

                    oldValue:
                        null,

                    newValue:
                        newValues[
                        field
                        ],
                })
            );
    }


    if (
        audit.action ===
        "DELETE"
    ) {

        return Object.keys(
            oldValues
        )
            .filter(
                (
                    field
                ) =>
                    !HIDDEN_FIELDS
                        .has(
                            field
                        )
            )
            .map(
                (
                    field
                ) => ({
                    field,

                    oldValue:
                        oldValues[
                        field
                        ],

                    newValue:
                        null,
                })
            );
    }


    const fields =
        new Set([
            ...Object.keys(
                oldValues
            ),
            ...Object.keys(
                newValues
            ),
        ]);


    return Array.from(
        fields
    )
        .filter(
            (
                field
            ) => {

                if (
                    HIDDEN_FIELDS
                        .has(
                            field
                        )
                ) {
                    return false;
                }


                return JSON.stringify(
                    oldValues[
                    field
                    ]
                ) !==
                    JSON.stringify(
                        newValues[
                        field
                        ]
                    );
            }
        )
        .map(
            (
                field
            ) => ({
                field,

                oldValue:
                    oldValues[
                    field
                    ],

                newValue:
                    newValues[
                    field
                    ],
            })
        );
};


const getEntityDescription = (
    audit
) => {

    const values =
        audit.newValues
            ? parseJson(
                audit.newValues
            )
            : parseJson(
                audit.oldValues
            );


    switch (
    audit.entityType
    ) {

        case "EVENT":
            return values.name ||
                `Event #${audit.entityId}`;


        case "CONTRIBUTOR":
            return values.name ||
                `Contributor #${audit.entityId}`;


        case "CONTRIBUTION":

            if (
                values.receiptNumber
            ) {

                return `Receipt ${values.receiptNumber}`;
            }

            return `Contribution #${audit.entityId}`;


        case "EXPENSE":

            return values.description ||
                `Expense #${audit.entityId}`;


        default:

            return `${audit.entityType} #${audit.entityId}`;
    }
};


const AuditHistory = () => {

    const [
        auditLogs,
        setAuditLogs,
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
        entityFilter,
        setEntityFilter,
    ] = useState("ALL");


    const [
        actionFilter,
        setActionFilter,
    ] = useState("ALL");


    const [
        usernameFilter,
        setUsernameFilter,
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");


    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);


    const loadAuditLogs =
        async () => {

            try {

                setLoading(
                    true
                );

                setError("");


                const data =
                    await getAuditLogs();


                setAuditLogs(
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
                    "Failed to load audit history"
                );

            } finally {

                setLoading(
                    false
                );
            }
        };


    useEffect(
        () => {

            loadAuditLogs();

        },
        []
    );


    useEffect(
        () => {

            setCurrentPage(
                1
            );

        },
        [
            entityFilter,
            actionFilter,
            usernameFilter,
            searchTerm,
        ]
    );


    const usernames =
        useMemo(
            () => {

                return Array.from(
                    new Set(
                        auditLogs
                            .map(
                                (
                                    audit
                                ) =>
                                    audit.changedBy
                            )
                            .filter(
                                Boolean
                            )
                    )
                )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            first.localeCompare(
                                second
                            )
                    );

            },
            [
                auditLogs,
            ]
        );


    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();


    const filteredAuditLogs =
        useMemo(
            () => {

                return auditLogs
                    .filter(
                        (
                            audit
                        ) => {

                            const matchesEntity =
                                entityFilter ===
                                "ALL" ||
                                audit.entityType ===
                                entityFilter;


                            const matchesAction =
                                actionFilter ===
                                "ALL" ||
                                audit.action ===
                                actionFilter;


                            const matchesUsername =
                                !usernameFilter ||
                                audit.changedBy ===
                                usernameFilter;


                            const description =
                                getEntityDescription(
                                    audit
                                );


                            const matchesSearch =
                                !normalizedSearch ||

                                String(
                                    audit.entityId
                                )
                                    .toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    ) ||

                                audit.entityType
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    ) ||

                                audit.action
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    ) ||

                                audit.changedBy
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    ) ||

                                description
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedSearch
                                    );


                            return (
                                matchesEntity &&
                                matchesAction &&
                                matchesUsername &&
                                matchesSearch
                            );
                        }
                    );

            },
            [
                auditLogs,
                entityFilter,
                actionFilter,
                usernameFilter,
                normalizedSearch,
            ]
        );


    const totalPages =
        Math.max(
            1,

            Math.ceil(
                filteredAuditLogs.length /
                PAGE_SIZE
            )
        );


    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );


    const paginatedAuditLogs =
        filteredAuditLogs
            .slice(
                (
                    safeCurrentPage -
                    1
                ) *
                PAGE_SIZE,

                safeCurrentPage *
                PAGE_SIZE
            );


    const clearFilters =
        () => {

            setEntityFilter(
                "ALL"
            );

            setActionFilter(
                "ALL"
            );

            setUsernameFilter(
                ""
            );

            setSearchTerm(
                ""
            );
        };


    const filtersActive =
        entityFilter !==
        "ALL" ||
        actionFilter !==
        "ALL" ||
        usernameFilter !==
        "" ||
        searchTerm
            .trim() !==
        "";


    return (

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        Audit History
                    </h1>

                    <p>
                        Review changes made to events,
                        contributors, contributions and expenses.
                    </p>

                </div>


                <button
                    type="button"
                    className="secondary-button"
                    onClick={
                        loadAuditLogs
                    }
                    disabled={
                        loading
                    }
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </div>


            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            <div className="audit-summary-grid">

                <div className="audit-summary-card">

                    <span>
                        Total Changes
                    </span>

                    <strong>
                        {auditLogs.length}
                    </strong>

                </div>


                <div className="audit-summary-card">

                    <span>
                        Creates
                    </span>

                    <strong>
                        {
                            auditLogs.filter(
                                (
                                    audit
                                ) =>
                                    audit.action ===
                                    "CREATE"
                            ).length
                        }
                    </strong>

                </div>


                <div className="audit-summary-card">

                    <span>
                        Updates
                    </span>

                    <strong>
                        {
                            auditLogs.filter(
                                (
                                    audit
                                ) =>
                                    audit.action ===
                                    "UPDATE"
                            ).length
                        }
                    </strong>

                </div>


                <div className="audit-summary-card">

                    <span>
                        Deletes
                    </span>

                    <strong>
                        {
                            auditLogs.filter(
                                (
                                    audit
                                ) =>
                                    audit.action ===
                                    "DELETE"
                            ).length
                        }
                    </strong>

                </div>

            </div>


            <div className="table-card">

                <div className="audit-filter-toolbar">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search audit history"
                        value={
                            searchTerm
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setSearchTerm(
                                    event.target.value
                                )
                        }
                    />


                    <select
                        className="filter-select"
                        value={
                            entityFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setEntityFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="ALL">
                            All Entities
                        </option>


                        {ENTITY_OPTIONS.map(
                            (
                                entity
                            ) => (

                                <option
                                    key={
                                        entity
                                    }
                                    value={
                                        entity
                                    }
                                >
                                    {
                                        formatEnum(
                                            entity
                                        )
                                    }
                                </option>

                            )
                        )}

                    </select>


                    <select
                        className="filter-select"
                        value={
                            actionFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setActionFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="ALL">
                            All Actions
                        </option>


                        {ACTION_OPTIONS.map(
                            (
                                action
                            ) => (

                                <option
                                    key={
                                        action
                                    }
                                    value={
                                        action
                                    }
                                >
                                    {
                                        formatEnum(
                                            action
                                        )
                                    }
                                </option>

                            )
                        )}

                    </select>


                    <select
                        className="filter-select"
                        value={
                            usernameFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setUsernameFilter(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            All Users
                        </option>


                        {usernames.map(
                            (
                                username
                            ) => (

                                <option
                                    key={
                                        username
                                    }
                                    value={
                                        username
                                    }
                                >
                                    {username}
                                </option>

                            )
                        )}

                    </select>


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
                        Loading audit history...
                    </p>

                ) : filteredAuditLogs.length ===
                    0 ? (

                    <p>
                        No audit records match the selected filters.
                    </p>

                ) : (

                    <>
                        <div className="audit-list">

                            {paginatedAuditLogs.map(
                                (
                                    audit
                                ) => {

                                    const changes =
                                        getChangedFields(
                                            audit
                                        );


                                    return (

                                        <div
                                            className="audit-card"
                                            key={
                                                audit.id
                                            }
                                        >

                                            <div className="audit-card-header">

                                                <div>

                                                    <div className="audit-title-row">

                                                        <span
                                                            className={
                                                                `audit-action audit-action-${audit.action.toLowerCase()}`
                                                            }
                                                        >
                                                            {
                                                                audit.action
                                                            }
                                                        </span>


                                                        <strong>
                                                            {
                                                                getEntityDescription(
                                                                    audit
                                                                )
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div className="audit-meta">

                                                        <span>
                                                            {
                                                                formatEnum(
                                                                    audit.entityType
                                                                )
                                                            }
                                                            {" #"}
                                                            {
                                                                audit.entityId
                                                            }
                                                        </span>


                                                        <span>
                                                            Changed by{" "}
                                                            <strong>
                                                                {
                                                                    audit.changedBy
                                                                }
                                                            </strong>
                                                        </span>


                                                        <span>
                                                            {
                                                                formatDateTime(
                                                                    audit.changedAt
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>


                                            {changes.length ===
                                                0 ? (

                                                <p className="audit-no-changes">
                                                    No field-level changes detected.
                                                </p>

                                            ) : (

                                                <div className="audit-change-list">

                                                    {changes.map(
                                                        (
                                                            change
                                                        ) => (

                                                            <div
                                                                className="audit-change-row"
                                                                key={
                                                                    change.field
                                                                }
                                                            >

                                                                <div className="audit-field-name">
                                                                    {
                                                                        formatFieldName(
                                                                            change.field
                                                                        )
                                                                    }
                                                                </div>


                                                                {audit.action ===
                                                                    "UPDATE" ? (

                                                                    <div className="audit-value-change">

                                                                        <span className="audit-old-value">
                                                                            {
                                                                                formatValue(
                                                                                    change.field,
                                                                                    change.oldValue
                                                                                )
                                                                            }
                                                                        </span>

                                                                        <span className="audit-arrow">
                                                                            →
                                                                        </span>

                                                                        <span className="audit-new-value">
                                                                            {
                                                                                formatValue(
                                                                                    change.field,
                                                                                    change.newValue
                                                                                )
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                ) : audit.action ===
                                                                    "CREATE" ? (

                                                                    <div className="audit-new-value">
                                                                        {
                                                                            formatValue(
                                                                                change.field,
                                                                                change.newValue
                                                                            )
                                                                        }
                                                                    </div>

                                                                ) : (

                                                                    <div className="audit-old-value">
                                                                        {
                                                                            formatValue(
                                                                                change.field,
                                                                                change.oldValue
                                                                            )
                                                                        }
                                                                    </div>

                                                                )}

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    );
                                }
                            )}

                        </div>


                        {totalPages >
                            1 && (

                                <Pagination
                                    currentPage={
                                        safeCurrentPage
                                    }
                                    totalPages={
                                        totalPages
                                    }
                                    onPageChange={
                                        setCurrentPage
                                    }
                                />

                            )}

                    </>
                )}

            </div>

        </div>
    );
};


export default AuditHistory;