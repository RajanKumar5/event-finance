import { useEffect, useState } from "react";
import { getAllEvents } from "../api/eventApi";
import { getAllContributors } from "../api/contributorApi";
import {
    createContribution,
    getContributionsByEvent,
} from "../api/contributionApi";

const Contributions = () => {
    const [events, setEvents] = useState([]);
    const [contributors, setContributors] = useState([]);
    const [contributions, setContributions] = useState([]);

    const [form, setForm] = useState({
        eventId: "",
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
    const [error, setError] = useState("");

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [eventData, contributorData] = await Promise.all([
                    getAllEvents(),
                    getAllContributors(),
                ]);

                setEvents(eventData);
                setContributors(contributorData);

                if (eventData.length > 0) {
                    setForm((previous) => ({
                        ...previous,
                        eventId: eventData[0].id,
                    }));
                }

                if (contributorData.length > 0) {
                    setForm((previous) => ({
                        ...previous,
                        contributorId: contributorData[0].id,
                    }));
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load contribution data");
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (!form.eventId) {
            return;
        }

        loadContributions(form.eventId);
    }, [form.eventId]);

    const loadContributions = async (eventId) => {
        try {
            const data = await getContributionsByEvent(eventId);
            setContributions(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load contributions");
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
                contributorId: Number(form.contributorId),
                amountPaid: Number(form.amountPaid),

                upiPaidTo:
                    form.paymentMode === "UPI"
                        ? form.upiPaidTo
                        : null,

                paymentReference:
                    form.paymentReference || null,
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

            await loadContributions(form.eventId);
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
            <h1>Contributions</h1>

            <form
                onSubmit={handleSubmit}
                className="form-card"
            >
                <h2>Add Contribution</h2>

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

                <label>Contributor</label>

                <select
                    name="contributorId"
                    value={form.contributorId}
                    onChange={handleChange}
                    required
                >
                    {contributors.map((contributor) => (
                        <option
                            key={contributor.id}
                            value={contributor.id}
                        >
                            {contributor.name} - {contributor.address}
                        </option>
                    ))}
                </select>

                <input
                    name="receiptNumber"
                    placeholder="Receipt Number"
                    value={form.receiptNumber}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="paymentDate"
                    value={form.paymentDate}
                    onChange={handleChange}
                    required
                />

                <select
                    name="paymentMode"
                    value={form.paymentMode}
                    onChange={handleChange}
                >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK">Bank</option>
                </select>

                <input
                    type="number"
                    name="amountPaid"
                    placeholder="Amount Paid"
                    value={form.amountPaid}
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    required
                />

                {form.paymentMode === "UPI" && (
                    <input
                        name="upiPaidTo"
                        placeholder="UPI Paid To"
                        value={form.upiPaidTo}
                        onChange={handleChange}
                        required
                    />
                )}

                <input
                    name="paymentReference"
                    placeholder="Payment Reference"
                    value={form.paymentReference}
                    onChange={handleChange}
                />

                <textarea
                    name="notes"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={handleChange}
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Add Contribution"}
                </button>
            </form>

            {error && <p>{error}</p>}

            <div className="table-card">
                <h2>Contribution List</h2>
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
                            {contributions.map((contribution) => (
                                <tr key={contribution.id}>
                                    <td>{contribution.receiptNumber}</td>
                                    <td>{contribution.paymentDate}</td>
                                    <td>{contribution.contributorName}</td>
                                    <td>{contribution.contributorAddress}</td>
                                    <td>{contribution.paymentMode}</td>
                                    <td>₹{contribution.amountPaid}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Contributions;