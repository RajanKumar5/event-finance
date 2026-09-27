import { useEffect, useState } from "react";

import {
    createContributor,
    deleteContributor,
    getAllContributors,
    updateContributor,
} from "../api/contributorApi";

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

const emptyForm = {
    name: "",
    houseNumber: "",
    area: "ITA",
    phone: "",
    notes: "",
};

const Contributors = () => {
    const [contributors, setContributors] =
        useState([]);

    const [form, setForm] =
        useState(emptyForm);

    const [editingId, setEditingId] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [selectedAreas, setSelectedAreas] =
        useState([]);

    const [
        areaDropdownOpen,
        setAreaDropdownOpen,
    ] = useState(false);

    const [sortConfig, setSortConfig] =
        useState({
            key: "name",
            direction: "asc",
        });

    const fetchContributors = async () => {
        try {
            setError("");

            const data =
                await getAllContributors();

            setContributors(data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load contributors"
            );
        }
    };

    useEffect(() => {
        fetchContributors();
    }, []);

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleEdit = (
        contributor
    ) => {
        setError("");

        setEditingId(
            contributor.id
        );

        setForm({
            name:
                contributor.name,

            houseNumber:
                contributor.houseNumber,

            area:
                contributor.area,

            phone:
                contributor.phone || "",

            notes:
                contributor.notes || "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleCancelEdit = () => {
        resetForm();
        setError("");
    };

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (editingId !== null) {
                await updateContributor(
                    editingId,
                    form
                );
            } else {
                await createContributor(
                    form
                );
            }

            resetForm();

            await fetchContributors();
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                (editingId !== null
                    ? "Failed to update contributor"
                    : "Failed to create contributor");

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (
        id
    ) => {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this contributor?"
            );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await deleteContributor(id);

            if (editingId === id) {
                resetForm();
            }

            await fetchContributors();
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "Failed to delete contributor";

            setError(message);
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

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedAreas([]);
        setAreaDropdownOpen(false);
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

    const filteredContributors =
        contributors.filter(
            (contributor) => {
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
                    contributor.houseNumber
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

                const matchesArea =
                    selectedAreas.length ===
                    0 ||
                    selectedAreas.includes(
                        contributor.area
                    );

                return (
                    matchesSearch &&
                    matchesArea
                );
            }
        );

    const sortedContributors = [
        ...filteredContributors,
    ].sort((a, b) => {
        const first =
            String(
                a[sortConfig.key] ??
                ""
            );

        const second =
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

    const filtersActive =
        searchTerm.trim() !== "" ||
        selectedAreas.length > 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>
                        Contributors
                    </h1>

                    <p>
                        Add and manage contributor details
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="form-card"
            >
                <h2>
                    {editingId !== null
                        ? "Edit Contributor"
                        : "Add Contributor"}
                </h2>

                <div className="form-grid">
                    <div className="form-field">
                        <label>
                            Name
                        </label>

                        <input
                            name="name"
                            placeholder="Name"
                            value={
                                form.name
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>
                            House Number
                        </label>

                        <input
                            name="houseNumber"
                            placeholder="House Number"
                            value={
                                form.houseNumber
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>
                            Area
                        </label>

                        <select
                            name="area"
                            value={
                                form.area
                            }
                            onChange={
                                handleChange
                            }
                            required
                        >
                            {AREA_OPTIONS.map(
                                (area) => (
                                    <option
                                        key={
                                            area
                                        }
                                        value={
                                            area
                                        }
                                    >
                                        {
                                            area
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>
                            Phone
                        </label>

                        <input
                            name="phone"
                            placeholder="Phone"
                            value={
                                form.phone
                            }
                            onChange={
                                handleChange
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
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        className="primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : editingId !==
                                null
                                ? "Update Contributor"
                                : "Add Contributor"}
                    </button>

                    {editingId !== null && (
                        <button
                            className="secondary-button"
                            type="button"
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
                    Contributor List
                </h2>

                <div className="contributor-filter-toolbar">
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search by name, address, area, house number or phone"
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

                    {filtersActive && (
                        <button
                            type="button"
                            className="secondary-button clear-filter-button"
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
                                            aria-label={`Remove ${area} filter`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                )
                            )}
                        </div>
                    )}

                {contributors.length ===
                    0 ? (
                    <p>
                        No contributors
                        available.
                    </p>
                ) : filteredContributors.length ===
                    0 ? (
                    <p>
                        No contributors match
                        the selected filters.
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
                                                "name"
                                            )
                                        }
                                    >
                                        Name
                                        {getSortIndicator(
                                            "name"
                                        )}
                                    </th>

                                    <th
                                        className="sortable-header"
                                        onClick={() =>
                                            handleSort(
                                                "address"
                                            )
                                        }
                                    >
                                        Address
                                        {getSortIndicator(
                                            "address"
                                        )}
                                    </th>

                                    <th
                                        className="sortable-header"
                                        onClick={() =>
                                            handleSort(
                                                "phone"
                                            )
                                        }
                                    >
                                        Phone
                                        {getSortIndicator(
                                            "phone"
                                        )}
                                    </th>

                                    <th>
                                        Notes
                                    </th>

                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sortedContributors.map(
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
                                                {contributor.notes ||
                                                    "-"}
                                            </td>

                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                contributor
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="danger-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                contributor.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            contributor.id
                                                        }
                                                    >
                                                        {deletingId ===
                                                            contributor.id
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

export default Contributors;