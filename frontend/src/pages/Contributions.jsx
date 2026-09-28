import { useEffect, useMemo, useState } from "react";

import { getAllContributors } from "../api/contributorApi";

import {
    createContribution,
    deleteContribution,
    getContributionsByEvent,
    updateContribution,
} from "../api/contributionApi";

import { getAreas } from "../api/masterDataApi";

import Pagination from "../components/Pagination";

import { useEvent } from "../context/EventContext";
import { useAuth } from "../context/AuthContext";


const createEmptyForm = () => ({
    contributorId: "",
    receiptNumber: "",
    paymentDate: new Date()
        .toISOString()
        .split("T")[0],
    paymentMode: "CASH",
    amountPaid: "",
    upiPaidTo: "",
    paymentReference: "",
    notes: "",
});


const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;


const Contributions = () => {
    const {
        canEdit,
    } = useAuth();

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
        areas,
        setAreas,
    ] = useState([]);


    const [
        form,
        setForm,
    ] = useState(
        createEmptyForm()
    );


    const [
        editingId,
        setEditingId,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        loadingContributions,
        setLoadingContributions,
    ] = useState(false);


    const [
        deletingId,
        setDeletingId,
    ] = useState(null);


    const [
        error,
        setError,
    ] = useState("");


    /*
     * Filters
     */
    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");


    const [
        paymentModeFilter,
        setPaymentModeFilter,
    ] = useState("ALL");


    const [
        dateFilter,
        setDateFilter,
    ] = useState("");


    const [
        selectedAreas,
        setSelectedAreas,
    ] = useState([]);


    const [
        areaDropdownOpen,
        setAreaDropdownOpen,
    ] = useState(false);


    /*
     * Sorting
     */
    const [
        sortConfig,
        setSortConfig,
    ] = useState({
        key: "paymentDate",
        direction: "desc",
    });


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


    /*
     * Completed and archived events
     * remain read-only even for ADMIN/EDITOR.
     */
    const eventReadOnly =
        selectedEvent?.status ===
        "COMPLETED" ||
        selectedEvent?.status ===
        "ARCHIVED";


    /*
     * Build available areas.
     *
     * Also preserve areas that may have
     * become inactive but are still used
     * by existing contributors.
     */
    const filterAreas = useMemo(() => {
        const areaMap =
            new Map();


        areas.forEach(
            (area) => {
                areaMap.set(
                    area.code,
                    area
                );
            }
        );


        contributors.forEach(
            (contributor) => {
                if (
                    !contributor.area ||
                    areaMap.has(
                        contributor.area
                    )
                ) {
                    return;
                }


                areaMap.set(
                    contributor.area,
                    {
                        code:
                            contributor.area,

                        name:
                            contributor.areaName ||
                            contributor.area,

                        active:
                            false,
                    }
                );
            }
        );


        return Array.from(
            areaMap.values()
        ).sort(
            (
                first,
                second
            ) =>
                first.name.localeCompare(
                    second.name
                )
        );
    }, [
        areas,
        contributors,
    ]);


    const getAreaDisplayName =
        (areaCode) => {
            const area =
                filterAreas.find(
                    (item) =>
                        item.code ===
                        areaCode
                );


            return (
                area?.name ||
                areaCode ||
                "-"
            );
        };


    const loadAreas =
        async () => {
            try {
                const data =
                    await getAreas(
                        false
                    );


                setAreas(
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
                    "Failed to load areas"
                );
            }
        };


    const loadContributions =
        async (eventId) => {
            try {
                setLoadingContributions(
                    true
                );

                setError("");


                const data =
                    await getContributionsByEvent(
                        eventId
                    );


                setContributions(
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
                    "Failed to load contributions"
                );
            } finally {
                setLoadingContributions(
                    false
                );
            }
        };


    const resetForm =
        () => {
            setEditingId(
                null
            );


            setForm({
                ...createEmptyForm(),

                contributorId:
                    contributors.length >
                        0
                        ? String(
                            contributors[0]
                                .id
                        )
                        : "",
            });
        };


    /*
     * Load contributors and areas
     * once when page loads.
     */
    useEffect(() => {
        const loadContributors =
            async () => {
                try {
                    const contributorData =
                        await getAllContributors();


                    setContributors(
                        contributorData
                    );


                    if (
                        contributorData.length >
                        0
                    ) {
                        setForm(
                            (
                                previous
                            ) => ({
                                ...previous,

                                contributorId:
                                    previous.contributorId ||
                                    String(
                                        contributorData[0]
                                            .id
                                    ),
                            })
                        );
                    }
                } catch (err) {
                    console.error(
                        err
                    );


                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load contributors"
                    );
                }
            };


        loadContributors();

        loadAreas();
    }, []);


    /*
     * Reload contributions whenever
     * selected event changes.
     */
    useEffect(() => {
        setEditingId(
            null
        );


        setForm(
            (
                previous
            ) => ({
                ...createEmptyForm(),

                contributorId:
                    previous.contributorId,
            })
        );


        setSearchTerm("");

        setPaymentModeFilter(
            "ALL"
        );

        setDateFilter("");

        setSelectedAreas([]);

        setAreaDropdownOpen(
            false
        );

        setCurrentPage(
            1
        );


        setSortConfig({
            key:
                "paymentDate",

            direction:
                "desc",
        });


        if (
            !selectedEventId
        ) {
            setContributions(
                []
            );

            return;
        }


        loadContributions(
            selectedEventId
        );
    }, [
        selectedEventId,
    ]);


    /*
     * Return to page 1 whenever
     * filters change.
     */
    useEffect(() => {
        setCurrentPage(
            1
        );
    }, [
        searchTerm,
        paymentModeFilter,
        dateFilter,
        selectedAreas,
    ]);


    const handleChange =
        (event) => {
            const {
                name,
                value,
            } =
                event.target;


            setForm(
                (
                    previous
                ) => ({
                    ...previous,

                    [name]:
                        value,
                })
            );
        };


    const handleEdit =
        (contribution) => {

            /*
             * UI should already hide this
             * for VIEWER, but this provides
             * an additional frontend guard.
             */
            if (
                !canEdit
            ) {
                setError(
                    "You have read-only access. You cannot add, edit, or delete records."
                );

                return;
            }


            if (
                eventReadOnly
            ) {
                return;
            }


            setError("");


            setEditingId(
                contribution.id
            );


            setForm({
                contributorId:
                    String(
                        contribution
                            .contributorId
                    ),

                receiptNumber:
                    contribution
                        .receiptNumber ||
                    "",

                paymentDate:
                    contribution
                        .paymentDate ||
                    "",

                paymentMode:
                    contribution
                        .paymentMode ||
                    "CASH",

                amountPaid:
                    contribution
                        .amountPaid ??
                    "",

                upiPaidTo:
                    contribution
                        .upiPaidTo ||
                    "",

                paymentReference:
                    contribution
                        .paymentReference ||
                    "",

                notes:
                    contribution
                        .notes ||
                    "",
            });


            window.scrollTo({
                top:
                    0,

                behavior:
                    "smooth",
            });
        };


    const handleCancelEdit =
        () => {
            setError("");

            resetForm();
        };


    const handleSubmit =
        async (event) => {
            event.preventDefault();


            if (
                !canEdit
            ) {
                setError(
                    "You have read-only access. You cannot add, edit, or delete records."
                );

                return;
            }


            if (
                !selectedEventId
            ) {
                setError(
                    "Please select an event first"
                );

                return;
            }


            if (
                eventReadOnly
            ) {
                setError(
                    "Financial records cannot be modified for a completed or archived event"
                );

                return;
            }


            if (
                !form.contributorId
            ) {
                setError(
                    "Please select a contributor"
                );

                return;
            }


            try {
                setLoading(
                    true
                );

                setError("");


                const request = {
                    eventId:
                        Number(
                            selectedEventId
                        ),

                    contributorId:
                        Number(
                            form.contributorId
                        ),

                    receiptNumber:
                        form.receiptNumber,

                    paymentDate:
                        form.paymentDate,

                    paymentMode:
                        form.paymentMode,

                    amountPaid:
                        Number(
                            form.amountPaid
                        ),

                    upiPaidTo:
                        form.paymentMode ===
                            "UPI"
                            ? form.upiPaidTo
                            : null,

                    paymentReference:
                        form.paymentReference ||
                        null,

                    notes:
                        form.notes ||
                        null,
                };


                if (
                    editingId !==
                    null
                ) {
                    await updateContribution(
                        editingId,
                        request
                    );
                } else {
                    await createContribution(
                        request
                    );
                }


                resetForm();


                await loadContributions(
                    selectedEventId
                );
            } catch (err) {
                console.error(
                    err
                );


                const message =
                    err.response
                        ?.data
                        ?.message ||
                    (
                        editingId !==
                            null
                            ? "Failed to update contribution"
                            : "Failed to create contribution"
                    );


                setError(
                    message
                );
            } finally {
                setLoading(
                    false
                );
            }
        };


    const handleDelete =
        async (id) => {

            /*
             * Additional VIEWER guard.
             */
            if (
                !canEdit
            ) {
                setError(
                    "You have read-only access. You cannot add, edit, or delete records."
                );

                return;
            }


            if (
                eventReadOnly
            ) {
                setError(
                    "Financial records cannot be modified for a completed or archived event"
                );

                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this contribution?"
                );


            if (
                !confirmed
            ) {
                return;
            }


            try {
                setDeletingId(
                    id
                );

                setError("");


                await deleteContribution(
                    id
                );


                if (
                    editingId ===
                    id
                ) {
                    resetForm();
                }


                await loadContributions(
                    selectedEventId
                );
            } catch (err) {
                console.error(
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Failed to delete contribution"
                );
            } finally {
                setDeletingId(
                    null
                );
            }
        };


    /*
     * Area filter
     */
    const toggleAreaFilter =
        (area) => {
            setSelectedAreas(
                (
                    previous
                ) => {
                    if (
                        previous.includes(
                            area
                        )
                    ) {
                        return previous.filter(
                            (
                                selectedArea
                            ) =>
                                selectedArea !==
                                area
                        );
                    }


                    return [
                        ...previous,
                        area,
                    ];
                }
            );
        };


    const getContributorArea =
        (contributorId) => {
            const contributor =
                contributors.find(
                    (item) =>
                        String(
                            item.id
                        ) ===
                        String(
                            contributorId
                        )
                );


            return (
                contributor?.area ||
                ""
            );
        };


    /*
     * Sorting
     */
    const handleSort =
        (key) => {
            setSortConfig(
                (
                    previous
                ) => {
                    if (
                        previous.key ===
                        key
                    ) {
                        return {
                            key,

                            direction:
                                previous.direction ===
                                    "asc"
                                    ? "desc"
                                    : "asc",
                        };
                    }


                    return {
                        key,

                        direction:
                            "asc",
                    };
                }
            );


            setCurrentPage(
                1
            );
        };


    const getSortIndicator =
        (key) => {
            if (
                sortConfig.key !==
                key
            ) {
                return null;
            }


            return (
                <span className="sort-indicator">
                    {sortConfig.direction ===
                        "asc"
                        ? "↑"
                        : "↓"}
                </span>
            );
        };


    /*
     * Filtering
     */
    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();


    const filteredContributions =
        contributions.filter(
            (
                contribution
            ) => {
                const contributorName =
                    contribution
                        .contributorName
                        ?.toLowerCase() ||
                    "";


                const contributorAddress =
                    contribution
                        .contributorAddress
                        ?.toLowerCase() ||
                    "";


                const receiptNumber =
                    contribution
                        .receiptNumber
                        ?.toLowerCase() ||
                    "";


                const contributorArea =
                    getContributorArea(
                        contribution
                            .contributorId
                    );


                const matchesSearch =
                    !normalizedSearch ||
                    contributorName.includes(
                        normalizedSearch
                    ) ||
                    contributorAddress.includes(
                        normalizedSearch
                    ) ||
                    receiptNumber.includes(
                        normalizedSearch
                    );


                const matchesArea =
                    selectedAreas.length ===
                    0 ||
                    selectedAreas.includes(
                        contributorArea
                    );


                const matchesPaymentMode =
                    paymentModeFilter ===
                    "ALL" ||
                    contribution
                        .paymentMode ===
                    paymentModeFilter;


                const matchesDate =
                    !dateFilter ||
                    contribution
                        .paymentDate ===
                    dateFilter;


                return (
                    matchesSearch &&
                    matchesArea &&
                    matchesPaymentMode &&
                    matchesDate
                );
            }
        );


    const filteredTotalAmount =
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


    /*
     * Sorting after filtering.
     */
    const sortedContributions =
        [
            ...filteredContributions,
        ].sort(
            (
                firstContribution,
                secondContribution
            ) => {
                const key =
                    sortConfig.key;


                let firstValue;

                let secondValue;


                if (
                    key ===
                    "amountPaid"
                ) {
                    firstValue =
                        Number(
                            firstContribution
                                .amountPaid ||
                            0
                        );


                    secondValue =
                        Number(
                            secondContribution
                                .amountPaid ||
                            0
                        );


                    const comparison =
                        firstValue -
                        secondValue;


                    return sortConfig.direction ===
                        "asc"
                        ? comparison
                        : -comparison;
                }


                if (
                    key ===
                    "paymentDate"
                ) {
                    firstValue =
                        firstContribution
                            .paymentDate ||
                        "";


                    secondValue =
                        secondContribution
                            .paymentDate ||
                        "";


                    const comparison =
                        firstValue.localeCompare(
                            secondValue
                        );


                    return sortConfig.direction ===
                        "asc"
                        ? comparison
                        : -comparison;
                }


                firstValue =
                    String(
                        firstContribution[
                        key
                        ] ??
                        ""
                    );


                secondValue =
                    String(
                        secondContribution[
                        key
                        ] ??
                        ""
                    );


                const comparison =
                    firstValue.localeCompare(
                        secondValue,
                        undefined,
                        {
                            numeric:
                                true,

                            sensitivity:
                                "base",
                        }
                    );


                return sortConfig.direction ===
                    "asc"
                    ? comparison
                    : -comparison;
            }
        );


    /*
     * Pagination after filtering + sorting.
     */
    const totalPages =
        Math.max(
            1,

            Math.ceil(
                sortedContributions.length /
                pageSize
            )
        );


    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );


    const startIndex =
        (
            safeCurrentPage -
            1
        ) *
        pageSize;


    const paginatedContributions =
        sortedContributions.slice(
            startIndex,

            startIndex +
            pageSize
        );


    const handlePageSizeChange =
        (
            newPageSize
        ) => {
            setPageSize(
                newPageSize
            );

            setCurrentPage(
                1
            );
        };


    const clearFilters =
        () => {
            setSearchTerm("");

            setPaymentModeFilter(
                "ALL"
            );

            setDateFilter("");

            setSelectedAreas([]);

            setAreaDropdownOpen(
                false
            );

            setCurrentPage(
                1
            );
        };


    const filtersActive =
        searchTerm.trim() !==
        "" ||
        paymentModeFilter !==
        "ALL" ||
        dateFilter !==
        "" ||
        selectedAreas.length >
        0;


    return (
        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        Contributions
                    </h1>


                    <p>
                        {selectedEvent
                            ? canEdit
                                ? `Manage collections for ${selectedEvent.name}`
                                : `View collections for ${selectedEvent.name}`
                            : canEdit
                                ? "Select an event to manage contributions"
                                : "Select an event to view contributions"}
                    </p>

                </div>

            </div>


            {/*
             * VIEWER message takes precedence.
             *
             * ADMIN / EDITOR still get the existing
             * completed / archived event message.
             */}
            {!canEdit ? (

                <div className="info-message">
                    You have read-only access. You can view contributions,
                    but you cannot add, edit, or delete records.
                </div>

            ) : eventReadOnly && (

                <div className="info-message">

                    This event is{" "}

                    <strong>
                        {selectedEvent.status.toLowerCase()}
                    </strong>

                    . Financial records are read-only.

                </div>
            )}


            {/*
             * Completely hide the contribution
             * form from VIEWER.
             *
             * ADMIN / EDITOR still see it.
             *
             * For completed/archived events the
             * existing disabled-field behaviour
             * remains intact.
             */}
            {canEdit && (

                <form
                    className="form-card"
                    onSubmit={
                        handleSubmit
                    }
                >

                    <h2>
                        {editingId !==
                            null
                            ? "Edit Contribution"
                            : "Add Contribution"}
                    </h2>


                    <div className="form-grid">

                        <div className="form-field form-field-full">

                            <label>
                                Contributor
                            </label>


                            <select
                                name="contributorId"
                                value={
                                    form.contributorId
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    eventReadOnly
                                }
                                required
                            >

                                {contributors.length ===
                                    0 ? (

                                    <option value="">
                                        No contributors available
                                    </option>

                                ) : (

                                    contributors.map(
                                        (
                                            contributor
                                        ) => (

                                            <option
                                                key={
                                                    contributor.id
                                                }
                                                value={
                                                    contributor.id
                                                }
                                            >
                                                {contributor.name}

                                                {" - "}

                                                {contributor.address}
                                            </option>
                                        )
                                    )
                                )}

                            </select>

                        </div>


                        <div className="form-field">

                            <label>
                                Receipt Number
                            </label>


                            <input
                                name="receiptNumber"
                                value={
                                    form.receiptNumber
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Receipt number"
                                disabled={
                                    eventReadOnly
                                }
                                required
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Payment Date
                            </label>


                            <input
                                type="date"
                                name="paymentDate"
                                value={
                                    form.paymentDate
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    eventReadOnly
                                }
                                required
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Payment Mode
                            </label>


                            <select
                                name="paymentMode"
                                value={
                                    form.paymentMode
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    eventReadOnly
                                }
                                required
                            >

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


                        <div className="form-field">

                            <label>
                                Amount Paid
                            </label>


                            <input
                                type="number"
                                name="amountPaid"
                                value={
                                    form.amountPaid
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Amount"
                                min="0.01"
                                step="0.01"
                                disabled={
                                    eventReadOnly
                                }
                                required
                            />

                        </div>


                        {form.paymentMode ===
                            "UPI" && (

                                <div className="form-field">

                                    <label>
                                        UPI Paid To
                                    </label>


                                    <input
                                        name="upiPaidTo"
                                        value={
                                            form.upiPaidTo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="UPI ID / account"
                                        disabled={
                                            eventReadOnly
                                        }
                                    />

                                </div>
                            )}


                        <div className="form-field">

                            <label>
                                Payment Reference
                            </label>


                            <input
                                name="paymentReference"
                                value={
                                    form.paymentReference
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Transaction reference"
                                disabled={
                                    eventReadOnly
                                }
                            />

                        </div>


                        <div className="form-field form-field-full">

                            <label>
                                Notes
                            </label>


                            <textarea
                                name="notes"
                                value={
                                    form.notes
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Additional details"
                                disabled={
                                    eventReadOnly
                                }
                            />

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={
                                loading ||
                                !selectedEventId ||
                                contributors.length ===
                                0 ||
                                eventReadOnly
                            }
                        >

                            {loading
                                ? "Saving..."
                                : editingId !==
                                    null
                                    ? "Update Contribution"
                                    : "Add Contribution"}

                        </button>


                        {editingId !==
                            null && (

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Cancel
                                </button>
                            )}

                    </div>

                </form>
            )}


            {error && (

                <div className="error-message">
                    {error}
                </div>
            )}


            <div className="table-card">

                <h2>
                    Contribution List
                </h2>


                <div className="filter-toolbar">

                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search contributor, address or receipt"
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


                    <div className="area-filter-dropdown">

                        <button
                            type="button"
                            className="filter-select area-filter-button"
                            onClick={
                                () =>
                                    setAreaDropdownOpen(
                                        (
                                            previous
                                        ) =>
                                            !previous
                                    )
                            }
                        >

                            {selectedAreas.length ===
                                0
                                ? "All Areas"
                                : `${selectedAreas.length} Area${selectedAreas.length >
                                    1
                                    ? "s"
                                    : ""
                                } Selected`}

                        </button>


                        {areaDropdownOpen && (

                            <div className="area-filter-menu">

                                {filterAreas.map(
                                    (
                                        area
                                    ) => (

                                        <label
                                            key={
                                                area.code
                                            }
                                            className="area-filter-option"
                                        >

                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedAreas.includes(
                                                        area.code
                                                    )
                                                }
                                                onChange={
                                                    () =>
                                                        toggleAreaFilter(
                                                            area.code
                                                        )
                                                }
                                            />


                                            <span>
                                                {area.name}

                                                {area.name !==
                                                    area.code
                                                    ? ` (${area.code})`
                                                    : ""}

                                                {area.active ===
                                                    false
                                                    ? " - Inactive"
                                                    : ""}
                                            </span>

                                        </label>
                                    )
                                )}

                            </div>
                        )}

                    </div>


                    <select
                        className="filter-select"
                        value={
                            paymentModeFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setPaymentModeFilter(
                                    event.target.value
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


                    <input
                        className="filter-date"
                        type="date"
                        value={
                            dateFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setDateFilter(
                                    event.target.value
                                )
                        }
                    />


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


                {selectedAreas.length >
                    0 && (

                        <div className="selected-filter-summary">

                            <span>
                                Areas:
                            </span>


                            {selectedAreas.map(
                                (
                                    area
                                ) => (

                                    <span
                                        key={
                                            area
                                        }
                                        className="selected-filter-chip"
                                    >

                                        {getAreaDisplayName(
                                            area
                                        )}


                                        <button
                                            type="button"
                                            onClick={
                                                () =>
                                                    toggleAreaFilter(
                                                        area
                                                    )
                                            }
                                        >
                                            ×
                                        </button>

                                    </span>
                                )
                            )}

                        </div>
                    )}


                <div className="filtered-summary-card">

                    <span>
                        Total Received
                    </span>


                    <strong>
                        {formatCurrency(
                            filteredTotalAmount
                        )}
                    </strong>


                    <span>
                        {
                            filteredContributions.length
                        }{" "}
                        record
                        {filteredContributions.length !==
                            1
                            ? "s"
                            : ""}
                    </span>

                </div>


                {loadingContributions ? (

                    <p>
                        Loading contributions...
                    </p>

                ) : contributions.length ===
                    0 ? (

                    <p>
                        No contributions recorded for this event yet.
                    </p>

                ) : filteredContributions.length ===
                    0 ? (

                    <p>
                        No contributions match the selected filters.
                    </p>

                ) : (

                    <>

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th
                                            className="sortable-header"
                                            onClick={
                                                () =>
                                                    handleSort(
                                                        "receiptNumber"
                                                    )
                                            }
                                        >
                                            Receipt

                                            {getSortIndicator(
                                                "receiptNumber"
                                            )}
                                        </th>


                                        <th
                                            className="sortable-header"
                                            onClick={
                                                () =>
                                                    handleSort(
                                                        "paymentDate"
                                                    )
                                            }
                                        >
                                            Date

                                            {getSortIndicator(
                                                "paymentDate"
                                            )}
                                        </th>


                                        <th
                                            className="sortable-header"
                                            onClick={
                                                () =>
                                                    handleSort(
                                                        "contributorName"
                                                    )
                                            }
                                        >
                                            Contributor

                                            {getSortIndicator(
                                                "contributorName"
                                            )}
                                        </th>


                                        <th
                                            className="sortable-header"
                                            onClick={
                                                () =>
                                                    handleSort(
                                                        "contributorAddress"
                                                    )
                                            }
                                        >
                                            Address

                                            {getSortIndicator(
                                                "contributorAddress"
                                            )}
                                        </th>


                                        <th
                                            className="sortable-header"
                                            onClick={
                                                () =>
                                                    handleSort(
                                                        "paymentMode"
                                                    )
                                            }
                                        >
                                            Mode

                                            {getSortIndicator(
                                                "paymentMode"
                                            )}
                                        </th>


                                        <th
                                            className="sortable-header"
                                            onClick={
                                                () =>
                                                    handleSort(
                                                        "amountPaid"
                                                    )
                                            }
                                        >
                                            Amount

                                            {getSortIndicator(
                                                "amountPaid"
                                            )}
                                        </th>


                                        {canEdit && (

                                            <th>
                                                Actions
                                            </th>
                                        )}

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
                                                    {
                                                        contribution.paymentDate
                                                    }
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


                                                {canEdit && (

                                                    <td>

                                                        <div className="table-actions">

                                                            <button
                                                                type="button"
                                                                className="secondary-button"
                                                                onClick={
                                                                    () =>
                                                                        handleEdit(
                                                                            contribution
                                                                        )
                                                                }
                                                                disabled={
                                                                    eventReadOnly
                                                                }
                                                            >
                                                                Edit
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="danger-button"
                                                                onClick={
                                                                    () =>
                                                                        handleDelete(
                                                                            contribution.id
                                                                        )
                                                                }
                                                                disabled={
                                                                    eventReadOnly ||
                                                                    deletingId ===
                                                                    contribution.id
                                                                }
                                                            >

                                                                {deletingId ===
                                                                    contribution.id
                                                                    ? "Deleting..."
                                                                    : "Delete"}

                                                            </button>

                                                        </div>

                                                    </td>
                                                )}

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
                                sortedContributions.length
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

        </div>
    );
};


export default Contributions;