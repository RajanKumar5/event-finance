import { useEffect, useState } from "react";
import { getEventDashboard } from "../api/dashboardApi";
import DashboardCard from "../components/DashboardCard";
import { useEvent } from "../context/EventContext";

const Dashboard = () => {
    const { selectedEventId } = useEvent();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>Event Finance</h1>
                    <p>Track collections, expenses, and event balance</p>
                </div>
            </div>

            {loading && <p>Loading dashboard...</p>}

            {error && <p>{error}</p>}

            {!loading && dashboard && (
                <>
                    <h2>{dashboard.eventName}</h2>

                    <div className="dashboard-grid">
                        <DashboardCard
                            title="Total Collected"
                            value={`₹${dashboard.totalCollected}`}
                        />

                        <DashboardCard
                            title="Total Expenses"
                            value={`₹${dashboard.totalExpenses}`}
                        />

                        <DashboardCard
                            title="Current Balance"
                            value={`₹${dashboard.balance}`}
                        />

                        <DashboardCard
                            title="Budget"
                            value={`₹${dashboard.budget}`}
                        />

                        <DashboardCard
                            title="Budget Remaining"
                            value={`₹${dashboard.budgetRemaining}`}
                        />

                        <DashboardCard
                            title="Contributors"
                            value={dashboard.uniqueContributorCount}
                        />
                    </div>

                    <h2>Collection Breakdown</h2>

                    <div className="dashboard-grid">
                        <DashboardCard
                            title="Cash"
                            value={`₹${dashboard.cashCollected}`}
                        />

                        <DashboardCard
                            title="UPI"
                            value={`₹${dashboard.upiCollected}`}
                        />

                        <DashboardCard
                            title="Bank"
                            value={`₹${dashboard.bankCollected}`}
                        />

                        <DashboardCard
                            title="Contributions"
                            value={dashboard.contributionCount}
                        />

                        <DashboardCard
                            title="Expenses"
                            value={dashboard.expenseCount}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;