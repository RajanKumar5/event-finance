import { useEffect, useState } from "react";

import { getEventDashboard } from "../api/dashboardApi";
import DashboardCard from "../components/DashboardCard";
import { useEvent } from "../context/EventContext";

const Dashboard = () => {
    const {
        selectedEventId,
        selectedEvent,
    } = useEvent();

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!selectedEventId) {
            setDashboard(null);
            return;
        }

        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getEventDashboard(
                        selectedEventId
                    );

                setDashboard(data);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard"
                );

                setDashboard(null);
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
                    <h1>
                        Event Finance
                    </h1>

                    <p>
                        Track collections, expenses,
                        and event balance
                    </p>
                </div>
            </div>

            {loading && (
                <p>
                    Loading dashboard...
                </p>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!loading && dashboard && (
                <>
                    <div className="dashboard-event-heading">
                        <h2>
                            {dashboard.eventName}
                        </h2>

                        {selectedEvent && (
                            <span
                                className={`status-badge status-${selectedEvent.status.toLowerCase()}`}
                            >
                                {
                                    selectedEvent.status
                                }
                            </span>
                        )}
                    </div>

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
                            value={
                                dashboard.budget != null
                                    ? `₹${dashboard.budget}`
                                    : "-"
                            }
                        />

                        <DashboardCard
                            title="Budget Remaining"
                            value={
                                dashboard.budgetRemaining != null
                                    ? `₹${dashboard.budgetRemaining}`
                                    : "-"
                            }
                        />

                        <DashboardCard
                            title="Total Contributors"
                            value={
                                dashboard.totalContributorCount
                            }
                        />
                    </div>

                    <h2 className="dashboard-section-title">
                        Payment Mode Breakdown
                    </h2>

                    <div className="payment-breakdown-grid">
                        <div className="payment-breakdown-card">
                            <div className="payment-breakdown-header">
                                <h3>
                                    Cash
                                </h3>
                            </div>

                            <div className="payment-breakdown-row">
                                <span>
                                    Collected
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.cashCollected
                                    }
                                </strong>
                            </div>

                            <div className="payment-breakdown-row">
                                <span>
                                    Expenses
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.cashExpenses
                                    }
                                </strong>
                            </div>

                            <div className="payment-breakdown-row payment-balance-row">
                                <span>
                                    Balance
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.cashBalance
                                    }
                                </strong>
                            </div>
                        </div>

                        <div className="payment-breakdown-card">
                            <div className="payment-breakdown-header">
                                <h3>
                                    UPI
                                </h3>
                            </div>

                            <div className="payment-breakdown-row">
                                <span>
                                    Collected
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.upiCollected
                                    }
                                </strong>
                            </div>

                            <div className="payment-breakdown-row">
                                <span>
                                    Expenses
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.upiExpenses
                                    }
                                </strong>
                            </div>

                            <div className="payment-breakdown-row payment-balance-row">
                                <span>
                                    Balance
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.upiBalance
                                    }
                                </strong>
                            </div>
                        </div>

                        <div className="payment-breakdown-card">
                            <div className="payment-breakdown-header">
                                <h3>
                                    Bank
                                </h3>
                            </div>

                            <div className="payment-breakdown-row">
                                <span>
                                    Collected
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.bankCollected
                                    }
                                </strong>
                            </div>

                            <div className="payment-breakdown-row">
                                <span>
                                    Expenses
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.bankExpenses
                                    }
                                </strong>
                            </div>

                            <div className="payment-breakdown-row payment-balance-row">
                                <span>
                                    Balance
                                </span>

                                <strong>
                                    ₹
                                    {
                                        dashboard.bankBalance
                                    }
                                </strong>
                            </div>
                        </div>
                    </div>

                    <h2 className="dashboard-section-title">
                        Activity Summary
                    </h2>

                    <div className="dashboard-grid">
                        <DashboardCard
                            title="Contributions"
                            value={
                                dashboard.contributionCount
                            }
                        />

                        <DashboardCard
                            title="Contributors Paid"
                            value={
                                dashboard.uniqueContributorCount
                            }
                        />

                        <DashboardCard
                            title="Expenses"
                            value={
                                dashboard.expenseCount
                            }
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;