import { useEffect, useState } from "react";
import { getAllContributors } from "../api/contributorApi";
import {
    createContribution,
    getContributionsByEvent,
} from "../api/contributionApi";
import { useEvent } from "../context/EventContext";

const Contributions = () => {
    const { selectedEventId, selectedEvent } = useEvent();

    const [contributors, setContributors] = useState([]);
    const [contributions, setContributions] = useState([]);

    const [form, setForm] = useState({
        contributorId: "",
        receiptNumber: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMode: "CASH",
        amountPaid: "",
        upiPaidTo: "",
        paymentReference: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingContributions, setLoadingContributions] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadContributors = async () => {
            try {
                const contributorData = await getAllContributors();

                setContributors(contributorData);

                if (contributorData.length > 0) {
                    setForm((previous) => ({
                        ...previous,
                        contributorId: contributorData[0].id,
                    }));
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load contributors");
            }
        };

        loadContributors();
    }, []);

    useEffect(() => {
        if (!selectedEventId) {
            setContributions([]);
            return;
        }

        loadContributions(selectedEventId);
    }, [selectedEventId]);

    const loadContributions = async (eventId) => {
        try {
            setLoadingContributions(true);
            setError("");

            const data = await getContributionsByEvent(eventId);
            setContributions(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load contributions");
        } finally {
            setLoadingContributions(false);
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

        if (!selectedEventId) {
            setError("Please select an event first");
            return;
        }

        if (!form.contributorId) {
            setError("Please select a contributor");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const request = {
                eventId: Number(selectedEventId),
                contributorId: Number(form.contributorId),

                receiptNumber: form.receiptNumber,
                paymentDate: form.paymentDate,
                paymentMode: form.paymentMode,

                amountPaid: Number(form.amountPaid),

                upiPaidTo:
                    form.paymentMode === "UPI"
                        ? form.upiPaidTo
                        : null,

                paymentReference:
                    form.paymentReference || null,

                notes:
                    form.notes || null,
            };

            await createContribution(request);

            setForm((previous) => ({
                ...previous,
                receiptNumber: "",
                amountPaid: "",
                upiPaidTo: "",
                paymentReference: "",
                notes: "",
            }));

            await loadContributions(selectedEventId);
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "Failed to create contribution";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Contributions</h1>

                    <p>
                        {selectedEvent
                            ? `Manage collections for ${selectedEvent.name}`
                            : "Select an event to manage contributions"}
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="form-card"
            >
                <h2>Add Contribution</h2>

                <div className="form-grid">
                    <div className="form-field form-field-full">
                        <label>Contributor</label>

                        <select
                            name="contributorId"
                            value={form.contributorId}
                            onChange={handleChange}
                            required
                        >
                            {contributors.length === 0 ? (
                                <option value="">
                                    No contributors available
                                </option>
                            ) : (
                                contributors.map((contributor) => (
                                    <option
                                        key={contributor.id}
                                        value={contributor.id}
                                    >
                                        {contributor.name} -{" "}
                                        {contributor.address}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Receipt Number</label>

                        <input
                            name="receiptNumber"
                            placeholder="Receipt Number"
                            value={form.receiptNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label>Payment Date</label>

                        <input
                            type="date"
                            name="paymentDate"
                            value={form.paymentDate}
                            onChange={handleChange}
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
                        <label>Amount Paid</label>

                        <input
                            type="number"
                            name="amountPaid"
                            placeholder="Amount Paid"
                            value={form.amountPaid}
                            onChange={handleChange}
                            min="0.01"
                            step="0.01"
                            required
                        />
                    </div>

                    {form.paymentMode === "UPI" && (
                        <div className="form-field form-field-full">
                            <label>UPI Paid To</label>

                            <input
                                name="upiPaidTo"
                                placeholder="UPI Paid To"
                                value={form.upiPaidTo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

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
                            placeholder="Notes"
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <button
                    className="primary-button"
                    type="submit"
                    disabled={
                        loading ||
                        !selectedEventId ||
                        contributors.length === 0
                    }
                >
                    {loading
                        ? "Saving..."
                        : "Add Contribution"}
                </button>
            </form>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-card">
                <h2>Contribution List</h2>

                {loadingContributions ? (
                    <p>Loading contributions...</p>
                ) : contributions.length === 0 ? (
                    <p>No contributions recorded for this event yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Receipt</th>
                                    <th>Date</th>
                                    <th>Contributor</th>
                                    <th>Address</th>
                                    <th>Mode</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {contributions.map(
                                    (contribution) => (
                                        <tr key={contribution.id}>
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