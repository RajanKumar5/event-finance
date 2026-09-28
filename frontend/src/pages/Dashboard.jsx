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
import "./Dashboard.css";

const PAYMENT_COLORS = [
    "#16a34a",
    "#4f46e5",
    "#0284c7",
];

const EXPENSE_COLORS = [
    "#ea580c",
    "#f59e0b",
    "#dc2626",
    "#7c3aed",
    "#0284c7",
    "#16a34a",
    "#db2777",
    "#0891b2",
    "#9333ea",
    "#65a30d",
    "#475569",
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

const formatFullDate = (date) => {
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
            year: "numeric",
        }
    );
};

const formatCategory = (category) =>
    category?.replaceAll("_", " ") || "";

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

    const [fromDate, setFromDate] =
        useState("");

    const [toDate, setToDate] =
        useState("");

    const [
        appliedFromDate,
        setAppliedFromDate,
    ] = useState("");

    const [
        appliedToDate,
        setAppliedToDate,
    ] = useState("");

    const loadDashboard = async (
        eventId,
        rangeFromDate = "",
        rangeToDate = ""
    ) => {
        if (!eventId) {
            setDashboard(null);
            return false;
        }

        try {
            setLoading(true);
            setError("");

            const data =
                await getEventDashboard(
                    eventId,
                    rangeFromDate,
                    rangeToDate
                );

            setDashboard(data);

            return true;
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load dashboard"
            );

            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setFromDate("");
        setToDate("");
        setAppliedFromDate("");
        setAppliedToDate("");

        if (!selectedEventId) {
            setDashboard(null);
            return;
        }

        loadDashboard(selectedEventId);
    }, [selectedEventId]);

    const handleApplyDateFilter = async (
        event
    ) => {
        event.preventDefault();

        if (
            fromDate &&
            toDate &&
            fromDate > toDate
        ) {
            setError(
                "From date cannot be after To date"
            );
            return;
        }

        const success =
            await loadDashboard(
                selectedEventId,
                fromDate,
                toDate
            );

        if (success) {
            setAppliedFromDate(fromDate);
            setAppliedToDate(toDate);
        }
    };

    const handleClearDateFilter =
        async () => {
            setFromDate("");
            setToDate("");
            setAppliedFromDate("");
            setAppliedToDate("");

            await loadDashboard(
                selectedEventId
            );
        };

    const dateFilterActive =
        appliedFromDate !== "" ||
        appliedToDate !== "";

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
                    collected: Number(
                        dashboard.cashCollected ||
                        0
                    ),
                    expenses: Number(
                        dashboard.cashExpenses ||
                        0
                    ),
                },
                {
                    mode: "UPI",
                    collected: Number(
                        dashboard.upiCollected ||
                        0
                    ),
                    expenses: Number(
                        dashboard.upiExpenses ||
                        0
                    ),
                },
                {
                    mode: "Bank",
                    collected: Number(
                        dashboard.bankCollected ||
                        0
                    ),
                    expenses: Number(
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

    const areaCollectionData =
        dashboard?.areaCollections?.map(
            (item) => ({
                area: item.area,
                collected:
                    Number(
                        item.totalCollected ||
                        0
                    ),
                contributorCount:
                    Number(
                        item.contributorCount ||
                        0
                    ),
            })
        ) || [];

    const expenseCategoryData =
        dashboard?.expenseCategories
            ?.map(
                (item) => ({
                    category:
                        formatCategory(
                            item.category
                        ),
                    value:
                        Number(
                            item.totalExpense ||
                            0
                        ),
                    expenseCount:
                        Number(
                            item.expenseCount ||
                            0
                        ),
                })
            )
            .filter(
                (item) =>
                    item.value > 0
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

            {dashboard && (
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
            )}

            {selectedEventId && (
                <form
                    className="dashboard-date-filter"
                    onSubmit={
                        handleApplyDateFilter
                    }
                >
                    <div className="dashboard-date-filter-heading">
                        <div>
                            <h3>
                                Dashboard Date Range
                            </h3>

                            <p>
                                Filter financial
                                activity and analytics
                                by transaction date.
                            </p>
                        </div>

                        {dateFilterActive && (
                            <span className="dashboard-filter-active-badge">
                                Filtered
                            </span>
                        )}
                    </div>

                    <div className="dashboard-date-filter-controls">
                        <div className="dashboard-date-field">
                            <label
                                htmlFor="dashboardFromDate"
                            >
                                From Date
                            </label>

                            <input
                                id="dashboardFromDate"
                                type="date"
                                value={fromDate}
                                max={
                                    toDate ||
                                    undefined
                                }
                                onChange={(
                                    event
                                ) =>
                                    setFromDate(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />
                        </div>

                        <div className="dashboard-date-field">
                            <label
                                htmlFor="dashboardToDate"
                            >
                                To Date
                            </label>

                            <input
                                id="dashboardToDate"
                                type="date"
                                value={toDate}
                                min={
                                    fromDate ||
                                    undefined
                                }
                                onChange={(
                                    event
                                ) =>
                                    setToDate(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />
                        </div>

                        <div className="dashboard-date-filter-actions">
                            <button
                                type="submit"
                                className="primary-button dashboard-filter-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Applying..."
                                    : "Apply Filter"}
                            </button>

                            {(fromDate ||
                                toDate ||
                                dateFilterActive) && (
                                    <button
                                        type="button"
                                        className="secondary-button dashboard-filter-button"
                                        onClick={
                                            handleClearDateFilter
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        Clear
                                    </button>
                                )}
                        </div>
                    </div>

                    {dateFilterActive && (
                        <div className="dashboard-active-range">
                            Showing financial activity
                            {appliedFromDate
                                ? ` from ${formatFullDate(
                                    appliedFromDate
                                )}`
                                : " from the beginning"}
                            {appliedToDate
                                ? ` to ${formatFullDate(
                                    appliedToDate
                                )}`
                                : " to the latest record"}
                            .
                        </div>
                    )}
                </form>
            )}

            {loading && !dashboard && (
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
                !dashboard &&
                !error &&
                selectedEventId && (
                    <p>
                        No dashboard data
                        available.
                    </p>
                )}

            {!selectedEventId && (
                <div className="info-message">
                    Select an event to view its
                    dashboard.
                </div>
            )}

            {dashboard && (
                <>
                    <div className="dashboard-grid">
                        <DashboardCard
                            title={
                                dateFilterActive
                                    ? "Collected in Range"
                                    : "Total Collected"
                            }
                            value={formatCurrency(
                                dashboard.totalCollected
                            )}
                        />

                        <DashboardCard
                            title={
                                dateFilterActive
                                    ? "Expenses in Range"
                                    : "Total Expenses"
                            }
                            value={formatCurrency(
                                dashboard.totalExpenses
                            )}
                        />

                        <DashboardCard
                            title={
                                dateFilterActive
                                    ? "Balance in Range"
                                    : "Current Balance"
                            }
                            value={formatCurrency(
                                dashboard.balance
                            )}
                        />

                        <DashboardCard
                            title="Event Budget"
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
                            title="Event Budget Remaining"
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
                                    Collections and
                                    Expenses Over Time
                                </h3>

                                <p>
                                    Daily financial
                                    activity
                                    {dateFilterActive
                                        ? " for the selected range"
                                        : " for this event"}
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
                                            tickFormatter={
                                                formatCompactCurrency
                                            }
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
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
                                                    name,
                                                ]}
                                        />

                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="collected"
                                            name="Collected"
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
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="expenses"
                                            name="Expenses"
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
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="chart-empty-state">
                                No financial activity
                                is available for this
                                range.
                            </div>
                        )}
                    </div>

                    <h2 className="dashboard-section-title">
                        Collection Analytics
                    </h2>

                    <div className="dashboard-charts-grid">
                        <div className="dashboard-chart-card">
                            <div className="dashboard-chart-header">
                                <div>
                                    <h3>
                                        Area-wise
                                        Collections
                                    </h3>

                                    <p>
                                        Collections
                                        received from
                                        each active area
                                    </p>
                                </div>
                            </div>

                            {areaCollectionData.length >
                                0 ? (
                                <div className="area-chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={
                                                areaCollectionData
                                            }
                                            layout="vertical"
                                            margin={{
                                                top: 5,
                                                right: 20,
                                                left: 5,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={
                                                    false
                                                }
                                            />

                                            <XAxis
                                                type="number"
                                                tickFormatter={
                                                    formatCompactCurrency
                                                }
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                            />

                                            <YAxis
                                                type="category"
                                                dataKey="area"
                                                width={
                                                    45
                                                }
                                                tickLine={
                                                    false
                                                }
                                                axisLine={
                                                    false
                                                }
                                            />

                                            <Tooltip
                                                formatter={(
                                                    value
                                                ) => [
                                                        formatCurrency(
                                                            value
                                                        ),
                                                        "Collected",
                                                    ]}
                                            />

                                            <Bar
                                                dataKey="collected"
                                                name="Collected"
                                                fill="#4f46e5"
                                                radius={[
                                                    0,
                                                    6,
                                                    6,
                                                    0,
                                                ]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="chart-empty-state">
                                    No area collection
                                    data is available
                                    for this range.
                                </div>
                            )}
                        </div>

                        <div className="dashboard-chart-card">
                            <div className="dashboard-chart-header">
                                <div>
                                    <h3>
                                        Expense
                                        Distribution
                                    </h3>

                                    <p>
                                        Spending grouped
                                        by expense
                                        category
                                    </p>
                                </div>
                            </div>

                            {expenseCategoryData.length >
                                0 ? (
                                <div className="chart-container">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    expenseCategoryData
                                                }
                                                dataKey="value"
                                                nameKey="category"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={
                                                    55
                                                }
                                                outerRadius={
                                                    90
                                                }
                                                paddingAngle={
                                                    2
                                                }
                                            >
                                                {expenseCategoryData.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={
                                                                item.category
                                                            }
                                                            fill={
                                                                EXPENSE_COLORS[
                                                                index %
                                                                EXPENSE_COLORS.length
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
                                    No expense category
                                    data is available
                                    for this range.
                                </div>
                            )}
                        </div>
                    </div>

                    <h2 className="dashboard-section-title">
                        Payment Analytics
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
                                        payment mode
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
                                    No collection data
                                    is available for
                                    this range.
                                </div>
                            )}
                        </div>

                        <div className="dashboard-chart-card">
                            <div className="dashboard-chart-header">
                                <div>
                                    <h3>
                                        Collected vs
                                        Expenses
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
                                            tickFormatter={
                                                formatCompactCurrency
                                            }
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                        />

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

                                        <Bar
                                            dataKey="collected"
                                            name="Collected"
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
                                            name="Expenses"
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
                        Payment Mode Breakdown
                    </h2>

                    <div className="payment-breakdown-grid">
                        {[
                            {
                                name: "Cash",
                                collected:
                                    dashboard.cashCollected,
                                expenses:
                                    dashboard.cashExpenses,
                                balance:
                                    dashboard.cashBalance,
                            },
                            {
                                name: "UPI",
                                collected:
                                    dashboard.upiCollected,
                                expenses:
                                    dashboard.upiExpenses,
                                balance:
                                    dashboard.upiBalance,
                            },
                            {
                                name: "Bank",
                                collected:
                                    dashboard.bankCollected,
                                expenses:
                                    dashboard.bankExpenses,
                                balance:
                                    dashboard.bankBalance,
                            },
                        ].map(
                            (item) => (
                                <div
                                    key={
                                        item.name
                                    }
                                    className="payment-breakdown-card"
                                >
                                    <div className="payment-breakdown-header">
                                        <h3>
                                            {
                                                item.name
                                            }
                                        </h3>
                                    </div>

                                    <div className="payment-breakdown-row">
                                        <span>
                                            Collected
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                item.collected
                                            )}
                                        </strong>
                                    </div>

                                    <div className="payment-breakdown-row">
                                        <span>
                                            Expenses
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                item.expenses
                                            )}
                                        </strong>
                                    </div>

                                    <div className="payment-breakdown-row payment-balance-row">
                                        <span>
                                            Balance
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                item.balance
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <h2 className="dashboard-section-title">
                        Activity Summary
                    </h2>

                    <div className="dashboard-grid">
                        <DashboardCard
                            title={
                                dateFilterActive
                                    ? "Contributions in Range"
                                    : "Contributions"
                            }
                            value={
                                dashboard.contributionCount
                            }
                        />

                        <DashboardCard
                            title={
                                dateFilterActive
                                    ? "Contributors Paid in Range"
                                    : "Contributors Paid"
                            }
                            value={
                                dashboard.uniqueContributorCount
                            }
                        />

                        <DashboardCard
                            title={
                                dateFilterActive
                                    ? "Expenses in Range"
                                    : "Expenses"
                            }
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
