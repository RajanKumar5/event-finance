import {
    useEffect,
    useState,
} from "react";

import {
    createExpense,
    deleteExpense,
    getExpensesByEvent,
    updateExpense,
} from "../api/expenseApi";

import {
    getActiveExpenseCategories,
} from "../api/masterDataApi";

import { useEvent } from "../context/EventContext";


const createEmptyForm = (
    defaultCategory = ""
) => ({
    category: defaultCategory,

    description: "",

    vendorName: "",

    amount: "",

    expenseDate: new Date()
        .toISOString()
        .split("T")[0],

    paymentMode: "CASH",

    paidBy: "",

    paymentReference: "",

    notes: "",
});


const Expenses = () => {

    const {
        selectedEventId,
        selectedEvent,
    } = useEvent();


    const [
        expenses,
        setExpenses,
    ] = useState([]);


    const [
        expenseCategories,
        setExpenseCategories,
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
        loadingExpenses,
        setLoadingExpenses,
    ] = useState(false);


    const [
        loadingCategories,
        setLoadingCategories,
    ] = useState(false);


    const [
        deletingId,
        setDeletingId,
    ] = useState(null);


    const [
        error,
        setError,
    ] = useState("");


    const [
        searchTerm,
        setSearchTerm,
    ] = useState("");


    const [
        categoryFilter,
        setCategoryFilter,
    ] = useState("ALL");


    const [
        paymentModeFilter,
        setPaymentModeFilter,
    ] = useState("ALL");


    const [
        dateFilter,
        setDateFilter,
    ] = useState("");


    const [
        sortConfig,
        setSortConfig,
    ] = useState({
        key: "expenseDate",
        direction: "desc",
    });


    const eventReadOnly =
        selectedEvent?.status ===
        "COMPLETED" ||
        selectedEvent?.status ===
        "ARCHIVED";


    const getDefaultCategory = (
        categories = expenseCategories
    ) => {

        if (
            !categories ||
            categories.length === 0
        ) {
            return "";
        }


        return categories[0].code;
    };


    const getCategoryName = (
        categoryCode
    ) => {

        const category =
            expenseCategories.find(
                (item) =>
                    item.code ===
                    categoryCode
            );


        if (category) {
            return category.name;
        }


        return (
            categoryCode
                ?.replaceAll(
                    "_",
                    " "
                ) || "-"
        );
    };


    const loadCategories =
        async () => {

            try {

                setLoadingCategories(
                    true
                );


                const data =
                    await getActiveExpenseCategories();


                setExpenseCategories(
                    data
                );


                if (
                    data.length > 0
                ) {

                    setForm(
                        (previous) => {

                            if (
                                previous.category
                            ) {
                                return previous;
                            }


                            return {
                                ...previous,

                                category:
                                    data[0]
                                        .code,
                            };
                        }
                    );
                }

            } catch (err) {

                console.error(err);


                setError(
                    err.response?.data
                        ?.message ||
                    "Failed to load expense categories"
                );

            } finally {

                setLoadingCategories(
                    false
                );
            }
        };


    const loadExpenses =
        async (
            eventId
        ) => {

            try {

                setLoadingExpenses(
                    true
                );

                setError("");


                const data =
                    await getExpensesByEvent(
                        eventId
                    );


                setExpenses(
                    data
                );

            } catch (err) {

                console.error(err);


                setError(
                    err.response?.data
                        ?.message ||
                    "Failed to load expenses"
                );

            } finally {

                setLoadingExpenses(
                    false
                );
            }
        };


    const resetForm = () => {

        setForm(
            createEmptyForm(
                getDefaultCategory()
            )
        );


        setEditingId(
            null
        );
    };


    useEffect(() => {

        loadCategories();

    }, []);


    useEffect(() => {

        resetForm();


        setSearchTerm(
            ""
        );


        setCategoryFilter(
            "ALL"
        );


        setPaymentModeFilter(
            "ALL"
        );


        setDateFilter(
            ""
        );


        setSortConfig({
            key: "expenseDate",
            direction: "desc",
        });


        if (
            !selectedEventId
        ) {

            setExpenses([]);

            return;
        }


        loadExpenses(
            selectedEventId
        );

    }, [selectedEventId]);


    useEffect(() => {

        if (
            editingId !== null
        ) {
            return;
        }


        if (
            !form.category &&
            expenseCategories.length >
            0
        ) {

            setForm(
                (previous) => ({
                    ...previous,

                    category:
                        expenseCategories[0]
                            .code,
                })
            );
        }

    }, [
        expenseCategories,
        editingId,
        form.category,
    ]);


    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,

                [name]: value,
            })
        );
    };


    const handleEdit = (
        expense
    ) => {

        if (
            eventReadOnly
        ) {
            return;
        }


        setError("");


        setEditingId(
            expense.id
        );


        setForm({

            category:
                expense.category ||
                "",

            description:
                expense.description ||
                "",

            vendorName:
                expense.vendorName ||
                "",

            amount:
                expense.amount ??
                "",

            expenseDate:
                expense.expenseDate ||
                "",

            paymentMode:
                expense.paymentMode ||
                "CASH",

            paidBy:
                expense.paidBy ||
                "",

            paymentReference:
                expense.paymentReference ||
                "",

            notes:
                expense.notes ||
                "",
        });


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    const handleCancelEdit =
        () => {

            setError("");

            resetForm();
        };


    const handleSubmit =
        async (
            event
        ) => {

            event.preventDefault();


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
                !form.category
            ) {

                setError(
                    "Please select an expense category"
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

                    category:
                        form.category,

                    description:
                        form.description,

                    vendorName:
                        form.vendorName ||
                        null,

                    amount:
                        Number(
                            form.amount
                        ),

                    expenseDate:
                        form.expenseDate,

                    paymentMode:
                        form.paymentMode,

                    paidBy:
                        form.paidBy ||
                        null,

                    paymentReference:
                        form
                            .paymentReference ||
                        null,

                    notes:
                        form.notes ||
                        null,
                };


                if (
                    editingId !==
                    null
                ) {

                    await updateExpense(
                        editingId,
                        request
                    );

                } else {

                    await createExpense(
                        request
                    );
                }


                resetForm();


                await loadExpenses(
                    selectedEventId
                );

            } catch (err) {

                console.error(err);


                const message =
                    err.response?.data
                        ?.message ||
                    (
                        editingId !==
                            null

                            ? "Failed to update expense"

                            : "Failed to create expense"
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
        async (
            id
        ) => {

            if (
                eventReadOnly
            ) {

                setError(
                    "Financial records cannot be modified for a completed or archived event"
                );

                return;
            }


            const shouldDelete =
                window.confirm(
                    "Are you sure you want to delete this expense?"
                );


            if (
                !shouldDelete
            ) {
                return;
            }


            try {

                setDeletingId(
                    id
                );

                setError("");


                await deleteExpense(
                    id
                );


                if (
                    editingId ===
                    id
                ) {

                    resetForm();
                }


                await loadExpenses(
                    selectedEventId
                );

            } catch (err) {

                console.error(err);


                const message =
                    err.response?.data
                        ?.message ||
                    "Failed to delete expense";


                setError(
                    message
                );

            } finally {

                setDeletingId(
                    null
                );
            }
        };


    const handleSort = (
        key
    ) => {

        setSortConfig(
            (previous) => {

                if (
                    previous.key ===
                    key
                ) {

                    return {
                        key,

                        direction:
                            previous
                                .direction ===
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
            sortConfig.key !==
            key
        ) {
            return null;
        }


        return (
            <span className="sort-indicator">
                {
                    sortConfig.direction ===
                        "asc"

                        ? "↑"

                        : "↓"
                }
            </span>
        );
    };


    const normalizedSearch =
        searchTerm
            .trim()
            .toLowerCase();


    const filteredExpenses =
        expenses.filter(
            (expense) => {

                const description =
                    expense.description
                        ?.toLowerCase() ||
                    "";


                const vendorName =
                    expense.vendorName
                        ?.toLowerCase() ||
                    "";


                const paidBy =
                    expense.paidBy
                        ?.toLowerCase() ||
                    "";


                const matchesSearch =
                    !normalizedSearch ||

                    description.includes(
                        normalizedSearch
                    ) ||

                    vendorName.includes(
                        normalizedSearch
                    ) ||

                    paidBy.includes(
                        normalizedSearch
                    );


                const matchesCategory =
                    categoryFilter ===
                    "ALL" ||

                    expense.category ===
                    categoryFilter;


                const matchesPaymentMode =
                    paymentModeFilter ===
                    "ALL" ||

                    expense.paymentMode ===
                    paymentModeFilter;


                const matchesDate =
                    !dateFilter ||

                    expense.expenseDate ===
                    dateFilter;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPaymentMode &&
                    matchesDate
                );
            }
        );


    const sortedExpenses = [
        ...filteredExpenses,
    ].sort(
        (
            firstExpense,
            secondExpense
        ) => {

            let first;
            let second;


            if (
                sortConfig.key ===
                "amount"
            ) {

                first =
                    Number(
                        firstExpense
                            .amount ||
                        0
                    );


                second =
                    Number(
                        secondExpense
                            .amount ||
                        0
                    );


                const comparison =
                    first -
                    second;


                return (
                    sortConfig.direction ===
                        "asc"

                        ? comparison

                        : -comparison
                );
            }


            if (
                sortConfig.key ===
                "expenseDate"
            ) {

                first =
                    firstExpense
                        .expenseDate ||
                    "";


                second =
                    secondExpense
                        .expenseDate ||
                    "";


                const comparison =
                    first.localeCompare(
                        second
                    );


                return (
                    sortConfig.direction ===
                        "asc"

                        ? comparison

                        : -comparison
                );
            }


            if (
                sortConfig.key ===
                "category"
            ) {

                first =
                    getCategoryName(
                        firstExpense.category
                    );


                second =
                    getCategoryName(
                        secondExpense.category
                    );

            } else {

                first =
                    String(
                        firstExpense[
                        sortConfig.key
                        ] ?? ""
                    );


                second =
                    String(
                        secondExpense[
                        sortConfig.key
                        ] ?? ""
                    );
            }


            const comparison =
                first.localeCompare(
                    second,
                    undefined,
                    {
                        numeric: true,
                        sensitivity:
                            "base",
                    }
                );


            return (
                sortConfig.direction ===
                    "asc"

                    ? comparison

                    : -comparison
            );
        }
    );


    const clearFilters = () => {

        setSearchTerm("");

        setCategoryFilter(
            "ALL"
        );

        setPaymentModeFilter(
            "ALL"
        );

        setDateFilter("");
    };


    const filtersActive =
        searchTerm.trim() !== "" ||

        categoryFilter !==
        "ALL" ||

        paymentModeFilter !==
        "ALL" ||

        dateFilter !== "";


    return (
        <div className="page-container">

            <div className="page-header">

                <div>

                    <h1>
                        Expenses
                    </h1>

                    <p>
                        {
                            selectedEvent

                                ? `Record and track spending for ${selectedEvent.name}`

                                : "Select an event to manage expenses"
                        }
                    </p>

                </div>

            </div>


            {eventReadOnly && (

                <div className="info-message">

                    This event is{" "}

                    <strong>
                        {
                            selectedEvent
                                .status
                                .toLowerCase()
                        }
                    </strong>

                    . Financial records are read-only.

                </div>
            )}


            <form
                className="form-card"
                onSubmit={
                    handleSubmit
                }
            >

                <h2>
                    {
                        editingId !==
                            null

                            ? "Edit Expense"

                            : "Add Expense"
                    }
                </h2>


                <div className="form-grid">

                    <div className="form-field">

                        <label>
                            Category
                        </label>


                        <select
                            name="category"
                            value={
                                form.category
                            }
                            onChange={
                                handleChange
                            }
                            required
                            disabled={
                                eventReadOnly ||
                                loadingCategories ||
                                expenseCategories
                                    .length === 0
                            }
                        >

                            {
                                loadingCategories
                                    ? (
                                        <option value="">
                                            Loading categories...
                                        </option>
                                    )

                                    : expenseCategories
                                        .length === 0
                                        ? (
                                            <option value="">
                                                No active categories
                                            </option>
                                        )

                                        : expenseCategories.map(
                                            (
                                                category
                                            ) => (

                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.code
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )
                            }

                        </select>

                    </div>


                    <div className="form-field">

                        <label>
                            Date
                        </label>

                        <input
                            type="date"
                            name="expenseDate"
                            value={
                                form.expenseDate
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


                    <div className="form-field form-field-full">

                        <label>
                            Description
                        </label>

                        <input
                            name="description"
                            placeholder="Example: Main stage decoration"
                            value={
                                form.description
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
                            Vendor
                        </label>

                        <input
                            name="vendorName"
                            placeholder="Vendor name"
                            value={
                                form.vendorName
                            }
                            onChange={
                                handleChange
                            }
                            disabled={
                                eventReadOnly
                            }
                        />

                    </div>


                    <div className="form-field">

                        <label>
                            Amount
                        </label>

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={
                                form.amount
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
                            Paid By
                        </label>

                        <input
                            name="paidBy"
                            placeholder="Person / committee"
                            value={
                                form.paidBy
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
                            Payment Reference
                        </label>

                        <input
                            name="paymentReference"
                            placeholder="UPI / Bank reference"
                            value={
                                form
                                    .paymentReference
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
                            placeholder="Additional details"
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
                            eventReadOnly ||
                            loadingCategories ||
                            expenseCategories
                                .length === 0
                        }
                    >

                        {
                            loading

                                ? "Saving..."

                                : editingId !==
                                    null

                                    ? "Update Expense"

                                    : "Add Expense"
                        }

                    </button>


                    {editingId !== null && (

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


            {error && (

                <div className="error-message">
                    {error}
                </div>
            )}


            <div className="table-card">

                <h2>
                    Expense List
                </h2>


                <div className="filter-toolbar">

                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search description, vendor or paid by"
                        value={
                            searchTerm
                        }
                        onChange={
                            (event) =>
                                setSearchTerm(
                                    event.target
                                        .value
                                )
                        }
                    />


                    <select
                        className="filter-select"
                        value={
                            categoryFilter
                        }
                        onChange={
                            (event) =>
                                setCategoryFilter(
                                    event.target
                                        .value
                                )
                        }
                    >

                        <option value="ALL">
                            All Categories
                        </option>


                        {
                            expenseCategories.map(
                                (
                                    category
                                ) => (

                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.code
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </option>
                                )
                            )
                        }

                    </select>


                    <select
                        className="filter-select"
                        value={
                            paymentModeFilter
                        }
                        onChange={
                            (event) =>
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
                        onChange={
                            (event) =>
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


                {
                    loadingExpenses

                        ? (
                            <p>
                                Loading expenses...
                            </p>
                        )

                        : expenses.length ===
                            0

                            ? (
                                <p>
                                    No expenses recorded for this event yet.
                                </p>
                            )

                            : filteredExpenses
                                .length === 0

                                ? (
                                    <p>
                                        No expenses match the selected filters.
                                    </p>
                                )

                                : (
                                    <div className="table-wrapper">

                                        <table>

                                            <thead>

                                                <tr>

                                                    <th
                                                        className="sortable-header"
                                                        onClick={() =>
                                                            handleSort(
                                                                "expenseDate"
                                                            )
                                                        }
                                                    >
                                                        Date
                                                        {
                                                            getSortIndicator(
                                                                "expenseDate"
                                                            )
                                                        }
                                                    </th>


                                                    <th
                                                        className="sortable-header"
                                                        onClick={() =>
                                                            handleSort(
                                                                "category"
                                                            )
                                                        }
                                                    >
                                                        Category
                                                        {
                                                            getSortIndicator(
                                                                "category"
                                                            )
                                                        }
                                                    </th>


                                                    <th
                                                        className="sortable-header"
                                                        onClick={() =>
                                                            handleSort(
                                                                "description"
                                                            )
                                                        }
                                                    >
                                                        Description
                                                        {
                                                            getSortIndicator(
                                                                "description"
                                                            )
                                                        }
                                                    </th>


                                                    <th
                                                        className="sortable-header"
                                                        onClick={() =>
                                                            handleSort(
                                                                "vendorName"
                                                            )
                                                        }
                                                    >
                                                        Vendor
                                                        {
                                                            getSortIndicator(
                                                                "vendorName"
                                                            )
                                                        }
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
                                                        {
                                                            getSortIndicator(
                                                                "paymentMode"
                                                            )
                                                        }
                                                    </th>


                                                    <th
                                                        className="sortable-header"
                                                        onClick={() =>
                                                            handleSort(
                                                                "amount"
                                                            )
                                                        }
                                                    >
                                                        Amount
                                                        {
                                                            getSortIndicator(
                                                                "amount"
                                                            )
                                                        }
                                                    </th>


                                                    <th>
                                                        Actions
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody>

                                                {
                                                    sortedExpenses.map(
                                                        (
                                                            expense
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    expense.id
                                                                }
                                                            >

                                                                <td>
                                                                    {
                                                                        expense.expenseDate
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        expense.categoryName ||
                                                                        getCategoryName(
                                                                            expense.category
                                                                        )
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        expense.description
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        expense.vendorName ||
                                                                        "-"
                                                                    }
                                                                </td>


                                                                <td>
                                                                    {
                                                                        expense.paymentMode
                                                                    }
                                                                </td>


                                                                <td>
                                                                    ₹
                                                                    {
                                                                        expense.amount
                                                                    }
                                                                </td>


                                                                <td>

                                                                    <div className="table-actions">

                                                                        <button
                                                                            type="button"
                                                                            className="secondary-button"
                                                                            onClick={() =>
                                                                                handleEdit(
                                                                                    expense
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
                                                                                    expense.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                eventReadOnly ||
                                                                                deletingId ===
                                                                                expense.id
                                                                            }
                                                                        >

                                                                            {
                                                                                deletingId ===
                                                                                    expense.id

                                                                                    ? "Deleting..."

                                                                                    : "Delete"
                                                                            }

                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>
                                                        )
                                                    )
                                                }

                                            </tbody>

                                        </table>

                                    </div>
                                )
                }

            </div>

        </div>
    );
};


export default Expenses;