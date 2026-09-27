import { useEffect, useState } from "react";
import { getAllEvents } from "../api/eventApi";

import {
    createExpense,
    getExpensesByEvent,
} from "../api/expenseApi";

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

const Expenses = () => {
    const [events, setEvents] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [form, setForm] = useState({
        eventId: "",
        category: "DECORATION",
        description: "",
        vendorName: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMode: "CASH",
        paidBy: "",
        paymentReference: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await getAllEvents();

                setEvents(data);

                if (data.length > 0) {
                    setForm((previous) => ({
                        ...previous,
                        eventId: data[0].id,
                    }));
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load events");
            }
        };

        loadEvents();
    }, []);

    useEffect(() => {
        if (!form.eventId) {
            return;
        }

        loadExpenses(form.eventId);
    }, [form.eventId]);

    const loadExpenses = async (eventId) => {
        try {
            const data = await getExpensesByEvent(eventId);
            setExpenses(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load expenses");
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const request = {
                ...form,

                eventId: Number(form.eventId),

                amount: Number(form.amount),

                paymentReference:
                    form.paymentReference || null,

                vendorName:
                    form.vendorName || null,

                paidBy:
                    form.paidBy || null,

                notes:
                    form.notes || null,
            };

            await createExpense(request);

            setForm((previous) => ({
                ...previous,
                description: "",
                vendorName: "",
                amount: "",
                paidBy: "",
                paymentReference: "",
                notes: "",
            }));

            await loadExpenses(form.eventId);
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "Failed to create expense";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Expenses</h1>
                    <p>Record and track event spending</p>
                </div>
            </div>

            <form
                className="form-card"
                onSubmit={handleSubmit}
            >
                <h2>Add Expense</h2>

                <div className="form-grid">
                    <div className="form-field form-field-full">
                        <label>Event</label>

                        <select
                            name="eventId"
                            value={form.eventId}
                            onChange={handleChange}
                            required
                        >
                            {events.map((event) => (
                                <option
                                    key={event.id}
                                    value={event.id}
                                >
                                    {event.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Category</label>

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                        >
                            {ExpenseCategories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category.replaceAll("_", " ")}
                                </option>
                            ))}
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
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK">Bank</option>
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

                <button
                    className="primary-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Add Expense"}
                </button>
            </form>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-card">
                <h2>Expense List</h2>

                {expenses.length === 0 ? (
                    <p>No expenses recorded yet.</p>
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
                                </tr>
                            </thead>

                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense.id}>
                                        <td>{expense.expenseDate}</td>

                                        <td>
                                            {expense.category.replaceAll("_", " ")}
                                        </td>

                                        <td>{expense.description}</td>

                                        <td>
                                            {expense.vendorName || "-"}
                                        </td>

                                        <td>{expense.paymentMode}</td>

                                        <td>₹{expense.amount}</td>
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