import { useEffect, useState } from "react";

import {
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
} from "../api/eventApi";

import { useEvent } from "../context/EventContext";

const emptyForm = {
    name: "",
    eventType: "GANESH_CHATURTHI",
    startDate: "",
    endDate: "",
    budget: "",
    status: "PLANNING",
};

const Events = () => {
    const { refreshEvents } = useEvent();

    const [events, setEvents] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setError("");

            const data = await getAllEvents();
            setEvents(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load events");
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

    const handleEdit = (event) => {
        setEditingId(event.id);

        setForm({
            name: event.name,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            budget: event.budget ?? "",
            status: event.status,
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

        try {
            setLoading(true);
            setError("");

            const request = {
                name: form.name,
                eventType: form.eventType,
                startDate: form.startDate,
                endDate: form.endDate,
                budget:
                    form.budget === ""
                        ? null
                        : Number(form.budget),
                status: form.status,
            };

            if (editingId) {
                await updateEvent(
                    editingId,
                    request
                );
            } else {
                await createEvent(request);
            }

            resetForm();

            await loadEvents();
            await refreshEvents();
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                (editingId
                    ? "Failed to update event"
                    : "Failed to create event");

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = window.confirm(
            "Are you sure you want to delete this event?"
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(id);
            setError("");

            await deleteEvent(id);

            if (editingId === id) {
                resetForm();
            }

            await loadEvents();
            await refreshEvents();
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete event"
            );
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Events</h1>
                <p>Create and manage festival events</p>
            </div>

            <form
                className="form-card"
                onSubmit={handleSubmit}
            >
                <h2>
                    {editingId
                        ? "Edit Event"
                        : "Add Event"}
                </h2>

                <div className="form-grid">
                    <div className="form-field form-field-full">
                        <label>Event Name</label>

                        <input
                            name="name"
                            placeholder="Example: Ganesh Chaturthi 2026"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Event Type</label>

                        <select
                            name="eventType"
                            value={form.eventType}
                            onChange={handleChange}
                        >
                            <option value="GANESH_CHATURTHI">
                                Ganesh Chaturthi
                            </option>

                            <option value="NAVRATRI">
                                Navratri
                            </option>

                            <option value="DURGA_PUJA">
                                Durga Puja
                            </option>

                            <option value="DIWALI">
                                Diwali
                            </option>

                            <option value="OTHER">
                                Other
                            </option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Status</label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="PLANNING">
                                Planning
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="ARCHIVED">
                                Archived
                            </option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Start Date</label>

                        <input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>End Date</label>

                        <input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Budget</label>

                        <input
                            type="number"
                            name="budget"
                            placeholder="Budget"
                            value={form.budget}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
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
                            : editingId
                                ? "Update Event"
                                : "Add Event"}
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
                <h2>Event List</h2>

                {events.length === 0 ? (
                    <p>No events available.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Budget</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id}>
                                        <td>
                                            {event.name}
                                        </td>

                                        <td>
                                            {event.eventType.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </td>

                                        <td>
                                            {event.startDate}
                                        </td>

                                        <td>
                                            {event.endDate}
                                        </td>

                                        <td>
                                            {event.budget != null
                                                ? `₹${event.budget}`
                                                : "-"}
                                        </td>

                                        <td>
                                            {event.status}
                                        </td>

                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            event
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
                                                            event.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        event.id
                                                    }
                                                >
                                                    {deletingId ===
                                                        event.id
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

export default Events;