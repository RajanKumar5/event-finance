import { useEffect, useState } from "react";
import {
    createExpense,
    deleteExpense,
    getExpensesByEvent,
    updateExpense,
} from "../api/expenseApi";
import { useEvent } from "../context/EventContext";

const ExpenseCategories = [
    "DECORATION",
    "SOUND",
    "LIGHTING",
    "PRASAD",
    "PUJA",
    "TRANSPORTATION",
    "PRINTING",
    "CLEANING",
    "FOOD",
    "SECURITY",
    "MISCELLANEOUS",
];

const emptyForm = {
    category: "DECORATION",
    description: "",
    vendorName: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "CASH",
    paidBy: "",
    paymentReference: "",
    notes: "",
};

const Expenses = () => {
    const { selectedEventId, selectedEvent } = useEvent();

    const [expenses, setExpenses] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [loadingExpenses, setLoadingExpenses] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!selectedEventId) {
            setExpenses([]);
            return;
        }

        loadExpenses(selectedEventId);
    }, [selectedEventId]);

    const loadExpenses = async (eventId) => {
        try {
            setLoadingExpenses(true);
            setError("");

            const data = await getExpensesByEvent(eventId);
            setExpenses(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load expenses");
        } finally {
            setLoadingExpenses(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);

        setForm({
            category: expense.category,
            description: expense.description,
            vendorName: expense.vendorName || "",
            amount: expense.amount,
            expenseDate: expense.expenseDate,
            paymentMode: expense.paymentMode,
            paidBy: expense.paidBy || "",
            paymentReference: expense.paymentReference || "",
            notes: expense.notes || "",
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedEventId) {
            setError("Please select an event first");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const request = {
                eventId: Number(selectedEventId),
                category: form.category,
                description: form.description,
                vendorName: form.vendorName || null,
                amount: Number(form.amount),
                expenseDate: form.expenseDate,
                paymentMode: form.paymentMode,
                paidBy: form.paidBy || null,
                paymentReference:
                    form.paymentReference || null,
                notes: form.notes || null,
            };

            if (editingId) {
                await updateExpense(
                    editingId,
                    request
                );
            } else {
                await createExpense(request);
            }

            resetForm();

            await loadExpenses(selectedEventId);
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                (editingId
                    ? "Failed to update expense"
                    : "Failed to create expense");

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await deleteExpense(id);

            if (editingId === id) {
                resetForm();
            }

            await loadExpenses(selectedEventId);
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "Failed to delete expense";

            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Expenses</h1>

                    <p>
                        {selectedEvent
                            ? `Record and track spending for ${selectedEvent.name}`
                            : "Select an event to manage expenses"}
                    </p>
                </div>
            </div>

            <form
                className="form-card"
                onSubmit={handleSubmit}
            >
                <h2>
                    {editingId
                        ? "Edit Expense"
                        : "Add Expense"}
                </h2>

                <div className="form-grid">
                    <div className="form-field">
                        <label>Category</label>

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            {ExpenseCategories.map(
                                (category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category.replaceAll(
                                            "_",
                                            " "
                                        )}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Date</label>

                        <input
                            type="date"
                            name="expenseDate"
                            value={form.expenseDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field form-field-full">
                        <label>Description</label>

                        <input
                            name="description"
                            placeholder="Example: Main stage decoration"
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Vendor</label>

                        <input
                            name="vendorName"
                            placeholder="Vendor name"
                            value={form.vendorName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field">
                        <label>Amount</label>

                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={form.amount}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Payment Mode</label>

                        <select
                            name="paymentMode"
                            value={form.paymentMode}
                            onChange={handleChange}
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
                        <label>Paid By</label>

                        <input
                            name="paidBy"
                            placeholder="Person / committee"
                            value={form.paidBy}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field form-field-full">
                        <label>Payment Reference</label>

                        <input
                            name="paymentReference"
                            placeholder="UPI / Bank reference"
                            value={form.paymentReference}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field form-field-full">
                        <label>Notes</label>

                        <textarea
                            name="notes"
                            placeholder="Additional details"
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        className="primary-button"
                        type="submit"
                        disabled={
                            loading ||
                            !selectedEventId
                        }
                    >
                        {loading
                            ? "Saving..."
                            : editingId
                                ? "Update Expense"
                                : "Add Expense"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleCancelEdit}
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
                <h2>Expense List</h2>

                {loadingExpenses ? (
                    <p>Loading expenses...</p>
                ) : expenses.length === 0 ? (
                    <p>
                        No expenses recorded for this event yet.
                    </p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Vendor</th>
                                    <th>Mode</th>
                                    <th>Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>
                                            {expense.expenseDate}
                                        </td>

                                        <td>
                                            {expense.category.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </td>

                                        <td>
                                            {expense.description}
                                        </td>

                                        <td>
                                            {expense.vendorName ||
                                                "-"}
                                        </td>

                                        <td>
                                            {expense.paymentMode}
                                        </td>

                                        <td>
                                            ₹{expense.amount}
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
                                                        deletingId ===
                                                        expense.id
                                                    }
                                                >
                                                    {deletingId ===
                                                        expense.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Expenses;