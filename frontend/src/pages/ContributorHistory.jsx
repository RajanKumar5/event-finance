import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getAllContributors,
} from "../api/contributorApi";

import {
    getContributionsByEvent,
} from "../api/contributionApi";

import { useEvent } from "../context/EventContext";

import "./ContributorHistory.css";

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            maximumFractionDigits: 2,
        }
    )}`;

const formatDate = (date) => {
    if (!date) {
        return "-";
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

const ContributorHistory = () => {
    const { events } = useEvent();

    const [
        contributors,
        setContributors,
    ] = useState([]);

    const [
        allContributions,
        setAllContributions,
    ] = useState([]);

    const [
        selectedContributorId,
        setSelectedContributorId,
    ] = useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const contributorData =
                    await getAllContributors();

                setContributors(
                    contributorData
                );

                if (
                    contributorData.length >
                    0
                ) {
                    setSelectedContributorId(
                        String(
                            contributorData[0]
                                .id
                        )
                    );
                }

                if (
                    !events ||
                    events.length === 0
                ) {
                    setAllContributions(
                        []
                    );

                    return;
                }

                const eventContributionResults =
                    await Promise.all(
                        events.map(
                            async (
                                event
                            ) => {
                                const data =
                                    await getContributionsByEvent(
                                        event.id
                                    );

                                return data.map(
                                    (
                                        contribution
                                    ) => ({
                                        ...contribution,

                                        eventId:
                                            event.id,

                                        eventName:
                                            contribution.eventName ||
                                            event.name,
                                    })
                                );
                            }
                        )
                    );

                setAllContributions(
                    eventContributionResults.flat()
                );
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data
                        ?.message ||
                    "Failed to load contributor history"
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [events]);

    const selectedContributor =
        useMemo(() => {
            return contributors.find(
                (contributor) =>
                    String(
                        contributor.id
                    ) ===
                    String(
                        selectedContributorId
                    )
            );
        }, [
            contributors,
            selectedContributorId,
        ]);

    const contributorContributions =
        useMemo(() => {
            return allContributions
                .filter(
                    (contribution) =>
                        String(
                            contribution.contributorId
                        ) ===
                        String(
                            selectedContributorId
                        )
                )
                .sort(
                    (
                        first,
                        second
                    ) =>
                        second.paymentDate.localeCompare(
                            first.paymentDate
                        )
                );
        }, [
            allContributions,
            selectedContributorId,
        ]);

    const lifetimeTotal =
        useMemo(() => {
            return contributorContributions.reduce(
                (
                    total,
                    contribution
                ) =>
                    total +
                    Number(
                        contribution.amountPaid ||
                        0
                    ),
                0
            );
        }, [
            contributorContributions,
        ]);

    const eventSummary =
        useMemo(() => {
            const summaryMap =
                new Map();

            contributorContributions.forEach(
                (contribution) => {
                    const key =
                        String(
                            contribution.eventId
                        );

                    const existing =
                        summaryMap.get(
                            key
                        ) || {
                            eventId:
                                contribution.eventId,

                            eventName:
                                contribution.eventName ||
                                "Event",

                            total:
                                0,

                            contributionCount:
                                0,

                            cash:
                                0,

                            upi:
                                0,

                            bank:
                                0,
                        };

                    const amount =
                        Number(
                            contribution.amountPaid ||
                            0
                        );

                    existing.total +=
                        amount;

                    existing.contributionCount +=
                        1;

                    if (
                        contribution.paymentMode ===
                        "CASH"
                    ) {
                        existing.cash +=
                            amount;
                    }

                    if (
                        contribution.paymentMode ===
                        "UPI"
                    ) {
                        existing.upi +=
                            amount;
                    }

                    if (
                        contribution.paymentMode ===
                        "BANK"
                    ) {
                        existing.bank +=
                            amount;
                    }

                    summaryMap.set(
                        key,
                        existing
                    );
                }
            );

            return Array.from(
                summaryMap.values()
            ).sort(
                (
                    first,
                    second
                ) =>
                    second.total -
                    first.total
            );
        }, [
            contributorContributions,
        ]);

    const paymentSummary =
        useMemo(() => {
            return contributorContributions.reduce(
                (
                    summary,
                    contribution
                ) => {
                    const amount =
                        Number(
                            contribution.amountPaid ||
                            0
                        );

                    if (
                        contribution.paymentMode ===
                        "CASH"
                    ) {
                        summary.cash +=
                            amount;
                    }

                    if (
                        contribution.paymentMode ===
                        "UPI"
                    ) {
                        summary.upi +=
                            amount;
                    }

                    if (
                        contribution.paymentMode ===
                        "BANK"
                    ) {
                        summary.bank +=
                            amount;
                    }

                    return summary;
                },
                {
                    cash: 0,
                    upi: 0,
                    bank: 0,
                }
            );
        }, [
            contributorContributions,
        ]);

    if (loading) {
        return (
            <div className="page-container">
                <p>
                    Loading contributor
                    history...
                </p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>
                        Contributor History
                    </h1>

                    <p>
                        View lifetime
                        contribution history
                        across all events
                    </p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {contributors.length ===
                0 ? (
                <div className="info-message">
                    No contributors
                    available.
                </div>
            ) : (
                <>
                    <div className="contributor-history-selector-card">
                        <div className="contributor-history-selector">
                            <label
                                htmlFor="historyContributor"
                            >
                                Contributor
                            </label>

                            <select
                                id="historyContributor"
                                value={
                                    selectedContributorId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedContributorId(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                {contributors.map(
                                    (
                                        contributor
                                    ) => (
                                        <option
                                            key={
                                                contributor.id
                                            }
                                            value={
                                                contributor.id
                                            }
                                        >
                                            {
                                                contributor.name
                                            }
                                            {" - "}
                                            {
                                                contributor.address
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {selectedContributor && (
                            <div className="contributor-history-person">
                                <div>
                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {
                                            selectedContributor.name
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Address
                                    </span>

                                    <strong>
                                        {
                                            selectedContributor.address
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {selectedContributor.phone ||
                                            "-"}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="contributor-history-summary-grid">
                        <div className="contributor-history-summary-card">
                            <span>
                                Lifetime
                                Contribution
                            </span>

                            <strong>
                                {formatCurrency(
                                    lifetimeTotal
                                )}
                            </strong>
                        </div>

                        <div className="contributor-history-summary-card">
                            <span>
                                Events
                                Participated
                            </span>

                            <strong>
                                {
                                    eventSummary.length
                                }
                            </strong>
                        </div>

                        <div className="contributor-history-summary-card">
                            <span>
                                Total
                                Contributions
                            </span>

                            <strong>
                                {
                                    contributorContributions.length
                                }
                            </strong>
                        </div>

                        <div className="contributor-history-summary-card">
                            <span>
                                Average
                                Contribution
                            </span>

                            <strong>
                                {formatCurrency(
                                    contributorContributions.length >
                                        0
                                        ? lifetimeTotal /
                                        contributorContributions.length
                                        : 0
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="contributor-history-payment-grid">
                        <div className="history-payment-card">
                            <span>
                                Cash
                            </span>

                            <strong>
                                {formatCurrency(
                                    paymentSummary.cash
                                )}
                            </strong>
                        </div>

                        <div className="history-payment-card">
                            <span>
                                UPI
                            </span>

                            <strong>
                                {formatCurrency(
                                    paymentSummary.upi
                                )}
                            </strong>
                        </div>

                        <div className="history-payment-card">
                            <span>
                                Bank
                            </span>

                            <strong>
                                {formatCurrency(
                                    paymentSummary.bank
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="table-card">
                        <h2>
                            Event-wise Summary
                        </h2>

                        {eventSummary.length ===
                            0 ? (
                            <p>
                                This contributor
                                has not made any
                                contributions yet.
                            </p>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                Event
                                            </th>

                                            <th>
                                                Contributions
                                            </th>

                                            <th>
                                                Cash
                                            </th>

                                            <th>
                                                UPI
                                            </th>

                                            <th>
                                                Bank
                                            </th>

                                            <th>
                                                Total
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {eventSummary.map(
                                            (
                                                summary
                                            ) => (
                                                <tr
                                                    key={
                                                        summary.eventId
                                                    }
                                                >
                                                    <td>
                                                        {
                                                            summary.eventName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            summary.contributionCount
                                                        }
                                                    </td>

                                                    <td>
                                                        {formatCurrency(
                                                            summary.cash
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatCurrency(
                                                            summary.upi
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatCurrency(
                                                            summary.bank
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatCurrency(
                                                                summary.total
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="table-card">
                        <h2>
                            Contribution
                            Transactions
                        </h2>

                        {contributorContributions.length ===
                            0 ? (
                            <p>
                                No contribution
                                transactions found.
                            </p>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Event
                                            </th>

                                            <th>
                                                Receipt
                                            </th>

                                            <th>
                                                Payment
                                                Mode
                                            </th>

                                            <th>
                                                Amount
                                            </th>

                                            <th>
                                                Reference
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {contributorContributions.map(
                                            (
                                                contribution
                                            ) => (
                                                <tr
                                                    key={
                                                        contribution.id
                                                    }
                                                >
                                                    <td>
                                                        {formatDate(
                                                            contribution.paymentDate
                                                        )}
                                                    </td>

                                                    <td>
                                                        {
                                                            contribution.eventName
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            contribution.receiptNumber
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            contribution.paymentMode
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatCurrency(
                                                                contribution.amountPaid
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {contribution.paymentReference ||
                                                            "-"}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ContributorHistory;