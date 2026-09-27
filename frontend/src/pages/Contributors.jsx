import { useEffect, useState } from "react";
import {
    createContributor,
    deleteContributor,
    getAllContributors,
    updateContributor,
} from "../api/contributorApi";

const emptyForm = {
    name: "",
    houseNumber: "",
    area: "ITA",
    phone: "",
    notes: "",
};

const Contributors = () => {
    const [contributors, setContributors] = useState([]);
    const [form, setForm] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");

    const fetchContributors = async () => {
        try {
            const data = await getAllContributors();
            setContributors(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load contributors");
        }
    };

    useEffect(() => {
        fetchContributors();
    }, []);

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

    const handleEdit = (contributor) => {
        setEditingId(contributor.id);

        setForm({
            name: contributor.name,
            houseNumber: contributor.houseNumber,
            area: contributor.area,
            phone: contributor.phone || "",
            notes: contributor.notes || "",
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

            if (editingId) {
                await updateContributor(editingId, form);
            } else {
                await createContributor(form);
            }

            resetForm();

            await fetchContributors();
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                (editingId
                    ? "Failed to update contributor"
                    : "Failed to create contributor");

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const shouldDelete = window.confirm(
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

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Contributors</h1>
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
                    {editingId
                        ? "Edit Contributor"
                        : "Add Contributor"}
                </h2>

                <div className="form-grid">
                    <div className="form-field">
                        <label>Name</label>

                        <input
                            name="name"
                            placeholder="Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>House Number</label>

                        <input
                            name="houseNumber"
                            placeholder="House Number"
                            value={form.houseNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Area</label>

                        <select
                            name="area"
                            value={form.area}
                            onChange={handleChange}
                            required
                        >
                            <option value="ITA">ITA</option>
                            <option value="ITB">ITB</option>
                            <option value="ITC">ITC</option>

                            <option value="MEA">MEA</option>
                            <option value="MEB">MEB</option>
                            <option value="MEC">MEC</option>
                            <option value="MED">MED</option>
                            <option value="MEE">MEE</option>
                            <option value="MEF">MEF</option>
                            <option value="MEG">MEG</option>
                            <option value="MEH">MEH</option>
                            <option value="MEI">MEI</option>

                            <option value="CVA">CVA</option>
                            <option value="CVB">CVB</option>

                            <option value="PPA">PPA</option>
                            <option value="PPB">PPB</option>
                            <option value="PPC">PPC</option>
                            <option value="PPD">PPD</option>
                            <option value="PPE">PPE</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Phone</label>

                        <input
                            name="phone"
                            placeholder="Phone"
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-field form-field-full">
                        <label>Notes</label>

                        <textarea
                            name="notes"
                            placeholder="Notes"
                            value={form.notes}
                            onChange={handleChange}
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
                                ? "Update Contributor"
                                : "Add Contributor"}
                    </button>

                    {editingId && (
                        <button
                            className="secondary-button"
                            type="button"
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
                <h2>Contributor List</h2>

                {contributors.length === 0 ? (
                    <p>No contributors available.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Address</th>
                                    <th>Phone</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {contributors.map((contributor) => (
                                    <tr key={contributor.id}>
                                        <td>
                                            {contributor.name}
                                        </td>

                                        <td>
                                            {contributor.address}
                                        </td>

                                        <td>
                                            {contributor.phone || "-"}
                                        </td>

                                        <td>
                                            {contributor.notes || "-"}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contributors;