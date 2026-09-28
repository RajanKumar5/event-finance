import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    createArea,
    createExpenseCategory,
    getAreas,
    getExpenseCategories,
    updateArea,
    updateAreaStatus,
    updateExpenseCategory,
    updateExpenseCategoryStatus,
} from "../api/masterDataApi";

import "./Settings.css";


const createEmptyForm = () => ({
    code: "",
    name: "",
    active: true,
});


const Settings = () => {

    /*
     * =========================
     * Expense Category State
     * =========================
     */

    const [
        expenseCategories,
        setExpenseCategories,
    ] = useState([]);


    const [
        categoryForm,
        setCategoryForm,
    ] = useState(
        createEmptyForm()
    );


    const [
        editingCategoryId,
        setEditingCategoryId,
    ] = useState(null);


    const [
        loadingCategory,
        setLoadingCategory,
    ] = useState(false);


    const [
        loadingCategories,
        setLoadingCategories,
    ] = useState(false);


    const [
        categoryStatusUpdatingId,
        setCategoryStatusUpdatingId,
    ] = useState(null);


    const [
        categorySearchTerm,
        setCategorySearchTerm,
    ] = useState("");


    const [
        categoryStatusFilter,
        setCategoryStatusFilter,
    ] = useState("ALL");


    /*
     * =========================
     * Area State
     * =========================
     */

    const [
        areas,
        setAreas,
    ] = useState([]);


    const [
        areaForm,
        setAreaForm,
    ] = useState(
        createEmptyForm()
    );


    const [
        editingAreaId,
        setEditingAreaId,
    ] = useState(null);


    const [
        loadingArea,
        setLoadingArea,
    ] = useState(false);


    const [
        loadingAreas,
        setLoadingAreas,
    ] = useState(false);


    const [
        areaStatusUpdatingId,
        setAreaStatusUpdatingId,
    ] = useState(null);


    const [
        areaSearchTerm,
        setAreaSearchTerm,
    ] = useState("");


    const [
        areaStatusFilter,
        setAreaStatusFilter,
    ] = useState("ALL");


    /*
     * =========================
     * Shared Message State
     * =========================
     */

    const [
        error,
        setError,
    ] = useState("");


    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");


    /*
     * =========================
     * Data Loading
     * =========================
     */

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


    const loadAreas =
        async () => {

            try {

                setLoadingAreas(
                    true
                );


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

            } finally {

                setLoadingAreas(
                    false
                );
            }
        };


    useEffect(() => {

        const loadMasterData =
            async () => {

                setError("");


                await Promise.all([
                    loadExpenseCategories(),
                    loadAreas(),
                ]);
            };


        loadMasterData();

    }, []);


    /*
     * =========================
     * Helpers
     * =========================
     */

    const normalizeCode = (
        value
    ) => {

        return value
            .trim()
            .toUpperCase()
            .replace(
                /\s+/g,
                "_"
            )
            .replace(
                /[^A-Z0-9_]/g,
                ""
            );
    };


    const resetCategoryForm =
        () => {

            setCategoryForm(
                createEmptyForm()
            );

            setEditingCategoryId(
                null
            );
        };


    const resetAreaForm =
        () => {

            setAreaForm(
                createEmptyForm()
            );

            setEditingAreaId(
                null
            );
        };


    /*
     * =========================
     * Expense Category Handlers
     * =========================
     */

    const handleCategoryChange =
        (event) => {

            const {
                name,
                value,
                type,
                checked,
            } =
                event.target;


            setCategoryForm(
                (previous) => ({
                    ...previous,

                    [name]:
                        type ===
                            "checkbox"
                            ? checked
                            : value,
                })
            );
        };


    const handleCategoryCodeChange =
        (event) => {

            const normalized =
                normalizeCode(
                    event.target
                        .value
                );


            setCategoryForm(
                (previous) => ({
                    ...previous,

                    code:
                        normalized,
                })
            );
        };


    const handleCategoryEdit =
        (category) => {

            setError("");

            setSuccessMessage("");


            setEditingCategoryId(
                category.id
            );


            setCategoryForm({
                code:
                    category.code,

                name:
                    category.name,

                active:
                    category.active,
            });


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        };


    const handleCategoryCancelEdit =
        () => {

            setError("");

            setSuccessMessage("");

            resetCategoryForm();
        };


    const handleCategorySubmit =
        async (event) => {

            event.preventDefault();


            if (
                !categoryForm.code
                    .trim()
            ) {

                setError(
                    "Category code is required"
                );

                return;
            }


            if (
                !categoryForm.name
                    .trim()
            ) {

                setError(
                    "Category name is required"
                );

                return;
            }


            try {

                setLoadingCategory(
                    true
                );

                setError("");

                setSuccessMessage("");


                const request = {
                    code:
                        categoryForm
                            .code
                            .trim(),

                    name:
                        categoryForm
                            .name
                            .trim(),

                    active:
                        categoryForm
                            .active,
                };


                if (
                    editingCategoryId !==
                    null
                ) {

                    await updateExpenseCategory(
                        editingCategoryId,
                        request
                    );


                    setSuccessMessage(
                        "Expense category updated successfully"
                    );

                } else {

                    await createExpenseCategory(
                        request
                    );


                    setSuccessMessage(
                        "Expense category created successfully"
                    );
                }


                resetCategoryForm();


                await loadExpenseCategories();

            } catch (err) {

                console.error(
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    (
                        editingCategoryId !==
                            null
                            ? "Failed to update expense category"
                            : "Failed to create expense category"
                    )
                );

            } finally {

                setLoadingCategory(
                    false
                );
            }
        };


    const handleCategoryToggleStatus =
        async (
            category
        ) => {

            const nextStatus =
                !category.active;


            const actionText =
                nextStatus
                    ? "activate"
                    : "deactivate";


            const shouldContinue =
                window.confirm(
                    `Are you sure you want to ${actionText} "${category.name}"?`
                );


            if (
                !shouldContinue
            ) {
                return;
            }


            try {

                setCategoryStatusUpdatingId(
                    category.id
                );

                setError("");

                setSuccessMessage("");


                await updateExpenseCategoryStatus(
                    category.id,
                    nextStatus
                );


                setSuccessMessage(
                    `Expense category ${nextStatus
                        ? "activated"
                        : "deactivated"
                    } successfully`
                );


                await loadExpenseCategories();

            } catch (err) {

                console.error(
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Failed to update expense category status"
                );

            } finally {

                setCategoryStatusUpdatingId(
                    null
                );
            }
        };


    /*
     * =========================
     * Area Handlers
     * =========================
     */

    const handleAreaChange =
        (event) => {

            const {
                name,
                value,
                type,
                checked,
            } =
                event.target;


            setAreaForm(
                (previous) => ({
                    ...previous,

                    [name]:
                        type ===
                            "checkbox"
                            ? checked
                            : value,
                })
            );
        };


    const handleAreaCodeChange =
        (event) => {

            const normalized =
                normalizeCode(
                    event.target
                        .value
                );


            setAreaForm(
                (previous) => ({
                    ...previous,

                    code:
                        normalized,
                })
            );
        };


    const handleAreaEdit =
        (area) => {

            setError("");

            setSuccessMessage("");


            setEditingAreaId(
                area.id
            );


            setAreaForm({
                code:
                    area.code,

                name:
                    area.name,

                active:
                    area.active,
            });


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        };


    const handleAreaCancelEdit =
        () => {

            setError("");

            setSuccessMessage("");

            resetAreaForm();
        };


    const handleAreaSubmit =
        async (event) => {

            event.preventDefault();


            if (
                !areaForm.code
                    .trim()
            ) {

                setError(
                    "Area code is required"
                );

                return;
            }


            if (
                !areaForm.name
                    .trim()
            ) {

                setError(
                    "Area name is required"
                );

                return;
            }


            try {

                setLoadingArea(
                    true
                );

                setError("");

                setSuccessMessage("");


                const request = {
                    code:
                        areaForm
                            .code
                            .trim(),

                    name:
                        areaForm
                            .name
                            .trim(),

                    active:
                        areaForm
                            .active,
                };


                if (
                    editingAreaId !==
                    null
                ) {

                    await updateArea(
                        editingAreaId,
                        request
                    );


                    setSuccessMessage(
                        "Area updated successfully"
                    );

                } else {

                    await createArea(
                        request
                    );


                    setSuccessMessage(
                        "Area created successfully"
                    );
                }


                resetAreaForm();


                await loadAreas();

            } catch (err) {

                console.error(
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    (
                        editingAreaId !==
                            null
                            ? "Failed to update area"
                            : "Failed to create area"
                    )
                );

            } finally {

                setLoadingArea(
                    false
                );
            }
        };


    const handleAreaToggleStatus =
        async (
            area
        ) => {

            const nextStatus =
                !area.active;


            const actionText =
                nextStatus
                    ? "activate"
                    : "deactivate";


            const shouldContinue =
                window.confirm(
                    `Are you sure you want to ${actionText} "${area.name}"?`
                );


            if (
                !shouldContinue
            ) {
                return;
            }


            try {

                setAreaStatusUpdatingId(
                    area.id
                );

                setError("");

                setSuccessMessage("");


                await updateAreaStatus(
                    area.id,
                    nextStatus
                );


                setSuccessMessage(
                    `Area ${nextStatus
                        ? "activated"
                        : "deactivated"
                    } successfully`
                );


                await loadAreas();

            } catch (err) {

                console.error(
                    err
                );


                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Failed to update area status"
                );

            } finally {

                setAreaStatusUpdatingId(
                    null
                );
            }
        };


    /*
     * =========================
     * Expense Category Filtering
     * =========================
     */

    const normalizedCategorySearch =
        categorySearchTerm
            .trim()
            .toLowerCase();


    const filteredCategories =
        useMemo(
            () => {

                return expenseCategories
                    .filter(
                        (
                            category
                        ) => {

                            const matchesSearch =
                                !normalizedCategorySearch ||

                                category.code
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedCategorySearch
                                    ) ||

                                category.name
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedCategorySearch
                                    );


                            const matchesStatus =
                                categoryStatusFilter ===
                                "ALL" ||

                                (
                                    categoryStatusFilter ===
                                    "ACTIVE" &&
                                    category.active
                                ) ||

                                (
                                    categoryStatusFilter ===
                                    "INACTIVE" &&
                                    !category.active
                                );


                            return (
                                matchesSearch &&
                                matchesStatus
                            );
                        }
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            first.name
                                .localeCompare(
                                    second.name
                                )
                    );

            },
            [
                expenseCategories,
                normalizedCategorySearch,
                categoryStatusFilter,
            ]
        );


    /*
     * =========================
     * Area Filtering
     * =========================
     */

    const normalizedAreaSearch =
        areaSearchTerm
            .trim()
            .toLowerCase();


    const filteredAreas =
        useMemo(
            () => {

                return areas
                    .filter(
                        (
                            area
                        ) => {

                            const matchesSearch =
                                !normalizedAreaSearch ||

                                area.code
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedAreaSearch
                                    ) ||

                                area.name
                                    ?.toLowerCase()
                                    .includes(
                                        normalizedAreaSearch
                                    );


                            const matchesStatus =
                                areaStatusFilter ===
                                "ALL" ||

                                (
                                    areaStatusFilter ===
                                    "ACTIVE" &&
                                    area.active
                                ) ||

                                (
                                    areaStatusFilter ===
                                    "INACTIVE" &&
                                    !area.active
                                );


                            return (
                                matchesSearch &&
                                matchesStatus
                            );
                        }
                    )
                    .sort(
                        (
                            first,
                            second
                        ) =>
                            first.name
                                .localeCompare(
                                    second.name
                                )
                    );

            },
            [
                areas,
                normalizedAreaSearch,
                areaStatusFilter,
            ]
        );


    /*
     * =========================
     * Counts
     * =========================
     */

    const activeCategoryCount =
        expenseCategories.filter(
            (
                category
            ) =>
                category.active
        ).length;


    const inactiveCategoryCount =
        expenseCategories.length -
        activeCategoryCount;


    const activeAreaCount =
        areas.filter(
            (
                area
            ) =>
                area.active
        ).length;


    const inactiveAreaCount =
        areas.length -
        activeAreaCount;


    const categoryFiltersActive =
        categorySearchTerm
            .trim() !==
        "" ||

        categoryStatusFilter !==
        "ALL";


    const areaFiltersActive =
        areaSearchTerm
            .trim() !==
        "" ||

        areaStatusFilter !==
        "ALL";


    const clearCategoryFilters =
        () => {

            setCategorySearchTerm(
                ""
            );

            setCategoryStatusFilter(
                "ALL"
            );
        };


    const clearAreaFilters =
        () => {

            setAreaSearchTerm(
                ""
            );

            setAreaStatusFilter(
                "ALL"
            );
        };


    return (

        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        Settings
                    </h1>

                    <p>
                        Manage application master data
                    </p>

                </div>

            </div>


            {error && (

                <div className="error-message">
                    {error}
                </div>
            )}


            {successMessage && (

                <div className="success-message">
                    {successMessage}
                </div>
            )}


            {/* =========================
                Expense Categories
               ========================= */}

            <div className="settings-section-header">

                <div>

                    <h2>
                        Expense Categories
                    </h2>

                    <p>
                        Manage categories available when recording expenses.
                    </p>

                </div>

            </div>


            <div className="settings-summary-grid">

                <div className="settings-summary-card">

                    <span>
                        Total Categories
                    </span>

                    <strong>
                        {
                            expenseCategories.length
                        }
                    </strong>

                </div>


                <div className="settings-summary-card">

                    <span>
                        Active
                    </span>

                    <strong>
                        {
                            activeCategoryCount
                        }
                    </strong>

                </div>


                <div className="settings-summary-card">

                    <span>
                        Inactive
                    </span>

                    <strong>
                        {
                            inactiveCategoryCount
                        }
                    </strong>

                </div>

            </div>


            <form
                className="form-card"
                onSubmit={
                    handleCategorySubmit
                }
            >

                <div className="settings-section-header">

                    <div>

                        <h2>

                            {editingCategoryId !==
                                null
                                ? "Edit Expense Category"
                                : "Add Expense Category"}

                        </h2>

                        <p>
                            Category codes are used internally and should remain stable.
                        </p>

                    </div>

                </div>


                <div className="form-grid">

                    <div className="form-field">

                        <label>
                            Code
                        </label>

                        <input
                            type="text"
                            name="code"
                            value={
                                categoryForm.code
                            }
                            onChange={
                                handleCategoryCodeChange
                            }
                            placeholder="Example: GENERATOR_RENTAL"
                            required
                            disabled={
                                editingCategoryId !==
                                null
                            }
                        />

                        {editingCategoryId !==
                            null && (

                                <small className="settings-field-help">
                                    Code cannot be changed after creation.
                                </small>
                            )}

                    </div>


                    <div className="form-field">

                        <label>
                            Display Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={
                                categoryForm.name
                            }
                            onChange={
                                handleCategoryChange
                            }
                            placeholder="Example: Generator Rental"
                            required
                        />

                    </div>


                    <div className="form-field">

                        <label>
                            Status
                        </label>

                        <label className="settings-checkbox-row">

                            <input
                                type="checkbox"
                                name="active"
                                checked={
                                    categoryForm.active
                                }
                                onChange={
                                    handleCategoryChange
                                }
                            />

                            <span>
                                Active
                            </span>

                        </label>

                    </div>

                </div>


                <div className="form-actions">

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loadingCategory
                        }
                    >

                        {loadingCategory
                            ? "Saving..."
                            : editingCategoryId !==
                                null
                                ? "Update Category"
                                : "Add Category"}

                    </button>


                    {editingCategoryId !==
                        null && (

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleCategoryCancelEdit
                                }
                                disabled={
                                    loadingCategory
                                }
                            >
                                Cancel
                            </button>
                        )}

                </div>

            </form>


            <div className="table-card">

                <div className="settings-section-header">

                    <div>

                        <h2>
                            Expense Categories
                        </h2>

                        <p>
                            Active categories are available when creating new expenses.
                        </p>

                    </div>

                </div>


                <div className="filter-toolbar">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search code or category name"
                        value={
                            categorySearchTerm
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setCategorySearchTerm(
                                    event
                                        .target
                                        .value
                                )
                        }
                    />


                    <select
                        className="filter-select"
                        value={
                            categoryStatusFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setCategoryStatusFilter(
                                    event
                                        .target
                                        .value
                                )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>


                    {categoryFiltersActive && (

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                clearCategoryFilters
                            }
                        >
                            Clear Filters
                        </button>
                    )}

                </div>


                {loadingCategories ? (

                    <p>
                        Loading expense categories...
                    </p>

                ) : filteredCategories.length ===
                    0 ? (

                    <p>
                        No expense categories match the selected filters.
                    </p>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredCategories.map(
                                    (
                                        category
                                    ) => (

                                        <tr
                                            key={
                                                category.id
                                            }
                                        >

                                            <td>

                                                <code className="settings-category-code">
                                                    {
                                                        category.code
                                                    }
                                                </code>

                                            </td>


                                            <td>
                                                {
                                                    category.name
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        category.active
                                                            ? "settings-status settings-status-active"
                                                            : "settings-status settings-status-inactive"
                                                    }
                                                >

                                                    {category.active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="table-actions">

                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={
                                                            () =>
                                                                handleCategoryEdit(
                                                                    category
                                                                )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            category.active
                                                                ? "danger-button"
                                                                : "primary-button"
                                                        }
                                                        onClick={
                                                            () =>
                                                                handleCategoryToggleStatus(
                                                                    category
                                                                )
                                                        }
                                                        disabled={
                                                            categoryStatusUpdatingId ===
                                                            category.id
                                                        }
                                                    >

                                                        {categoryStatusUpdatingId ===
                                                            category.id
                                                            ? "Updating..."
                                                            : category.active
                                                                ? "Deactivate"
                                                                : "Activate"}

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


            {/* =========================
                Areas
               ========================= */}

            <div className="settings-section-header">

                <div>

                    <h2>
                        Areas
                    </h2>

                    <p>
                        Manage contributor areas used throughout the application.
                    </p>

                </div>

            </div>


            <div className="settings-summary-grid">

                <div className="settings-summary-card">

                    <span>
                        Total Areas
                    </span>

                    <strong>
                        {
                            areas.length
                        }
                    </strong>

                </div>


                <div className="settings-summary-card">

                    <span>
                        Active
                    </span>

                    <strong>
                        {
                            activeAreaCount
                        }
                    </strong>

                </div>


                <div className="settings-summary-card">

                    <span>
                        Inactive
                    </span>

                    <strong>
                        {
                            inactiveAreaCount
                        }
                    </strong>

                </div>

            </div>


            <form
                className="form-card"
                onSubmit={
                    handleAreaSubmit
                }
            >

                <div className="settings-section-header">

                    <div>

                        <h2>

                            {editingAreaId !==
                                null
                                ? "Edit Area"
                                : "Add Area"}

                        </h2>

                        <p>
                            Area codes are used internally and should remain stable.
                        </p>

                    </div>

                </div>


                <div className="form-grid">

                    <div className="form-field">

                        <label>
                            Code
                        </label>

                        <input
                            type="text"
                            name="code"
                            value={
                                areaForm.code
                            }
                            onChange={
                                handleAreaCodeChange
                            }
                            placeholder="Example: ITA"
                            required
                            disabled={
                                editingAreaId !==
                                null
                            }
                        />

                        {editingAreaId !==
                            null && (

                                <small className="settings-field-help">
                                    Code cannot be changed after creation.
                                </small>
                            )}

                    </div>


                    <div className="form-field">

                        <label>
                            Display Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={
                                areaForm.name
                            }
                            onChange={
                                handleAreaChange
                            }
                            placeholder="Example: ITA"
                            required
                        />

                    </div>


                    <div className="form-field">

                        <label>
                            Status
                        </label>

                        <label className="settings-checkbox-row">

                            <input
                                type="checkbox"
                                name="active"
                                checked={
                                    areaForm.active
                                }
                                onChange={
                                    handleAreaChange
                                }
                            />

                            <span>
                                Active
                            </span>

                        </label>

                    </div>

                </div>


                <div className="form-actions">

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loadingArea
                        }
                    >

                        {loadingArea
                            ? "Saving..."
                            : editingAreaId !==
                                null
                                ? "Update Area"
                                : "Add Area"}

                    </button>


                    {editingAreaId !==
                        null && (

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleAreaCancelEdit
                                }
                                disabled={
                                    loadingArea
                                }
                            >
                                Cancel
                            </button>
                        )}

                </div>

            </form>


            <div className="table-card">

                <div className="settings-section-header">

                    <div>

                        <h2>
                            Areas
                        </h2>

                        <p>
                            Active areas are available when creating or updating contributors.
                        </p>

                    </div>

                </div>


                <div className="filter-toolbar">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search code or area name"
                        value={
                            areaSearchTerm
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setAreaSearchTerm(
                                    event
                                        .target
                                        .value
                                )
                        }
                    />


                    <select
                        className="filter-select"
                        value={
                            areaStatusFilter
                        }
                        onChange={
                            (
                                event
                            ) =>
                                setAreaStatusFilter(
                                    event
                                        .target
                                        .value
                                )
                        }
                    >

                        <option value="ALL">
                            All Statuses
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>


                    {areaFiltersActive && (

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                clearAreaFilters
                            }
                        >
                            Clear Filters
                        </button>
                    )}

                </div>


                {loadingAreas ? (

                    <p>
                        Loading areas...
                    </p>

                ) : filteredAreas.length ===
                    0 ? (

                    <p>
                        No areas match the selected filters.
                    </p>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Code
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredAreas.map(
                                    (
                                        area
                                    ) => (

                                        <tr
                                            key={
                                                area.id
                                            }
                                        >

                                            <td>

                                                <code className="settings-category-code">
                                                    {
                                                        area.code
                                                    }
                                                </code>

                                            </td>


                                            <td>
                                                {
                                                    area.name
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        area.active
                                                            ? "settings-status settings-status-active"
                                                            : "settings-status settings-status-inactive"
                                                    }
                                                >

                                                    {area.active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            <td>

                                                <div className="table-actions">

                                                    <button
                                                        type="button"
                                                        className="secondary-button"
                                                        onClick={
                                                            () =>
                                                                handleAreaEdit(
                                                                    area
                                                                )
                                                        }
                                                    >
                                                        Edit
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            area.active
                                                                ? "danger-button"
                                                                : "primary-button"
                                                        }
                                                        onClick={
                                                            () =>
                                                                handleAreaToggleStatus(
                                                                    area
                                                                )
                                                        }
                                                        disabled={
                                                            areaStatusUpdatingId ===
                                                            area.id
                                                        }
                                                    >

                                                        {areaStatusUpdatingId ===
                                                            area.id
                                                            ? "Updating..."
                                                            : area.active
                                                                ? "Deactivate"
                                                                : "Activate"}

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


export default Settings;