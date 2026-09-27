import { useEffect, useState } from "react";
import { getAllContributors } from "../api/contributorApi";

import {
    createContribution,
    deleteContribution,
    getContributionsByEvent,
    updateContribution,
} from "../api/contributionApi";

import { useEvent } from "../context/EventContext";

const AREA_OPTIONS = [
    "ITA",
    "ITB",
    "ITC",

    "MEA",
    "MEB",
    "MEC",
    "MED",
    "MEE",
    "MEF",
    "MEG",
    "MEH",
    "MEI",

    "CVA",
    "CVB",

    "PPA",
    "PPB",
    "PPC",
    "PPD",
    "PPE",
];

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

const Contributions = () => {
    const {
        selectedEventId,
        selectedEvent,
    } = useEvent();

    const [contributors, setContributors] =
        useState([]);

    const [contributions, setContributions] =
        useState([]);

    const [form, setForm] =
        useState(createEmptyForm());

    const [editingId, setEditingId] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [
        loadingContributions,
        setLoadingContributions,
    ] = useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [
        paymentModeFilter,
        setPaymentModeFilter,
    ] = useState("ALL");

    const [dateFilter, setDateFilter] =
        useState("");

    const [selectedAreas, setSelectedAreas] =
        useState([]);

    const [
        areaDropdownOpen,
        setAreaDropdownOpen,
    ] = useState(false);

    const [sortConfig, setSortConfig] =
        useState({
            key: "paymentDate",
            direction: "desc",
        });

    const eventReadOnly =
        selectedEvent?.status === "COMPLETED" ||
        selectedEvent?.status === "ARCHIVED";

    const loadContributions = async (
        eventId
    ) => {
        try {
            setLoadingContributions(true);
            setError("");

            const data =
                await getContributionsByEvent(
                    eventId
                );

            setContributions(data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load contributions"
            );
        } finally {
            setLoadingContributions(false);
        }
    };

    const resetForm = () => {
        setEditingId(null);

        setForm({
            ...createEmptyForm(),

            contributorId:
                contributors.length > 0
                    ? String(
                        contributors[0].id
                    )
                    : "",
        });
    };

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
                            (previous) => ({
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
                    console.error(err);

                    setError(
                        err.response?.data
                            ?.message ||
                        "Failed to load contributors"
                    );
                }
            };

        loadContributors();
    }, []);

    useEffect(() => {
        setEditingId(null);

        setForm((previous) => ({
            ...createEmptyForm(),

            contributorId:
                previous.contributorId,
        }));

        setSearchTerm("");
        setPaymentModeFilter("ALL");
        setDateFilter("");
        setSelectedAreas([]);
        setAreaDropdownOpen(false);

        setSortConfig({
            key: "paymentDate",
            direction: "desc",
        });

        if (!selectedEventId) {
            setContributions([]);
            return;
        }

        loadContributions(
            selectedEventId
        );
    }, [selectedEventId]);

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEdit = (
        contribution
    ) => {
        if (eventReadOnly) {
            return;
        }

        setError("");
        setEditingId(
            contribution.id
        );

        setForm({
            contributorId: String(
                contribution.contributorId
            ),

            receiptNumber:
                contribution.receiptNumber ||
                "",

            paymentDate:
                contribution.paymentDate ||
                "",

            paymentMode:
                contribution.paymentMode ||
                "CASH",

            amountPaid:
                contribution.amountPaid ??
                "",

            upiPaidTo:
                contribution.upiPaidTo ||
                "",

            paymentReference:
                contribution.paymentReference ||
                "",

            notes:
                contribution.notes || "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleCancelEdit = () => {
        setError("");
        resetForm();
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!selectedEventId) {
            setError(
                "Please select an event first"
            );

            return;
        }

        if (eventReadOnly) {
            setError(
                "Financial records cannot be modified for a completed or archived event"
            );

            return;
        }

        if (!form.contributorId) {
            setError(
                "Please select a contributor"
            );

            return;
        }

        try {
            setLoading(true);
            setError("");

            const request = {
                eventId: Number(
                    selectedEventId
                ),

                contributorId: Number(
                    form.contributorId
                ),

                receiptNumber:
                    form.receiptNumber,

                paymentDate:
                    form.paymentDate,

                paymentMode:
                    form.paymentMode,

                amountPaid: Number(
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
                    form.notes || null,
            };

            if (editingId !== null) {
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
            console.error(err);

            const message =
                err.response?.data
                    ?.message ||
                (editingId !== null
                    ? "Failed to update contribution"
                    : "Failed to create contribution");

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (
        id
    ) => {
        if (eventReadOnly) {
            setError(
                "Financial records cannot be modified for a completed or archived event"
            );

            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this contribution?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await deleteContribution(id);

            if (editingId === id) {
                resetForm();
            }

            await loadContributions(
                selectedEventId
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data
                    ?.message ||
                "Failed to delete contribution"
            );
        } finally {
            setDeletingId(null);
        }
    };

    const toggleAreaFilter = (
        area
    ) => {
        setSelectedAreas(
            (previous) => {
                if (
                    previous.includes(area)
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

    const getContributorArea = (
        contributorId
    ) => {
        const contributor =
            contributors.find(
                (item) =>
                    String(item.id) ===
                    String(
                        contributorId
                    )
            );

        return (
            contributor?.area || ""
        );
    };

    const handleSort = (key) => {
        setSortConfig(
            (previous) => {
                if (
                    previous.key === key
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
                    direction: "asc",
                };
            }
        );
    };

    const getSortIndicator = (
        key
    ) => {
        if (
            sortConfig.key !== key
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

    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();

    const filteredContributions =
        contributions.filter(
            (contribution) => {
                const contributorName =
                    contribution.contributorName
                        ?.toLowerCase() ||
                    "";

                const contributorAddress =
                    contribution.contributorAddress
                        ?.toLowerCase() ||
                    "";

                const receiptNumber =
                    contribution.receiptNumber
                        ?.toLowerCase() ||
                    "";

                const contributorArea =
                    getContributorArea(
                        contribution.contributorId
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
                    contribution.paymentMode ===
                    paymentModeFilter;

                const matchesDate =
                    !dateFilter ||
                    contribution.paymentDate ===
                    dateFilter;

                return (
                    matchesSearch &&
                    matchesArea &&
                    matchesPaymentMode &&
                    matchesDate
                );
            }
        );

    const sortedContributions = [
        ...filteredContributions,
    ].sort((a, b) => {
        let first;
        let second;

        if (
            sortConfig.key ===
            "amountPaid"
        ) {
            first = Number(
                a.amountPaid || 0
            );

            second = Number(
                b.amountPaid || 0
            );

            const comparison =
                first - second;

            return sortConfig.direction ===
                "asc"
                ? comparison
                : -comparison;
        }

        if (
            sortConfig.key ===
            "paymentDate"
        ) {
            first =
                a.paymentDate || "";

            second =
                b.paymentDate || "";

            const comparison =
                first.localeCompare(
                    second
                );

            return sortConfig.direction ===
                "asc"
                ? comparison
                : -comparison;
        }

        first =
            String(
                a[sortConfig.key] ??
                ""
            );

        second =
            String(
                b[sortConfig.key] ??
                ""
            );

        const comparison =
            first.localeCompare(
                second,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base",
                }
            );

        return sortConfig.direction ===
            "asc"
            ? comparison
            : -comparison;
    });

    const filteredTotalAmount =
        filteredContributions.reduce(
            (
                total,
                contribution
            ) =>
                total +
                Number(
                    contribution.amountPaid ||
                    0
                ),
            0
        );

    const clearFilters = () => {
        setSearchTerm("");
        setPaymentModeFilter("ALL");
        setDateFilter("");
        setSelectedAreas([]);
        setAreaDropdownOpen(false);
    };

    const filtersActive =
        searchTerm.trim() !== "" ||
        paymentModeFilter !== "ALL" ||
        dateFilter !== "" ||
        selectedAreas.length > 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>
                        Contributions
                    </h1>

                    <p>
                        {selectedEvent
                            ? `Manage collections for ${selectedEvent.name}`
                            : "Select an event to manage contributions"}
                    </p>
                </div>
            </div>

            {eventReadOnly && (
                <div className="info-message">
                    This event is{" "}
                    <strong>
                        {selectedEvent.status.toLowerCase()}
                    </strong>
                    . Financial records are
                    read-only.
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="form-card"
            >
                <h2>
                    {editingId !== null
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
                            required
                            disabled={
                                eventReadOnly
                            }
                        >
                            {contributors.length ===
                                0 ? (
                                <option value="">
                                    No contributors
                                    available
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
                                            {
                                                contributor.name
                                            }{" "}
                                            -{" "}
                                            {
                                                contributor.address
                                            }
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
                            placeholder="Receipt Number"
                            value={
                                form.receiptNumber
                            }
                            onChange={
                                handleChange
                            }
                            required
                            disabled={
                                eventReadOnly
                            }
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
                            required
                            disabled={
                                eventReadOnly
                            }
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
                            required
                            disabled={
                                eventReadOnly
                            }
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
                            placeholder="Amount Paid"
                            value={
                                form.amountPaid
                            }
                            onChange={
                                handleChange
                            }
                            min="0.01"
                            step="0.01"
                            required
                            disabled={
                                eventReadOnly
                            }
                        />
                    </div>

                    {form.paymentMode ===
                        "UPI" && (
                            <div className="form-field form-field-full">
                                <label>
                                    UPI Paid To
                                </label>

                                <input
                                    name="upiPaidTo"
                                    placeholder="UPI Paid To"
                                    value={
                                        form.upiPaidTo
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        eventReadOnly
                                    }
                                />
                            </div>
                        )}

                    <div className="form-field form-field-full">
                        <label>
                            Payment Reference
                        </label>

                        <input
                            name="paymentReference"
                            placeholder="UPI / Bank reference"
                            value={
                                form.paymentReference
                            }
                            onChange={
                                handleChange
                            }
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
                            placeholder="Notes"
                            value={
                                form.notes
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                eventReadOnly
                            }
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        className="primary-button"
                        type="submit"
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

                    {editingId !== null && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleCancelEdit
                            }
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

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
                        onChange={(
                            event
                        ) =>
                            setSearchTerm(
                                event.target
                                    .value
                            )
                        }
                    />

                    <div className="area-dropdown">
                        <button
                            type="button"
                            className="filter-dropdown-button"
                            onClick={() =>
                                setAreaDropdownOpen(
                                    (
                                        previous
                                    ) =>
                                        !previous
                                )
                            }
                        >
                            <span>
                                {selectedAreas.length >
                                    0
                                    ? `Areas (${selectedAreas.length})`
                                    : "Filter by Area"}
                            </span>

                            <span
                                className={
                                    areaDropdownOpen
                                        ? "dropdown-arrow open"
                                        : "dropdown-arrow"
                                }
                            >
                                ▾
                            </span>
                        </button>

                        {areaDropdownOpen && (
                            <div className="area-dropdown-menu">
                                <div className="area-dropdown-title">
                                    Select Areas
                                </div>

                                <div className="area-dropdown-options">
                                    {AREA_OPTIONS.map(
                                        (
                                            area
                                        ) => (
                                            <label
                                                key={
                                                    area
                                                }
                                                className="area-checkbox-option"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAreas.includes(
                                                        area
                                                    )}
                                                    onChange={() =>
                                                        toggleAreaFilter(
                                                            area
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {
                                                        area
                                                    }
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <select
                        className="filter-select"
                        value={
                            paymentModeFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setPaymentModeFilter(
                                event.target
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

                    <input
                        className="filter-date"
                        type="date"
                        value={
                            dateFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setDateFilter(
                                event.target
                                    .value
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
                                (area) => (
                                    <span
                                        key={
                                            area
                                        }
                                        className="selected-filter-chip"
                                    >
                                        {area}

                                        <button
                                            type="button"
                                            onClick={() =>
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
                        ₹
                        {filteredTotalAmount.toFixed(
                            2
                        )}
                    </strong>
                </div>

                {loadingContributions ? (
                    <p>
                        Loading contributions...
                    </p>
                ) : contributions.length ===
                    0 ? (
                    <p>
                        No contributions
                        recorded for this
                        event yet.
                    </p>
                ) : filteredContributions.length ===
                    0 ? (
                    <p>
                        No contributions
                        match the selected
                        filters.
                    </p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th
                                        className="sortable-header"
                                        onClick={() =>
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
                                        onClick={() =>
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
                                        onClick={() =>
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
                                        onClick={() =>
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
                                        onClick={() =>
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
                                        onClick={() =>
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

                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sortedContributions.map(
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
                                                ₹
                                                {
                                                    contribution.amountPaid
                                                }
                                            </td>

                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={() =>
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
                                                        onClick={() =>
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
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contributions;