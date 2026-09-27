import { useEffect, useState } from "react";
import { getEventDashboard } from "../api/dashboardApi";
import { getAllEvents } from "../api/eventApi";

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                setEvents(data);

                if (data.length > 0) {
                    setSelectedEventId(data[0].id);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load events");
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        if (!selectedEventId) {
            return;
        }

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getEventDashboard(selectedEventId);
                setDashboard(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [selectedEventId]);

    return (
        <div>
            <h1>Event Finance Dashboard</h1>

            <div>
                <label htmlFor="event">Select Event: </label>

                <select
                    id="event"
                    value={selectedEventId}
                    onChange={(event) =>
                        setSelectedEventId(event.target.value)
                    }
                >
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>
                            {event.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading && <p>Loading dashboard...</p>}

            {error && <p>{error}</p>}

            {!loading && dashboard && (
                <div>
                    <h2>{dashboard.eventName}</h2>

                    <p>Budget: ₹{dashboard.budget}</p>

                    <p>
                        Budget Remaining: ₹{dashboard.budgetRemaining}
                    </p>

                    <p>
                        Total Collected: ₹{dashboard.totalCollected}
                    </p>

                    <p>
                        Total Expenses: ₹{dashboard.totalExpenses}
                    </p>

                    <p>Balance: ₹{dashboard.balance}</p>

                    <hr />

                    <p>Cash: ₹{dashboard.cashCollected}</p>
                    <p>UPI: ₹{dashboard.upiCollected}</p>
                    <p>Bank: ₹{dashboard.bankCollected}</p>

                    <hr />

                    <p>
                        Contributions: {dashboard.contributionCount}
                    </p>

                    <p>Expenses: {dashboard.expenseCount}</p>

                    <p>
                        Unique Contributors:{" "}
                        {dashboard.uniqueContributorCount}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;