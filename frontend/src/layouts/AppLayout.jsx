import {
    NavLink,
    Outlet,
} from "react-router-dom";

import { useEvent } from "../context/EventContext";

import "./AppLayout.css";

const NAV_ITEMS = [
    {
        path: "/events",
        desktopLabel: "Events",
        mobileLabel: "Events",
    },
    {
        path: "/dashboard",
        desktopLabel: "Dashboard",
        mobileLabel: "Dashboard",
    },
    {
        path: "/contributors",
        desktopLabel: "Contributors",
        mobileLabel: "People",
    },
    {
        path: "/contributions",
        desktopLabel: "Contributions",
        mobileLabel: "Collections",
    },
    {
        path: "/contributor-status",
        desktopLabel: "Contributor Status",
        mobileLabel: "Status",
    },
    {
        path: "/contributor-history",
        desktopLabel: "Contributor History",
        mobileLabel: "History",
    },
    {
        path: "/expenses",
        desktopLabel: "Expenses",
        mobileLabel: "Expenses",
    },
    {
        path: "/reports",
        desktopLabel: "Reports",
        mobileLabel: "Reports",
    },
    {
        path: "/settings",
        desktopLabel: "Settings",
        mobileLabel: "Settings",
    },
];

const AppLayout = () => {
    const {
        events,
        selectedEventId,
        setSelectedEventId,
        loadingEvents,
    } = useEvent();

    const renderEventSelector = (
        id
    ) => {
        if (loadingEvents) {
            return (
                <p className="event-selector-message">
                    Loading events...
                </p>
            );
        }

        if (events.length === 0) {
            return (
                <p className="event-selector-message">
                    No events available
                </p>
            );
        }

        return (
            <select
                id={id}
                value={
                    selectedEventId || ""
                }
                onChange={(event) =>
                    setSelectedEventId(
                        event.target.value
                    )
                }
            >
                {events.map(
                    (event) => (
                        <option
                            key={
                                event.id
                            }
                            value={
                                event.id
                            }
                        >
                            {
                                event.name
                            }
                        </option>
                    )
                )}
            </select>
        );
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="sidebar-logo">
                    Event Finance
                </h2>

                <div className="event-selector desktop-event-selector">
                    <label htmlFor="desktopEvent">
                        Current Event
                    </label>

                    {renderEventSelector(
                        "desktopEvent"
                    )}
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(
                        (item) => (
                            <NavLink
                                key={
                                    item.path
                                }
                                to={
                                    item.path
                                }
                            >
                                <span className="nav-label-desktop">
                                    {
                                        item.desktopLabel
                                    }
                                </span>

                                <span className="nav-label-mobile">
                                    {
                                        item.mobileLabel
                                    }
                                </span>
                            </NavLink>
                        )
                    )}
                </nav>
            </aside>

            <main className="app-content">
                <div className="mobile-event-selector">
                    <label htmlFor="mobileEvent">
                        Current Event
                    </label>

                    {renderEventSelector(
                        "mobileEvent"
                    )}
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;