import { useEffect, useState } from "react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { getEventDashboard } from "../api/dashboardApi";
import DashboardCard from "../components/DashboardCard";
import { useEvent } from "../context/EventContext";

const PAYMENT_COLORS = [
    "#16a34a",
    "#4f46e5",
    "#0284c7",
];

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;

const formatCompactCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            notation: "compact",
            maximumFractionDigits: 1,
        }
    )}`;

const formatTrendDate = (date) => {
    if (!date) {
        return "";
    }

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
        }
    );
};

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

        const fetchDashboard =
            async () => {
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
                        err.response?.data
                            ?.message ||
                        "Failed to load dashboard"
                    );

                    setDashboard(null);
                } finally {
                    setLoading(false);
                }
            };

        fetchDashboard();
    }, [selectedEventId]);

    const collectionPieData =
        dashboard
            ? [
                {
                    name: "Cash",
                    value: Number(
                        dashboard.cashCollected ||
                        0
                    ),
                },
                {
                    name: "UPI",
                    value: Number(
                        dashboard.upiCollected ||
                        0
                    ),
                },
                {
                    name: "Bank",
                    value: Number(
                        dashboard.bankCollected ||
                        0
                    ),
                },
            ].filter(
                (item) =>
                    item.value > 0
            )
            : [];

    const paymentComparisonData =
        dashboard
            ? [
                {
                    mode: "Cash",

                    collected:
                        Number(
                            dashboard.cashCollected ||
                            0
                        ),

                    expenses:
                        Number(
                            dashboard.cashExpenses ||
                            0
                        ),
                },
                {
                    mode: "UPI",

                    collected:
                        Number(
                            dashboard.upiCollected ||
                            0
                        ),

                    expenses:
                        Number(
                            dashboard.upiExpenses ||
                            0
                        ),
                },
                {
                    mode: "Bank",

                    collected:
                        Number(
                            dashboard.bankCollected ||
                            0
                        ),

                    expenses:
                        Number(
                            dashboard.bankExpenses ||
                            0
                        ),
                },
            ]
            : [];

    const dailyTrendData =
        dashboard?.dailyTrend?.map(
            (item) => ({
                date: item.date,

                displayDate:
                    formatTrendDate(
                        item.date
                    ),

                collected:
                    Number(
                        item.collected ||
                        0
                    ),

                expenses:
                    Number(
                        item.expenses ||
                        0
                    ),
            })
        ) || [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h1>
                        Event Finance
                    </h1>

                    <p>
                        Track collections,
                        expenses, and event
                        balance
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

            {!loading &&
                dashboard && (
                    <>
                        <div className="dashboard-event-heading">
                            <h2>
                                {
                                    dashboard.eventName
                                }
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
                                value={formatCurrency(
                                    dashboard.totalCollected
                                )}
                            />

                            <DashboardCard
                                title="Total Expenses"
                                value={formatCurrency(
                                    dashboard.totalExpenses
                                )}
                            />

                            <DashboardCard
                                title="Current Balance"
                                value={formatCurrency(
                                    dashboard.balance
                                )}
                            />

                            <DashboardCard
                                title="Budget"
                                value={
                                    dashboard.budget !=
                                        null
                                        ? formatCurrency(
                                            dashboard.budget
                                        )
                                        : "-"
                                }
                            />

                            <DashboardCard
                                title="Budget Remaining"
                                value={
                                    dashboard.budgetRemaining !=
                                        null
                                        ? formatCurrency(
                                            dashboard.budgetRemaining
                                        )
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
                            Financial Trend
                        </h2>

                        <div className="dashboard-chart-card dashboard-line-chart-card">
                            <div className="dashboard-chart-header">
                                <div>
                                    <h3>
                                        Collections
                                        and Expenses
                                        Over Time
                                    </h3>

                                    <p>
                                        Daily financial
                                        activity for
                                        this event
                                    </p>
                                </div>
                            </div>

                            {dailyTrendData.length >
                                0 ? (
                                <div className="trend-chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={
                                                dailyTrendData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 20,
                                                left: 5,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={
                                                    false
                                                }
                                            />

                                            <XAxis
                                                dataKey="displayDate"
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                                minTickGap={
                                                    25
                                                }
                                            />

                                            <YAxis
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                                tickFormatter={
                                                    formatCompactCurrency
                                                }
                                            />

                                            <Tooltip
                                                formatter={(
                                                    value,
                                                    name
                                                ) => [
                                                        formatCurrency(
                                                            value
                                                        ),

                                                        name ===
                                                            "collected"
                                                            ? "Collected"
                                                            : "Expenses",
                                                    ]}
                                                labelFormatter={(
                                                    label
                                                ) =>
                                                    `Date: ${label}`
                                                }
                                            />

                                            <Legend
                                                formatter={(
                                                    value
                                                ) =>
                                                    value ===
                                                        "collected"
                                                        ? "Collected"
                                                        : "Expenses"
                                                }
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="collected"
                                                stroke="#16a34a"
                                                strokeWidth={
                                                    3
                                                }
                                                dot={{
                                                    r: 4,
                                                }}
                                                activeDot={{
                                                    r: 6,
                                                }}
                                                connectNulls
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="expenses"
                                                stroke="#ea580c"
                                                strokeWidth={
                                                    3
                                                }
                                                dot={{
                                                    r: 4,
                                                }}
                                                activeDot={{
                                                    r: 6,
                                                }}
                                                connectNulls
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="chart-empty-state">
                                    No financial
                                    activity
                                    available yet.
                                </div>
                            )}
                        </div>

                        <h2 className="dashboard-section-title">
                            Financial Overview
                        </h2>

                        <div className="dashboard-charts-grid">
                            <div className="dashboard-chart-card">
                                <div className="dashboard-chart-header">
                                    <div>
                                        <h3>
                                            Collection
                                            Distribution
                                        </h3>

                                        <p>
                                            Contributions
                                            grouped by
                                            payment
                                            mode
                                        </p>
                                    </div>
                                </div>

                                {collectionPieData.length >
                                    0 ? (
                                    <div className="chart-container">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={
                                                        collectionPieData
                                                    }
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={
                                                        55
                                                    }
                                                    outerRadius={
                                                        90
                                                    }
                                                    paddingAngle={
                                                        3
                                                    }
                                                    label={({
                                                        name,
                                                        percent,
                                                    }) =>
                                                        `${name} ${(
                                                            percent *
                                                            100
                                                        ).toFixed(
                                                            0
                                                        )}%`
                                                    }
                                                >
                                                    {collectionPieData.map(
                                                        (
                                                            entry,
                                                            index
                                                        ) => (
                                                            <Cell
                                                                key={
                                                                    entry.name
                                                                }
                                                                fill={
                                                                    PAYMENT_COLORS[
                                                                    index %
                                                                    PAYMENT_COLORS.length
                                                                    ]
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>

                                                <Tooltip
                                                    formatter={(
                                                        value
                                                    ) =>
                                                        formatCurrency(
                                                            value
                                                        )
                                                    }
                                                />

                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="chart-empty-state">
                                        No collection
                                        data available
                                        yet.
                                    </div>
                                )}
                            </div>

                            <div className="dashboard-chart-card">
                                <div className="dashboard-chart-header">
                                    <div>
                                        <h3>
                                            Collected
                                            vs Expenses
                                        </h3>

                                        <p>
                                            Payment mode
                                            comparison
                                        </p>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={
                                                paymentComparisonData
                                            }
                                            margin={{
                                                top: 10,
                                                right: 10,
                                                left: 0,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={
                                                    false
                                                }
                                            />

                                            <XAxis
                                                dataKey="mode"
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                            />

                                            <YAxis
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                                tickFormatter={
                                                    formatCompactCurrency
                                                }
                                            />

                                            <Tooltip
                                                formatter={(
                                                    value,
                                                    name
                                                ) => [
                                                        formatCurrency(
                                                            value
                                                        ),

                                                        name ===
                                                            "collected"
                                                            ? "Collected"
                                                            : "Expenses",
                                                    ]}
                                            />

                                            <Legend
                                                formatter={(
                                                    value
                                                ) =>
                                                    value ===
                                                        "collected"
                                                        ? "Collected"
                                                        : "Expenses"
                                                }
                                            />

                                            <Bar
                                                dataKey="collected"
                                                fill="#16a34a"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0,
                                                ]}
                                            />

                                            <Bar
                                                dataKey="expenses"
                                                fill="#ea580c"
                                                radius={[
                                                    6,
                                                    6,
                                                    0,
                                                    0,
                                                ]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <h2 className="dashboard-section-title">
                            Payment Mode
                            Breakdown
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
                                        {formatCurrency(
                                            dashboard.cashCollected
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-breakdown-row">
                                    <span>
                                        Expenses
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            dashboard.cashExpenses
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-breakdown-row payment-balance-row">
                                    <span>
                                        Balance
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            dashboard.cashBalance
                                        )}
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
                                        {formatCurrency(
                                            dashboard.upiCollected
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-breakdown-row">
                                    <span>
                                        Expenses
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            dashboard.upiExpenses
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-breakdown-row payment-balance-row">
                                    <span>
                                        Balance
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            dashboard.upiBalance
                                        )}
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
                                        {formatCurrency(
                                            dashboard.bankCollected
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-breakdown-row">
                                    <span>
                                        Expenses
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            dashboard.bankExpenses
                                        )}
                                    </strong>
                                </div>

                                <div className="payment-breakdown-row payment-balance-row">
                                    <span>
                                        Balance
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            dashboard.bankBalance
                                        )}
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